import { Pattern } from "../../types"

export const productionInfra: Pattern = {
  id: "production-infra",
  order: 7,
  patternName: "Production & Infra",

  philosophy: {
    text: "Just as a lamp does not flicker in a windless place, the disciplined mind, practicing the yoga of the self, remains steady — neither too tight nor too slack.",
    source: "Bhagavad Gita, Chapter 6",
    connection:
      "A production LLM system lives or dies on the same kind of steadiness. Pour every request straight into the largest model and the system flickers under cost and latency; starve it down to the cheapest model and quality collapses. The middle way here is mechanical, not mystical: cache what's already been answered, route easy requests to small models and hard ones to large, smooth bursts with rate limits and batching, and filter what shouldn't be said at all. None of these techniques are clever in isolation — the discipline is in keeping all of them in steady balance, tuned so the system performs the same whether it's serving ten requests a minute or ten thousand.",
  },

  template: {
    description:
      "Before paying for a model call, check whether the answer is already known. An exact cache hashes the normalized prompt and looks up a stored response — useful for repeated identical queries (FAQs, common completions). A semantic cache goes further: it embeds the incoming prompt and checks for a cached entry whose embedding is within some similarity threshold, catching paraphrases of the same question. Both trade a cheap lookup (hash table or vector search) for an expensive model call, and both must define a TTL or invalidation policy so stale answers don't linger.",
    snippet: `def get_response(prompt, cache, embed_fn, similarity_threshold=0.95):
    # 1. Exact match — cheapest possible check
    key = hash(prompt.strip().lower())
    if key in cache.exact:
        return cache.exact[key]

    # 2. Semantic match — catches paraphrases
    query_vec = embed_fn(prompt)
    for cached_vec, cached_response in cache.semantic:
        if cosine_similarity(query_vec, cached_vec) >= similarity_threshold:
            return cached_response

    # 3. Cache miss — call the model and store the result
    response = call_model(prompt)
    cache.exact[key] = response
    cache.semantic.append((query_vec, response))
    return response`,
  },

  pythonTools: [
    {
      name: "functools.lru_cache for exact-match memoization",
      snippet: `from functools import lru_cache

@lru_cache(maxsize=1024)
def cached_completion(prompt: str) -> str:
    return call_model(prompt)`,
    },
    {
      name: "collections.deque as a sliding time window for a token bucket",
      snippet: `from collections import deque
import time

timestamps = deque()
timestamps.append(time.monotonic())
while timestamps and timestamps[0] < time.monotonic() - window_seconds:
    timestamps.popleft()`,
    },
    {
      name: "dataclass for routing decisions between model tiers",
      snippet: `from dataclasses import dataclass

@dataclass
class ModelTier:
    name: str
    max_tokens: int
    cost_per_1k: float`,
    },
  ],

  problems: [
    {
      id: "token-bucket-rate-limiter",
      title: "Implement a Token Bucket Rate Limiter",
      difficulty: "easy",
      prompt:
        "Design a rate limiter for an LLM API client that allows at most `capacity` requests, refilling at `rate` tokens per second. Implement an `allow_request()` method that returns True if a request can proceed (and consumes a token) or False if the caller should back off.",
      patternKeywords: ["rate limiting", "token bucket", "throttling", "API client"],
      solution: `class TokenBucket:
    def __init__(self, capacity, rate):
        self.capacity = capacity
        self.rate = rate
        self.tokens = capacity
        self.last_check = time.monotonic()

    def allow_request(self):
        now = time.monotonic()
        elapsed = now - self.last_check
        self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
        self.last_check = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False`,
      solutionExplanation: [
        "I store `capacity`, `rate`, and a running `tokens` count initialized to `capacity` — the bucket starts full, so the first burst of requests up to `capacity` succeeds immediately. This matches how most LLM provider rate limits actually behave: you get a burst allowance, not just a steady drip.",
        "On every call I compute `elapsed = now - self.last_check` using `time.monotonic()` rather than `time.time()` — monotonic clocks never jump backward due to system clock adjustments, which matters for a long-running service where wall-clock time could be NTP-corrected mid-request.",
        "I refill with `self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)` — lazy refill computed only when `allow_request` is called, rather than running a background thread that ticks every second. This avoids needing a scheduler or thread for something this simple, and the `min()` caps the bucket so idle time doesn't let tokens accumulate without bound.",
        "The check `if self.tokens >= 1` consumes exactly one token per request and returns `True`; otherwise it returns `False` without mutating state, signaling the caller to retry later (typically with exponential backoff). Returning a boolean rather than raising an exception keeps this a cheap, side-effect-free check the caller can poll.",
      ],
      testCase: {
        input: "capacity=2, rate=1 (1 token/sec); calls: allow(), allow(), allow(), [wait 1.0s], allow()",
        expected: "True, True, False, True",
        trace: [
          "init: tokens=2.0",
          "call 1: elapsed≈0, tokens=min(2, 2+0)=2.0 → tokens>=1 → consume → tokens=1.0 → True",
          "call 2: elapsed≈0, tokens=min(2, 1+0)=1.0 → tokens>=1 → consume → tokens=0.0 → True",
          "call 3: elapsed≈0, tokens=min(2, 0+0)=0.0 → tokens<1 → False",
          "wait 1.0s, then call 4: elapsed≈1.0, tokens=min(2, 0+1*1)=1.0 → tokens>=1 → consume → tokens=0.0 → True",
        ],
        traceExplanations: [
          "The bucket starts full at capacity, giving the client an initial burst allowance.",
          "No time has passed, so refill adds ~0. One token is available and gets consumed.",
          "Again negligible elapsed time. The second token is consumed, draining the bucket to empty.",
          "The bucket is empty and no time has passed to refill it, so this request is rejected — the caller should back off.",
          "After waiting one second at a refill rate of 1/sec, exactly one token regenerates, allowing exactly one more request.",
        ],
      },
      blanks: [
        { line: `self.tokens = ___`, answer: "capacity" },
        { line: `elapsed = now - self.___`, answer: "last_check" },
        { line: `self.tokens = min(self.capacity, self.tokens + elapsed * self.___)`, answer: "rate" },
        { line: `if self.tokens >= ___:`, answer: "1" },
        { line: `self.tokens -= ___`, answer: "1" },
      ],
      explanationBlanks: [
        {
          line: "I store `capacity`, `rate`, and a running `tokens` count initialized to `capacity` — the bucket starts full, so the first ___ of requests up to `capacity` succeeds immediately. This matches how most LLM provider rate limits actually behave: you get a burst allowance, not just a steady drip.",
          answer: "burst",
        },
        {
          line: "On every call I compute `elapsed = now - self.last_check` using `time.monotonic()` rather than `time.time()` — monotonic clocks never jump backward due to system clock adjustments, which matters for a long-running service where wall-clock time could be ___ mid-request.",
          answer: "NTP-corrected",
        },
        {
          line: "I refill with `self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)` — ___ refill computed only when `allow_request` is called, rather than running a background thread that ticks every second. This avoids needing a scheduler or thread for something this simple, and the `min()` caps the bucket so idle time doesn't let tokens accumulate without bound.",
          answer: "lazy",
        },
        {
          line: "The check `if self.tokens >= 1` consumes exactly one token per request and returns `True`; otherwise it returns `False` without mutating state, signaling the caller to retry later (typically with exponential ___). Returning a boolean rather than raising an exception keeps this a cheap, side-effect-free check the caller can poll.",
          answer: "backoff",
        },
      ],
    },

    {
      id: "exact-prompt-cache",
      title: "Build an Exact-Match Prompt Cache",
      difficulty: "easy",
      prompt:
        "You're seeing duplicate prompts hit your LLM API, wasting money on identical calls. Write a `cached_call(prompt, model_fn)` function that hashes a normalized version of the prompt and returns a cached response if available, otherwise calls the model and stores the result.",
      patternKeywords: ["caching", "memoization", "hashing", "cost optimization"],
      solution: `_cache = {}

def cached_call(prompt, model_fn):
    normalized = " ".join(prompt.strip().lower().split())
    key = hashlib.sha256(normalized.encode()).hexdigest()
    if key in _cache:
        return _cache[key]
    response = model_fn(prompt)
    _cache[key] = response
    return response`,
      solutionExplanation: [
        "I normalize the prompt with `\" \".join(prompt.strip().lower().split())` — stripping leading/trailing whitespace, lowercasing, and collapsing internal whitespace runs into single spaces. This means '  What is Python?' and 'what is python?' hash to the same key, catching trivial formatting differences that would otherwise cause cache misses on functionally identical prompts.",
        "I hash the normalized string with `hashlib.sha256(...).hexdigest()` rather than using the raw string as a dict key directly. SHA-256 gives a fixed-length key regardless of prompt length — important if prompts can be very long (cache keys stay small and uniform), and it avoids storing potentially sensitive raw prompt text as the dict key in logs or memory dumps.",
        "The lookup `if key in _cache` is an O(1) dict check — this is the entire value proposition of exact caching: a microsecond hash lookup replaces a network round-trip that could cost hundreds of milliseconds and real money.",
        "On a miss, I call `model_fn(prompt)` with the *original* prompt (not the normalized one) — preserving exact formatting in what's sent to the model — but store the result under the normalized key, so future near-identical prompts still hit. I use a module-level dict `_cache` here for simplicity; production systems would back this with Redis or similar with a TTL for invalidation.",
      ],
      testCase: {
        input: `cached_call("  What is the capital of France?  ", model_fn) then cached_call("what is the capital of france?", model_fn)`,
        expected: `"Paris" returned both times, model_fn called only once`,
        trace: [
          'call 1: normalize("  What is the capital of France?  ") -> "what is the capital of france?"',
          "key1 = sha256(normalized) -> not in _cache -> call model_fn -> response='Paris'",
          "_cache[key1] = 'Paris'",
          'call 2: normalize("what is the capital of france?") -> "what is the capital of france?"',
          "key2 = sha256(normalized) -> key2 == key1 -> in _cache -> return 'Paris' without calling model_fn",
        ],
        traceExplanations: [
          "Normalization strips the surrounding whitespace and lowercases the text, producing a canonical form.",
          "The canonical form hasn't been seen, so we pay for a real model call and get back 'Paris'.",
          "We store the response keyed by the hash of the canonical prompt, not the original raw text.",
          "The second prompt differs only in capitalization and whitespace — normalization makes it identical to the first.",
          "Because the normalized forms match, the hashes match, and we return the cached answer for free — this is the cost savings the cache exists to provide.",
        ],
      },
      blanks: [
        { line: `normalized = " ".join(prompt.strip().___().split())`, answer: "lower" },
        { line: `key = hashlib.___(normalized.encode()).hexdigest()`, answer: "sha256" },
        { line: `if key in ___:`, answer: "_cache" },
        { line: `response = model_fn(___)`, answer: "prompt" },
        { line: `_cache[key] = ___`, answer: "response" },
      ],
      explanationBlanks: [
        {
          line: "I normalize the prompt with `\" \".join(prompt.strip().lower().split())` — stripping leading/trailing whitespace, lowercasing, and collapsing internal whitespace runs into single spaces. This means '  What is Python?' and 'what is python?' hash to the same key, catching trivial formatting differences that would otherwise cause cache misses on functionally ___ prompts.",
          answer: "identical",
        },
        {
          line: "I hash the normalized string with `hashlib.sha256(...).hexdigest()` rather than using the raw string as a dict key directly. SHA-256 gives a fixed-length key regardless of prompt length — important if prompts can be very long (cache keys stay small and uniform), and it avoids storing potentially ___ raw prompt text as the dict key in logs or memory dumps.",
          answer: "sensitive",
        },
        {
          line: "The lookup `if key in _cache` is an ___ dict check — this is the entire value proposition of exact caching: a microsecond hash lookup replaces a network round-trip that could cost hundreds of milliseconds and real money.",
          answer: "O(1)",
        },
        {
          line: "On a miss, I call `model_fn(prompt)` with the *original* prompt (not the normalized one) — preserving exact formatting in what's sent to the model — but store the result under the normalized key, so future near-identical prompts still hit. I use a module-level dict `_cache` here for simplicity; production systems would back this with Redis or similar with a ___ for invalidation.",
          answer: "TTL",
        },
      ],
    },

    {
      id: "model-cascade-routing",
      title: "Route Requests Across a Model Cascade",
      difficulty: "medium",
      prompt:
        "You have three models available: a cheap/fast small model, a mid-tier model, and an expensive frontier model. Write a `route_request(prompt, models)` function that estimates prompt complexity and tries the cheapest model first, escalating to the next tier only if the response fails a confidence check, to minimize average cost.",
      patternKeywords: ["model cascading", "cost optimization", "fallback", "confidence check"],
      solution: `def route_request(prompt, models):
    # models = [small, medium, large], ordered cheapest to most capable
    for i, model in enumerate(models):
        response = model.generate(prompt)
        is_last = i == len(models) - 1
        if is_last or response.confidence >= CONFIDENCE_THRESHOLD:
            return response
    return response  # unreachable, satisfies linters`,
      solutionExplanation: [
        "I take `models` as an ordered list from cheapest to most capable, rather than hardcoding three named variables — this makes the cascade configurable and lets the same function work with two tiers or five tiers without changing the logic.",
        "I use `enumerate(models)` so I can check `is_last = i == len(models) - 1` — I need to know if I'm on the final model, because the final model's output must be returned regardless of confidence; there's nothing left to escalate to. Without this check, a low-confidence response from the most capable model would fall through with no return value.",
        "The escalation condition is `if is_last or response.confidence >= CONFIDENCE_THRESHOLD`. I put `is_last` first so Python's short-circuit evaluation skips the confidence check entirely on the last model — though here both branches are cheap, ordering the more 'foundational' condition first keeps the logic readable as 'stop here if we have to, or if it's good enough'.",
        "Each escalation costs strictly more (in latency and dollars) than the previous attempt, so the expected cost is dominated by however many requests are 'easy' enough for the small model — in practice this is the majority, which is the entire economic argument for cascading instead of always calling the frontier model.",
      ],
      testCase: {
        input: `prompt="What's 2+2?", models=[small(conf=0.97), medium(conf=0.6), large(conf=0.99)], CONFIDENCE_THRESHOLD=0.9`,
        expected: "small model's response returned, medium and large never called",
        trace: [
          "i=0, model=small: response = small.generate(prompt), confidence=0.97",
          "is_last = (0 == 2) -> False",
          "0.97 >= 0.9 -> True -> return response from small model",
        ],
        traceExplanations: [
          "We always start with index 0 — the cheapest model — and generate a response.",
          "Index 0 is not the last index (2), so the loop could continue if needed.",
          "But the small model's confidence (0.97) clears the threshold (0.9), so we return immediately — the medium and large models are never invoked, saving their cost entirely.",
        ],
      },
      blanks: [
        { line: `for i, model in ___(models):`, answer: "enumerate" },
        { line: `is_last = i == ___(models) - 1`, answer: "len" },
        { line: `if is_last or response.confidence >= ___:`, answer: "CONFIDENCE_THRESHOLD" },
        { line: `return ___`, answer: "response" },
      ],
      explanationBlanks: [
        {
          line: "I take `models` as an ordered list from cheapest to most capable, rather than hardcoding three named variables — this makes the cascade ___ and lets the same function work with two tiers or five tiers without changing the logic.",
          answer: "configurable",
        },
        {
          line: "I use `enumerate(models)` so I can check `is_last = i == len(models) - 1` — I need to know if I'm on the final model, because the final model's output must be returned regardless of confidence; there's nothing left to ___ to. Without this check, a low-confidence response from the most capable model would fall through with no return value.",
          answer: "escalate",
        },
        {
          line: "The escalation condition is `if is_last or response.confidence >= CONFIDENCE_THRESHOLD`. I put `is_last` first so Python's ___ evaluation skips the confidence check entirely on the last model — though here both branches are cheap, ordering the more 'foundational' condition first keeps the logic readable as 'stop here if we have to, or if it's good enough'.",
          answer: "short-circuit",
        },
        {
          line: "Each escalation costs strictly more (in latency and dollars) than the previous attempt, so the expected cost is dominated by however many requests are 'easy' enough for the small model — in practice this is the majority, which is the entire economic argument for ___ instead of always calling the frontier model.",
          answer: "cascading",
        },
      ],
    },

    {
      id: "content-filter-guardrail",
      title: "Implement a Pre-Generation Content Filter Guardrail",
      difficulty: "medium",
      prompt:
        "Before sending a user prompt to an LLM, you need a guardrail that blocks requests matching a denylist of disallowed topics/patterns and flags requests that exceed a length limit (potential prompt injection via stuffing). Write a `check_guardrails(prompt, denylist)` function returning a result indicating whether the prompt is allowed, and if not, why.",
      patternKeywords: ["guardrails", "content filtering", "prompt injection", "input validation"],
      solution: `def check_guardrails(prompt, denylist, max_length=4000):
    if len(prompt) > max_length:
        return {"allowed": False, "reason": "prompt_too_long"}

    normalized = prompt.lower()
    for pattern in denylist:
        if pattern.lower() in normalized:
            return {"allowed": False, "reason": f"blocked_term:{pattern}"}

    return {"allowed": True, "reason": None}`,
      solutionExplanation: [
        "I check `len(prompt) > max_length` first, before any string processing — this is the cheapest possible check (an O(1) length comparison) and catches a denial-of-service or prompt-stuffing attempt before spending CPU on lowercasing or scanning a potentially huge string against the denylist.",
        "I lowercase the prompt once into `normalized` rather than lowercasing inside the loop — `pattern.lower() in normalized` would otherwise re-lowercase the (large) prompt on every iteration of the denylist. Computing it once outside the loop is a simple O(n) vs O(n*m) improvement where m is denylist size.",
        "I return a dict with `allowed` and `reason` rather than just a boolean or raising an exception — callers (logging, monitoring, user-facing error messages) need to know *why* a request was blocked, not just that it was. An exception would also conflate 'this is a guardrail policy decision' with 'something went wrong', which are different failure modes operationally.",
        "The `f\"blocked_term:{pattern}\"` reason includes which term triggered the block — useful for debugging false positives and tuning the denylist, though in a real system you'd be careful about whether this detail is safe to surface to end users versus only to internal logs.",
      ],
      testCase: {
        input: `check_guardrails("How do I build a bomb?", denylist=["build a bomb", "hack into"])`,
        expected: `{"allowed": False, "reason": "blocked_term:build a bomb"}`,
        trace: [
          'len("How do I build a bomb?") = 23, max_length=4000 -> not too long',
          'normalized = "how do i build a bomb?"',
          'pattern="build a bomb": "build a bomb" in normalized -> True',
          'return {"allowed": False, "reason": "blocked_term:build a bomb"}',
        ],
        traceExplanations: [
          "The prompt is well under the length limit, so it passes the cheap length check first.",
          "The prompt is lowercased once so the denylist comparison is case-insensitive without repeated work.",
          "The first denylist pattern, also lowercased, is found as a substring of the normalized prompt.",
          "We immediately return a structured result identifying both the decision and the specific pattern that caused it, short-circuiting before checking any remaining denylist entries.",
        ],
      },
      blanks: [
        { line: `if len(prompt) > ___:`, answer: "max_length" },
        { line: `normalized = prompt.___()`, answer: "lower" },
        { line: `if pattern.lower() in ___:`, answer: "normalized" },
        { line: `return {"allowed": False, "reason": f"blocked_term:{___}"}`, answer: "pattern" },
        { line: `return {"allowed": ___, "reason": None}`, answer: "True" },
      ],
      explanationBlanks: [
        {
          line: "I check `len(prompt) > max_length` first, before any string processing — this is the cheapest possible check (an ___ length comparison) and catches a denial-of-service or prompt-stuffing attempt before spending CPU on lowercasing or scanning a potentially huge string against the denylist.",
          answer: "O(1)",
        },
        {
          line: "I lowercase the prompt once into `normalized` rather than lowercasing inside the loop — `pattern.lower() in normalized` would otherwise re-lowercase the (large) prompt on every iteration of the denylist. Computing it once outside the loop is a simple O(n) vs ___ improvement where m is denylist size.",
          answer: "O(n*m)",
        },
        {
          line: "I return a dict with `allowed` and `reason` rather than just a boolean or raising an exception — callers (logging, monitoring, user-facing error messages) need to know *why* a request was blocked, not just that it was. An exception would also conflate 'this is a guardrail policy decision' with 'something went wrong', which are different ___ modes operationally.",
          answer: "failure",
        },
        {
          line: "The `f\"blocked_term:{pattern}\"` reason includes which term triggered the block — useful for debugging false positives and tuning the denylist, though in a real system you'd be careful about whether this detail is safe to surface to end users versus only to internal ___.",
          answer: "logs",
        },
      ],
    },

    {
      id: "dynamic-batching-streaming",
      title: "Dynamic Request Batcher with Latency Bound",
      difficulty: "hard",
      prompt:
        "Design a batching layer for an inference server: incoming requests should be grouped into batches to maximize GPU throughput, but no request should wait longer than `max_wait_ms` before its batch is dispatched, even if the batch isn't full. Write a function `should_dispatch(batch, max_batch_size, oldest_request_time, max_wait_ms, now)` that returns True if the current batch should be sent to the model now.",
      patternKeywords: ["batching", "latency optimization", "throughput", "streaming"],
      solution: `def should_dispatch(batch, max_batch_size, oldest_request_time, max_wait_ms, now):
    if not batch:
        return False
    if len(batch) >= max_batch_size:
        return True
    elapsed_ms = (now - oldest_request_time) * 1000
    return elapsed_ms >= max_wait_ms`,
      solutionExplanation: [
        "I check `if not batch: return False` first — an empty batch should never be dispatched, regardless of timers. This guards against a degenerate case where a timer fires but every request in the batch has already been removed (e.g., by a separate timeout/cancellation path).",
        "The size check `len(batch) >= max_batch_size` comes before the time check because it's the throughput-maximizing path: if the batch is already full, there's no benefit to waiting — dispatching immediately both saturates the GPU batch and frees up the queue for new arrivals. This is the 'happy path' for throughput.",
        "I compute `elapsed_ms = (now - oldest_request_time) * 1000` to convert from seconds to milliseconds, matching the units of `max_wait_ms` — this is the latency bound: the *oldest* request in the batch determines when we must dispatch, because that's the request whose user-perceived latency is closest to breaching the SLA.",
        "The final `return elapsed_ms >= max_wait_ms` is the trade-off this whole function encodes: we'd prefer a full batch (better GPU utilization, lower per-request cost), but we cap the wait so no single request's latency degrades unboundedly under low traffic — this is the core tension between throughput optimization and latency guarantees in production inference serving.",
      ],
      testCase: {
        input: "batch has 3 requests (max_batch_size=8), oldest_request_time=100.0, max_wait_ms=50, now=100.06",
        expected: "True",
        trace: [
          "batch is non-empty -> continue",
          "len(batch)=3 >= max_batch_size=8 -> False -> continue to time check",
          "elapsed_ms = (100.06 - 100.0) * 1000 = 60.0",
          "60.0 >= 50 -> True -> dispatch now",
        ],
        traceExplanations: [
          "The batch has requests in it, so we don't short-circuit on emptiness.",
          "The batch is far from full (3 of 8), so throughput alone wouldn't trigger a dispatch yet.",
          "We convert the elapsed wall-clock time of the oldest waiting request from seconds to milliseconds.",
          "60ms have elapsed for the oldest request, exceeding the 50ms latency bound — even though the batch is small, we must dispatch now to honor the latency guarantee, accepting a less efficient (under-filled) batch in exchange for bounded user-facing latency.",
        ],
      },
      blanks: [
        { line: `if not ___: return False`, answer: "batch" },
        { line: `if len(batch) >= ___:`, answer: "max_batch_size" },
        { line: `elapsed_ms = (now - oldest_request_time) * ___`, answer: "1000" },
        { line: `return elapsed_ms >= ___`, answer: "max_wait_ms" },
      ],
      explanationBlanks: [
        {
          line: "I check `if not batch: return False` first — an empty batch should never be dispatched, regardless of timers. This guards against a degenerate case where a timer fires but every request in the batch has already been removed (e.g., by a separate ___/cancellation path).",
          answer: "timeout",
        },
        {
          line: "The size check `len(batch) >= max_batch_size` comes before the time check because it's the throughput-maximizing path: if the batch is already full, there's no benefit to waiting — dispatching immediately both saturates the GPU batch and frees up the queue for new arrivals. This is the 'happy path' for ___.",
          answer: "throughput",
        },
        {
          line: "I compute `elapsed_ms = (now - oldest_request_time) * 1000` to convert from seconds to milliseconds, matching the units of `max_wait_ms` — this is the latency bound: the *oldest* request in the batch determines when we must dispatch, because that's the request whose user-perceived latency is closest to breaching the ___.",
          answer: "SLA",
        },
        {
          line: "The final `return elapsed_ms >= max_wait_ms` is the trade-off this whole function encodes: we'd prefer a full batch (better GPU utilization, lower per-request cost), but we cap the wait so no single request's latency degrades unboundedly under low traffic — this is the core tension between throughput optimization and ___ guarantees in production inference serving.",
          answer: "latency",
        },
      ],
    },
  ],
}
