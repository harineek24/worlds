import { Pattern } from "../../types"

export const evaluationObservability: Pattern = {
  id: "evaluation-observability",
  order: 5,
  patternName: "Evaluation & Observability",

  philosophy: {
    text: "Three times daily I examine myself: in doing things for others, have I been faithful? In intercourse with friends, have I been sincere? Have I practiced what I have been taught?",
    source: "Confucius, The Analects (1.4)",
    connection:
      "Evaluation is institutionalized self-examination — instead of trusting that a model 'feels' correct, you build a daily discipline of checking outputs against a standard, again and again, until the checking itself becomes the safeguard. Viveka, the Sanskrit term for discernment, is the same muscle: the ability to separate the real from the apparent, the grounded claim from the fluent-sounding fabrication. A logging pipeline is just viveka made durable — a record that lets you ask, days later, 'was that actually true, and was I faithful to the data I was given?'",
  },

  template: {
    description:
      "Evaluation turns 'it seems good' into a number you can track over time. The simplest evals compare a model's output against a reference answer using exact match, token overlap (BLEU/ROUGE-style n-gram comparisons), or embedding similarity for semantic closeness. More complex behaviors — helpfulness, tone, faithfulness to source documents — are judged by another LLM (LLM-as-judge) using a rubric prompt. Observability wraps every call with logging: inputs, outputs, latency, token counts, and cost, so regressions can be traced back to a specific prompt version or model change. A/B testing then compares two prompt or model variants on the same eval suite to decide which one ships.",
    snippet: `def exact_match(prediction: str, reference: str) -> bool:
    return prediction.strip().lower() == reference.strip().lower()

def f1_token_overlap(prediction: str, reference: str) -> float:
    pred_tokens = prediction.lower().split()
    ref_tokens = reference.lower().split()
    common = set(pred_tokens) & set(ref_tokens)
    if not common:
        return 0.0
    precision = len(common) / len(pred_tokens)
    recall = len(common) / len(ref_tokens)
    return 2 * precision * recall / (precision + recall)`,
  },

  pythonTools: [
    {
      name: "n-gram overlap (BLEU-ish precision) for generation quality",
      snippet: `def ngram_overlap(prediction: str, reference: str, n: int = 2) -> float:
    pred_tokens = prediction.lower().split()
    ref_tokens = reference.lower().split()
    pred_ngrams = [tuple(pred_tokens[i:i+n]) for i in range(len(pred_tokens) - n + 1)]
    ref_ngrams = set(tuple(ref_tokens[i:i+n]) for i in range(len(ref_tokens) - n + 1))
    if not pred_ngrams:
        return 0.0
    matches = sum(1 for g in pred_ngrams if g in ref_ngrams)
    return matches / len(pred_ngrams)`,
    },
    {
      name: "@trace_call decorator for logging latency, tokens, and cost",
      snippet: `import time
import functools

def trace_call(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = fn(*args, **kwargs)
        elapsed_ms = (time.perf_counter() - start) * 1000
        print(f"[trace] fn={fn.__name__} latency_ms={elapsed_ms:.1f} "
              f"tokens={result.get('usage', {}).get('total_tokens', '?')}")
        return result
    return wrapper`,
    },
    {
      name: "LLM-as-judge prompt + score parser",
      snippet: `JUDGE_PROMPT = """Rate the RESPONSE on a scale of 1-5 for how well it
answers the QUESTION using only the CONTEXT. Reply with just the number.

QUESTION: {question}
CONTEXT: {context}
RESPONSE: {response}
SCORE:"""

def parse_judge_score(judge_output: str) -> int:
    digits = "".join(c for c in judge_output if c.isdigit())
    return int(digits) if digits else 0`,
    },
  ],

  problems: [
    {
      id: "exact-match-eval-suite",
      title: "Exact Match Eval Over a Test Set",
      difficulty: "easy",
      prompt:
        "You're given a list of (prediction, expected) pairs from running a prompt against a regression test set. Write a function that returns the fraction of predictions that exactly match their expected answer (case-insensitive, ignoring leading/trailing whitespace).",
      patternKeywords: ["exact match", "regression suite", "accuracy", "normalization"],
      solution: `def eval_exact_match(pairs):
    if not pairs:
        return 0.0
    correct = 0
    for prediction, expected in pairs:
        if prediction.strip().lower() == expected.strip().lower():
            correct += 1
    return correct / len(pairs)`,
      solutionExplanation: [
        "I guard against `not pairs` first and return 0.0 — an empty test set has no accuracy, and dividing by `len(pairs)` later would raise `ZeroDivisionError`. Returning 0.0 rather than raising keeps this function safe to call from a CI pipeline that might occasionally pass an empty slice.",
        "I normalize both strings with `.strip().lower()` before comparing. This is the core eval design decision: exact match should fail on real semantic mismatches, not on a trailing newline or a capitalization difference the model has no control over. Without normalization, this eval would be noisy and regressions would be impossible to distinguish from formatting drift.",
        "I iterate with a plain `for prediction, expected in pairs` — tuple unpacking in the loop header — rather than indexing with `pairs[i][0]` and `pairs[i][1]`. This reads as 'for each prediction-expected pair' and matches the shape of the input directly.",
        "The final `correct / len(pairs)` returns a float between 0 and 1 — an accuracy score. I return this ratio rather than the raw `correct` count because eval scores need to be comparable across test sets of different sizes; a raw count of 8 is meaningless without knowing the denominator was 10.",
      ],
      testCase: {
        input: `pairs = [("Paris", "paris"), ("4", "4"), ("Berlin ", "Madrid"), ("yes", "Yes")]`,
        expected: "0.75",
        trace: [
          `pair 1: "Paris".strip().lower()="paris" == "paris"  → match  correct=1`,
          `pair 2: "4" == "4"  → match  correct=2`,
          `pair 3: "berlin" == "madrid"  → no match  correct=2`,
          `pair 4: "yes" == "yes"  → match  correct=3`,
          `return 3 / 4 = 0.75`,
        ],
        traceExplanations: [
          "First pair: after lowercasing and stripping, 'Paris' becomes 'paris', matching the expected 'paris' exactly. Counted as correct.",
          "Second pair: '4' matches '4' trivially — no normalization needed but it's harmless.",
          "Third pair: 'Berlin ' normalizes to 'berlin', which does not equal 'madrid'. This is a genuine model error, not a formatting issue.",
          "Fourth pair: 'yes' and 'Yes' differ only in case — normalization correctly treats these as the same answer.",
          "3 out of 4 pairs matched, giving an accuracy of 0.75. This number is what you'd track across prompt versions to detect regressions.",
        ],
      },
      blanks: [
        { line: `if not pairs:\n        return ___`, answer: "0.0" },
        { line: `if prediction.strip().lower() == expected.strip().___():`, answer: "lower" },
        { line: `correct += ___`, answer: "1" },
        { line: `return correct / ___(pairs)`, answer: "len" },
      ],
      explanationBlanks: [
        {
          line: "I guard against `not pairs` first and return 0.0 — an empty test set has no accuracy, and dividing by `len(pairs)` later would raise `___`. Returning 0.0 rather than raising keeps this function safe to call from a CI pipeline that might occasionally pass an empty slice.",
          answer: "ZeroDivisionError",
        },
        {
          line: "I normalize both strings with `.strip().lower()` before comparing. This is the core eval design decision: exact match should fail on real semantic mismatches, not on a trailing newline or a capitalization difference the model has no control over. Without normalization, this eval would be noisy and regressions would be impossible to distinguish from ___.",
          answer: "formatting drift",
        },
        {
          line: "I iterate with a plain `for prediction, expected in pairs` — ___ unpacking in the loop header — rather than indexing with `pairs[i][0]` and `pairs[i][1]`. This reads as 'for each prediction-expected pair' and matches the shape of the input directly.",
          answer: "tuple",
        },
        {
          line: "The final `correct / len(pairs)` returns a float between 0 and 1 — an accuracy score. I return this ratio rather than the raw `correct` count because eval scores need to be comparable across test sets of ___ sizes; a raw count of 8 is meaningless without knowing the denominator was 10.",
          answer: "different",
        },
      ],
    },

    {
      id: "hallucination-grounding-check",
      title: "Hallucination Check via Keyword Grounding",
      difficulty: "medium",
      prompt:
        "Given a model-generated answer and the source document it was supposed to be grounded in, write a cheap heuristic check that flags potential hallucination: extract capitalized 'entity-like' words (proper nouns, numbers) from the answer and verify each one appears somewhere in the source document. Return the fraction of such tokens that ARE grounded (1.0 = fully grounded).",
      patternKeywords: ["hallucination detection", "grounding", "faithfulness", "heuristic eval"],
      solution: `import re

def grounding_score(answer: str, source: str) -> float:
    tokens = re.findall(r"\\b[A-Z][a-zA-Z]*\\b|\\b\\d+\\b", answer)
    if not tokens:
        return 1.0
    source_lower = source.lower()
    grounded = sum(1 for t in tokens if t.lower() in source_lower)
    return grounded / len(tokens)`,
      solutionExplanation: [
        "I use `re.findall` with the pattern `\\b[A-Z][a-zA-Z]*\\b|\\b\\d+\\b` to pull out two kinds of 'checkable' tokens: capitalized words (likely names, places, proper nouns) and standalone numbers (likely dates, counts, statistics). These are the tokens an LLM is most likely to fabricate confidently — generic words like 'the' or 'helps' are too common to be useful signal.",
        "If `tokens` is empty, I return `1.0` rather than 0.0 — an answer with no checkable entities makes no specific factual claims, so there's nothing to penalize. Returning a perfect score for 'nothing to check' avoids unfairly flagging vague-but-safe answers as hallucinations.",
        "I lowercase the entire `source` once into `source_lower` outside the loop, rather than lowercasing the source on every iteration. This is a small but real efficiency choice: lowercasing a long document n times (once per token) is wasted work compared to doing it once.",
        "The grounding check `t.lower() in source_lower` is a substring containment test, not a regex or fuzzy match — it's deliberately cheap and approximate. This kind of check is meant as a fast first-pass filter in a CI pipeline, flagging answers for closer review (or LLM-as-judge), not as a definitive correctness verdict.",
        "The final ratio `grounded / len(tokens)` gives a score between 0 and 1, where 1.0 means every named entity or number in the answer can be found verbatim in the source — a strong (if imperfect) signal that the model didn't invent facts not present in its context.",
      ],
      testCase: {
        input: `answer = "Marie Curie won the Nobel Prize in 1903 alongside Pierre Curie and Henri Becquerel.", source = "In 1903, Marie Curie and Pierre Curie shared the Nobel Prize in Physics."`,
        expected: "0.8",
        trace: [
          `tokens extracted from answer: ["Marie", "Curie", "Nobel", "Prize", "1903", "Pierre", "Curie", "Henri", "Becquerel"]`,
          `source_lower = "in 1903, marie curie and pierre curie shared the nobel prize in physics."`,
          `"marie" in source ✓, "curie" in source ✓, "nobel" in source ✓, "prize" in source ✓, "1903" in source ✓`,
          `"pierre" in source ✓, "curie" in source ✓, "henri" in source ✗, "becquerel" in source ✗`,
          `grounded = 7, len(tokens) = 9, return 7/9 ≈ 0.78`,
        ],
        traceExplanations: [
          "The regex pulls out 9 entity-like tokens — every capitalized word and the number 1903. These are the claims worth checking.",
          "The source is lowercased once for fast, case-insensitive substring checks against every token.",
          "The first five tokens — Marie, Curie, Nobel, Prize, 1903 — all appear in the source text, so they're grounded.",
          "Pierre and the second 'Curie' are also grounded. But 'Henri' and 'Becquerel' never appear in the source — the model added a third scientist (Henri Becquerel) who isn't mentioned in the provided document. This is the hallucination this check catches.",
          "7 of 9 tokens are grounded, giving a score of about 0.78 — low enough to flag this answer for review, even though most of it is accurate.",
        ],
      },
      blanks: [
        { line: `tokens = re.findall(r"\\b[A-Z][a-zA-Z]*\\b|\\b\\d+\\b", ___)`, answer: "answer" },
        { line: `if not tokens:\n        return ___`, answer: "1.0" },
        { line: `source_lower = source.___()`, answer: "lower" },
        { line: `grounded = sum(1 for t in tokens if t.lower() in ___)`, answer: "source_lower" },
        { line: `return grounded / ___(tokens)`, answer: "len" },
      ],
      explanationBlanks: [
        {
          line: "I use `re.findall` with the pattern `\\b[A-Z][a-zA-Z]*\\b|\\b\\d+\\b` to pull out two kinds of 'checkable' tokens: capitalized words (likely names, places, proper nouns) and standalone numbers (likely dates, counts, statistics). These are the tokens an LLM is most likely to fabricate confidently — generic words like 'the' or 'helps' are too common to be useful ___.",
          answer: "signal",
        },
        {
          line: "If `tokens` is empty, I return `1.0` rather than 0.0 — an answer with no checkable entities makes no specific factual claims, so there's nothing to penalize. Returning a perfect score for 'nothing to check' avoids unfairly flagging vague-but-safe answers as ___.",
          answer: "hallucinations",
        },
        {
          line: "I lowercase the entire `source` once into `source_lower` outside the loop, rather than lowercasing the source on every iteration. This is a small but real efficiency choice: lowercasing a long document n times (once per token) is wasted work compared to doing it ___.",
          answer: "once",
        },
        {
          line: "The grounding check `t.lower() in source_lower` is a substring containment test, not a regex or fuzzy match — it's deliberately cheap and approximate. This kind of check is meant as a fast first-pass filter in a CI pipeline, flagging answers for closer review (or ___), not as a definitive correctness verdict.",
          answer: "LLM-as-judge",
        },
        {
          line: "The final ratio `grounded / len(tokens)` gives a score between 0 and 1, where 1.0 means every named entity or number in the answer can be found verbatim in the source — a strong (if imperfect) signal that the model didn't invent facts not present in its ___.",
          answer: "context",
        },
      ],
    },

    {
      id: "llm-as-judge-parser",
      title: "LLM-as-Judge: Build the Prompt and Parse the Verdict",
      difficulty: "medium",
      prompt:
        "You're using a stronger model as a judge to score a weaker model's answers from 1-5 against a reference answer. Write a function that builds the judge prompt given a question, reference answer, and candidate answer, and a second function that robustly parses a 1-5 integer score out of the judge's free-text reply (the judge sometimes adds extra words around the number).",
      patternKeywords: ["LLM-as-judge", "rubric prompting", "output parsing", "robustness"],
      solution: `import re

def build_judge_prompt(question, reference, candidate):
    return (
        f"Question: {question}\\n"
        f"Reference answer: {reference}\\n"
        f"Candidate answer: {candidate}\\n"
        f"On a scale of 1-5, how well does the candidate answer match "
        f"the reference in correctness and completeness? Reply with "
        f"just the integer score."
    )

def parse_judge_score(reply: str) -> int:
    match = re.search(r"[1-5]", reply)
    if not match:
        raise ValueError(f"No valid score found in judge reply: {reply!r}")
    return int(match.group())`,
      solutionExplanation: [
        "I build the prompt with an f-string spread across multiple concatenated string literals (implicit string concatenation via adjacent `f\"...\"` lines) rather than one giant f-string on one line. This is purely a readability choice — each line corresponds to one piece of context the judge needs, and the structure of the prompt mirrors the structure of the function's inputs.",
        "The prompt explicitly constrains the output format: 'Reply with just the integer score.' This is a deliberate prompt-engineering decision for LLM-as-judge setups — the more constrained the expected output, the easier and more reliable the parsing step downstream. Asking for free-form justification would make automated scoring brittle.",
        "In `parse_judge_score`, I use `re.search(r\"[1-5]\", reply)` rather than `int(reply)` directly. Judges don't always follow instructions perfectly — they might reply 'Score: 4' or '4/5' or 'I'd say a 4.' A regex search for the first digit 1-5 is robust to this surrounding text, whereas `int(reply)` would raise on anything but a bare digit string.",
        "If `match` is `None` — meaning the judge's reply contained no valid score at all — I raise a `ValueError` with the offending reply included via `{reply!r}` (the `!r` gives the repr, showing quotes and escape characters, which is useful for debugging malformed judge output). I raise rather than silently returning a default score like 0, because silently treating a parsing failure as 'lowest score' would corrupt the eval metrics without anyone noticing — better to fail loudly and fix the prompt or judge.",
      ],
      testCase: {
        input: `question="What is the capital of France?", reference="Paris", candidate="The capital of France is Paris.", judge_reply="I'd rate this a 5 — fully correct."`,
        expected: "5",
        trace: [
          `build_judge_prompt(...) → "Question: What is the capital of France?\\nReference answer: Paris\\nCandidate answer: The capital of France is Paris.\\nOn a scale of 1-5, ... Reply with just the integer score."`,
          `judge model is called with this prompt, returns judge_reply = "I'd rate this a 5 — fully correct."`,
          `parse_judge_score(judge_reply): re.search(r"[1-5]", "I'd rate this a 5 — fully correct.")`,
          `match found at "5" → match.group() = "5"`,
          `return int("5") = 5`,
        ],
        traceExplanations: [
          "The prompt presents the question, the gold reference, and the candidate side by side, with an explicit instruction to reply with just an integer.",
          "Even though the prompt asked for 'just the integer', this judge added commentary — a common real-world occurrence that the parser must handle.",
          "The regex scans the full reply text for the first character matching 1-5, ignoring all the surrounding words.",
          "It finds the '5' embedded in 'a 5 —', confirming the regex works even when the digit is surrounded by punctuation and text.",
          "Converting the matched string '5' to an int gives the final score of 5, ready to be aggregated across the eval set.",
        ],
      },
      blanks: [
        { line: `f"On a scale of 1-5, how well does the candidate answer match the reference in correctness and ___?"`, answer: "completeness" },
        { line: `match = re.___(r"[1-5]", reply)`, answer: "search" },
        { line: `if not match:\n        raise ___(f"No valid score found in judge reply: {reply!r}")`, answer: "ValueError" },
        { line: `return int(match.___())`, answer: "group" },
      ],
      explanationBlanks: [
        {
          line: "I build the prompt with an f-string spread across multiple concatenated string literals (implicit string concatenation via adjacent `f\"...\"` lines) rather than one giant f-string on one line. This is purely a ___ choice — each line corresponds to one piece of context the judge needs, and the structure of the prompt mirrors the structure of the function's inputs.",
          answer: "readability",
        },
        {
          line: "The prompt explicitly constrains the output format: 'Reply with just the integer score.' This is a deliberate prompt-engineering decision for LLM-as-judge setups — the more constrained the expected output, the easier and more reliable the ___ step downstream. Asking for free-form justification would make automated scoring brittle.",
          answer: "parsing",
        },
        {
          line: "In `parse_judge_score`, I use `re.search(r\"[1-5]\", reply)` rather than `int(reply)` directly. Judges don't always follow instructions perfectly — they might reply 'Score: 4' or '4/5' or 'I'd say a 4.' A regex search for the first digit 1-5 is robust to this surrounding text, whereas `int(reply)` would raise on anything but a bare ___ string.",
          answer: "digit",
        },
        {
          line: "If `match` is `None` — meaning the judge's reply contained no valid score at all — I raise a `ValueError` with the offending reply included via `{reply!r}` (the `!r` gives the repr, showing quotes and escape characters, which is useful for debugging malformed judge output). I raise rather than silently returning a default score like 0, because silently treating a parsing failure as 'lowest score' would corrupt the eval metrics without anyone noticing — better to ___.",
          answer: "fail loudly",
        },
      ],
    },

    {
      id: "llm-call-tracing-decorator",
      title: "Tracing Decorator for LLM Call Latency and Token Usage",
      difficulty: "medium",
      prompt:
        "Write a decorator `@trace_llm_call` that wraps any function making an LLM API call. It should record the wall-clock latency in milliseconds, the prompt and completion token counts (read from the returned dict's 'usage' field), and append a structured log entry (as a dict) to a module-level list `TRACE_LOG`, without altering the function's return value.",
      patternKeywords: ["observability", "tracing", "decorator", "latency logging"],
      solution: `import time
import functools

TRACE_LOG = []

def trace_llm_call(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = fn(*args, **kwargs)
        latency_ms = (time.perf_counter() - start) * 1000
        usage = result.get("usage", {})
        TRACE_LOG.append({
            "function": fn.__name__,
            "latency_ms": round(latency_ms, 2),
            "prompt_tokens": usage.get("prompt_tokens", 0),
            "completion_tokens": usage.get("completion_tokens", 0),
        })
        return result
    return wrapper`,
      solutionExplanation: [
        "I declare `TRACE_LOG = []` at module level so every call to any decorated function appends to the same shared log — this mirrors how a real tracing system accumulates spans into a single exporter buffer that can later be flushed to a file or observability backend.",
        "I use `@functools.wraps(fn)` on the inner `wrapper` function. Without it, `wrapper.__name__` and `wrapper.__doc__` would shadow the original function's metadata, which breaks introspection, debugging, and any tooling that inspects `fn.__name__` — exactly the kind of bug that's invisible until you're trying to read a stack trace in production.",
        "I time with `time.perf_counter()` rather than `time.time()` — `perf_counter` is a monotonic clock designed specifically for measuring elapsed intervals and isn't affected by system clock adjustments (NTP sync, daylight savings), making it the correct choice for latency measurement.",
        "I read `result.get(\"usage\", {})` with a default empty dict, then `.get(\"prompt_tokens\", 0)` and `.get(\"completion_tokens\", 0)` — chained safe-gets rather than direct key access. If the API response is missing the `usage` field entirely (which happens with some providers or error responses), this still produces a valid log entry with zeros instead of crashing the wrapped call.",
        "Critically, `wrapper` returns `result` unchanged at the end — the decorator's entire job is to observe the call, not modify its behavior. This is the core principle of tracing: instrumentation must be transparent, so adding `@trace_llm_call` to a function never changes what callers receive.",
      ],
      testCase: {
        input: `@trace_llm_call\ndef call_model(prompt):\n    return {"text": "hi", "usage": {"prompt_tokens": 10, "completion_tokens": 2}}\n\ncall_model("hello")`,
        expected: `{"text": "hi", "usage": {"prompt_tokens": 10, "completion_tokens": 2}}`,
        trace: [
          `start = time.perf_counter()  (e.g. 100.000)`,
          `result = call_model("hello") → {"text": "hi", "usage": {"prompt_tokens": 10, "completion_tokens": 2}}`,
          `latency_ms = (time.perf_counter() - start) * 1000  → e.g. 0.05`,
          `usage = {"prompt_tokens": 10, "completion_tokens": 2}`,
          `TRACE_LOG.append({"function": "call_model", "latency_ms": 0.05, "prompt_tokens": 10, "completion_tokens": 2})`,
          `return {"text": "hi", "usage": {"prompt_tokens": 10, "completion_tokens": 2}}`,
        ],
        traceExplanations: [
          "The clock starts immediately before the wrapped function runs, capturing only the time spent inside the actual LLM call.",
          "The inner function executes normally and returns its full result dict, including the 'usage' field the API provider attaches.",
          "Elapsed time is computed and converted from seconds to milliseconds — milliseconds are the conventional unit for latency dashboards.",
          "The usage dict is extracted via `.get(\"usage\", {})`, defaulting safely if absent.",
          "A structured log entry — function name, latency, and token counts — is appended to the shared TRACE_LOG list, ready for later aggregation or export to a tracing backend.",
          "The original result is returned completely unmodified — the caller of `call_model` never knows tracing happened.",
        ],
      },
      blanks: [
        { line: `@functools.___(fn)`, answer: "wraps" },
        { line: `start = time.___()`, answer: "perf_counter" },
        { line: `latency_ms = (time.perf_counter() - start) * ___`, answer: "1000" },
        { line: `usage = result.get("usage", ___)`, answer: "{}" },
        { line: `"prompt_tokens": usage.get("prompt_tokens", ___),`, answer: "0" },
        { line: `return ___`, answer: "result" },
      ],
      explanationBlanks: [
        {
          line: "I declare `TRACE_LOG = []` at module level so every call to any decorated function appends to the same shared log — this mirrors how a real tracing system accumulates spans into a single ___ buffer that can later be flushed to a file or observability backend.",
          answer: "exporter",
        },
        {
          line: "I use `@functools.wraps(fn)` on the inner `wrapper` function. Without it, `wrapper.__name__` and `wrapper.__doc__` would shadow the original function's metadata, which breaks introspection, debugging, and any tooling that inspects `fn.__name__` — exactly the kind of bug that's invisible until you're trying to read a ___ in production.",
          answer: "stack trace",
        },
        {
          line: "I time with `time.perf_counter()` rather than `time.time()` — `perf_counter` is a ___ clock designed specifically for measuring elapsed intervals and isn't affected by system clock adjustments (NTP sync, daylight savings), making it the correct choice for latency measurement.",
          answer: "monotonic",
        },
        {
          line: "I read `result.get(\"usage\", {})` with a default empty dict, then `.get(\"prompt_tokens\", 0)` and `.get(\"completion_tokens\", 0)` — chained safe-gets rather than direct key access. If the API response is missing the `usage` field entirely (which happens with some providers or error responses), this still produces a valid log entry with zeros instead of ___ the wrapped call.",
          answer: "crashing",
        },
        {
          line: "Critically, `wrapper` returns `result` unchanged at the end — the decorator's entire job is to observe the call, not modify its behavior. This is the core principle of tracing: instrumentation must be ___, so adding `@trace_llm_call` to a function never changes what callers receive.",
          answer: "transparent",
        },
      ],
    },

    {
      id: "ab-test-bucket-assignment",
      title: "Deterministic A/B Bucket Assignment for Prompt Variants",
      difficulty: "hard",
      prompt:
        "You're running an A/B test comparing prompt variant 'A' (control) against variant 'B' (treatment) for a fraction `treatment_pct` of users. Write a function that deterministically assigns a `user_id` (string) to 'A' or 'B' such that the same user always gets the same variant across requests, the assignment is approximately uniform, and the split ratio can be changed without reshuffling existing users' buckets in a biased way (i.e., changing 10% to 20% should only move users from A to B, never the reverse).",
      patternKeywords: ["A/B testing", "deterministic hashing", "bucketing", "consistent assignment"],
      solution: `import hashlib

def assign_variant(user_id: str, treatment_pct: float) -> str:
    digest = hashlib.sha256(user_id.encode("utf-8")).hexdigest()
    bucket = int(digest[:8], 16) / 0xFFFFFFFF
    return "B" if bucket < treatment_pct else "A"`,
      solutionExplanation: [
        "I hash `user_id` with `hashlib.sha256` rather than using `random` or `hash()`. Python's built-in `hash()` is salted per-process for security (hash randomization), so the same string would hash differently across runs — useless for a consistency guarantee that must hold across servers and over time. SHA-256 is deterministic and well-distributed regardless of process or machine.",
        "I encode the string with `.encode(\"utf-8\")` because `hashlib` functions operate on bytes, not str — this is a Python 3 requirement, and UTF-8 is the safe default encoding for arbitrary user IDs that might contain non-ASCII characters.",
        "I take `digest[:8]` — the first 8 hex characters — and convert with `int(digest[:8], 16)` to get an integer in roughly the range [0, 2^32). I only need enough bits for a reasonably uniform distribution; using the full 256-bit digest would be wasted precision for this purpose.",
        "Dividing by `0xFFFFFFFF` (the max value of a 32-bit hex number, i.e. 2^32 - 1) normalizes `bucket` to a float in [0, 1]. This maps every user deterministically to a fixed point on a 'number line' from 0 to 1 — their position never changes regardless of `treatment_pct`.",
        "The final comparison `bucket < treatment_pct` is what makes the split ratio adjustable without reshuffling: if a user's fixed `bucket` value is 0.15, they're in 'B' once `treatment_pct` reaches 0.15 and beyond, and stay in 'B' for any larger treatment percentage — increasing `treatment_pct` from 0.1 to 0.2 only flips users whose bucket falls in [0.1, 0.2) from A to B, and never moves anyone already in B back to A.",
      ],
      testCase: {
        input: `user_id = "user_42", treatment_pct = 0.5`,
        expected: `"A" or "B" deterministically (e.g. "B" if bucket=0.31 < 0.5)`,
        trace: [
          `digest = sha256("user_42".encode("utf-8")).hexdigest()  → e.g. "4f2a91c3e8b7..."`,
          `digest[:8] = "4f2a91c3"`,
          `int("4f2a91c3", 16) = 1330872003 (example)`,
          `bucket = 1330872003 / 4294967295 ≈ 0.3098`,
          `0.3098 < 0.5  → return "B"`,
          `repeat call with same user_id, same treatment_pct → identical digest → same "B"`,
        ],
        traceExplanations: [
          "SHA-256 produces a long, deterministic hex digest for this exact user_id string — same input always produces same output, on any machine.",
          "We slice off the first 8 hex characters as our 'random-looking but fixed' source of randomness for this user.",
          "Converting from base-16 hex to a base-10 integer gives a number somewhere in [0, 2^32).",
          "Dividing by the max possible 32-bit value normalizes this to a float in [0, 1] — this is the user's permanent 'position' in the bucket space.",
          "Comparing against treatment_pct=0.5 determines the variant. Since 0.31 < 0.5, this user falls in the treatment group B.",
          "Calling the function again with identical arguments reproduces the identical hash and the identical bucket value — the same user always lands in the same variant, which is essential for a valid A/B test (otherwise users would see inconsistent experiences and results would be confounded).",
        ],
      },
      blanks: [
        { line: `digest = hashlib.___(user_id.encode("utf-8")).hexdigest()`, answer: "sha256" },
        { line: `bucket = int(digest[:8], ___) / 0xFFFFFFFF`, answer: "16" },
        { line: `return "B" if bucket < ___ else "A"`, answer: "treatment_pct" },
        { line: `digest = hashlib.sha256(user_id.___("utf-8")).hexdigest()`, answer: "encode" },
      ],
      explanationBlanks: [
        {
          line: "I hash `user_id` with `hashlib.sha256` rather than using `random` or `hash()`. Python's built-in `hash()` is salted per-process for security (hash randomization), so the same string would hash differently across runs — useless for a consistency guarantee that must hold across servers and over time. SHA-256 is deterministic and well-___ regardless of process or machine.",
          answer: "distributed",
        },
        {
          line: "I encode the string with `.encode(\"utf-8\")` because `hashlib` functions operate on bytes, not str — this is a Python 3 requirement, and UTF-8 is the safe default encoding for arbitrary user IDs that might contain ___ characters.",
          answer: "non-ASCII",
        },
        {
          line: "I take `digest[:8]` — the first 8 hex characters — and convert with `int(digest[:8], 16)` to get an integer in roughly the range [0, 2^32). I only need enough bits for a reasonably uniform distribution; using the full 256-bit digest would be ___ precision for this purpose.",
          answer: "wasted",
        },
        {
          line: "Dividing by `0xFFFFFFFF` (the max value of a 32-bit hex number, i.e. 2^32 - 1) normalizes `bucket` to a float in [0, 1]. This maps every user deterministically to a fixed point on a 'number line' from 0 to 1 — their position never changes regardless of ___.",
          answer: "treatment_pct",
        },
        {
          line: "The final comparison `bucket < treatment_pct` is what makes the split ratio adjustable without reshuffling: if a user's fixed `bucket` value is 0.15, they're in 'B' once `treatment_pct` reaches 0.15 and beyond, and stay in 'B' for any larger treatment percentage — increasing `treatment_pct` from 0.1 to 0.2 only flips users whose bucket falls in [0.1, 0.2) from A to B, and never moves anyone already in B back to ___.",
          answer: "A",
        },
      ],
    },
  ],
}
