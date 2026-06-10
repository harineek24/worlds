import { Pattern } from "../../types"

export const systemDesignBehavioral: Pattern = {
  id: "system-design-behavioral",
  order: 8,
  patternName: "System Design & Behavioral",

  philosophy: {
    text: "Right speech is speech that is true, beneficial, and timely — spoken with a mind of goodwill, and with care for how it lands on the listener.",
    source: "Aṅguttara Nikāya 5.198 (the Buddha's teaching on Right Speech)",
    connection:
      "System design interviews aren't just about drawing the right boxes — they're about narrating tradeoffs so a listener with different context can follow your reasoning. Right speech here means being honest about what you don't know, beneficial in surfacing risks the interviewer cares about, and timely in matching your depth to the audience — a one-sentence latency tradeoff for a PM, a queueing-theory digression for a staff engineer. The same system, told two ways, is two different conversations. Seeing the whole system — and seeing the whole person you're talking to — are the same skill.",
  },

  template: {
    description:
      "Most AI system design questions decompose into a pipeline of stages — retrieve, generate, validate — each with its own latency, failure mode, and fallback. The interview signal isn't whether you can name the stages; it's whether you can reason about what happens when any one of them is slow, wrong, or down, and how you'd observe that in production.",
    snippet: `def run_pipeline(query, retriever, generator, validator):
    # each stage can fail independently — handle that explicitly
    docs = retriever(query)
    if not docs:
        return {"answer": None, "reason": "no_context_retrieved"}

    draft = generator(query, docs)
    is_valid, reason = validator(draft, docs)
    if not is_valid:
        # don't silently return a bad answer — degrade gracefully
        return {"answer": None, "reason": reason}

    return {"answer": draft, "reason": "ok"}`,
  },

  pythonTools: [
    {
      name: "chain of functions — composable pipeline runner",
      snippet: `def run_chain(input, steps):
    result = input
    for step in steps:
        result = step(result)
    return result

# usage: run_chain(query, [retrieve, generate, validate])`,
    },
    {
      name: "dataclass for system component config",
      snippet: `from dataclasses import dataclass

@dataclass
class RAGConfig:
    retriever_top_k: int = 5
    model_name: str = "claude-sonnet"
    max_tokens: int = 512
    similarity_threshold: float = 0.7`,
    },
    {
      name: "structured diagnostic logger for debugging prod issues",
      snippet: `import logging

logger = logging.getLogger("rag_pipeline")

def log_step(stage, **kwargs):
    logger.info("stage=%s %s", stage, kwargs)

# log_step("retrieval", query=q, num_docs=len(docs), top_score=docs[0].score)`,
    },
  ],

  problems: [
    {
      id: "design-rag-chatbot",
      title: "Design an End-to-End RAG Chatbot",
      difficulty: "hard",
      prompt:
        "Walk me through how you'd design a RAG-based customer support chatbot for a company's product docs. Cover ingestion, retrieval, generation, and how you'd monitor it in production.",
      patternKeywords: ["RAG architecture", "ingestion pipeline", "retrieval", "production monitoring"],
      solution: `from dataclasses import dataclass, field

@dataclass
class RAGSystem:
    chunk_size: int = 500
    top_k: int = 5
    rerank: bool = True
    fallback_message: str = "I'm not sure — let me find a human."

    def answer(self, query, vector_store, llm, reranker=None):
        candidates = vector_store.search(query, k=self.top_k * 2)
        if self.rerank and reranker:
            candidates = reranker(query, candidates)[: self.top_k]
        else:
            candidates = candidates[: self.top_k]
        if not candidates or candidates[0].score < 0.5:
            return self.fallback_message
        return llm.generate(query, context=candidates)`,
      solutionExplanation: [
        "I model the system as a `dataclass` rather than a loose set of global variables — `chunk_size`, `top_k`, `rerank`, and `fallback_message` are the knobs I'd actually tune after launch, and bundling them lets me version configs and A/B test them independently of code changes.",
        "Ingestion (not shown in the snippet, but I'd narrate it): docs get split into ~500-token chunks with overlap, embedded, and stored in a vector index. The chunk size is a tradeoff — too small loses context, too large dilutes retrieval precision and wastes tokens in the prompt.",
        "`vector_store.search(query, k=self.top_k * 2)` retrieves more candidates than I need — `top_k * 2` — because a cheap reranker can then reorder a slightly larger candidate pool for better precision than the embedding similarity alone provides.",
        "I gate reranking with `if self.rerank and reranker` — this is a deliberate escape hatch: if the reranker service is down or too slow, the system degrades to plain vector search rather than failing the whole request. That's the kind of resilience an interviewer is listening for.",
        "The check `candidates[0].score < 0.5` is a confidence gate — if even the best match is weak, I return `self.fallback_message` rather than letting the LLM hallucinate an answer from irrelevant context. This is the single most important guardrail against confidently-wrong responses.",
        "In production I'd monitor: retrieval recall (are the right docs being found?), generation latency per stage, fallback rate (a spike means either the index is stale or query distribution shifted), and a sample of responses sent to human review for groundedness.",
      ],
      testCase: {
        input: `query = "How do I reset my password?", top docs all score < 0.5`,
        expected: `"I'm not sure — let me find a human."`,
        trace: [
          "vector_store.search returns candidates, but the best score is 0.31",
          "rerank reorders but doesn't change that the top score is below 0.5",
          "candidates[0].score < 0.5 is True",
          "return fallback_message instead of generating",
        ],
        traceExplanations: [
          "The retrieval step ran successfully but found nothing closely related to the query — maybe the docs don't cover password resets.",
          "Reranking can reorder the pool but can't manufacture relevance that isn't there.",
          "This is the confidence gate firing — exactly the case it exists for.",
          "Returning a canned fallback is far better than letting the model invent a plausible-sounding but wrong password reset procedure.",
        ],
      },
      blanks: [
        { line: `candidates = vector_store.search(query, k=self.top_k * ___)`, answer: "2" },
        { line: `candidates = reranker(query, candidates)[: self.___]`, answer: "top_k" },
        { line: `if not candidates or candidates[0].score < ___:`, answer: "0.5" },
        { line: `return self.___`, answer: "fallback_message" },
        { line: `return llm.generate(query, context=___)`, answer: "candidates" },
      ],
      explanationBlanks: [
        {
          line: "I model the system as a `dataclass` rather than a loose set of global variables — `chunk_size`, `top_k`, `rerank`, and `fallback_message` are the knobs I'd actually tune after launch, and bundling them lets me version ___ and A/B test them independently of code changes.",
          answer: "configs",
        },
        {
          line: "Ingestion (not shown in the snippet, but I'd narrate it): docs get split into ~500-token chunks with overlap, embedded, and stored in a vector index. The chunk size is a tradeoff — too small loses context, too large dilutes retrieval ___ and wastes tokens in the prompt.",
          answer: "precision",
        },
        {
          line: "`vector_store.search(query, k=self.top_k * 2)` retrieves more candidates than I need — `top_k * 2` — because a cheap reranker can then reorder a slightly larger candidate pool for better precision than the ___ similarity alone provides.",
          answer: "embedding",
        },
        {
          line: "I gate reranking with `if self.rerank and reranker` — this is a deliberate escape hatch: if the reranker service is down or too slow, the system degrades to plain vector search rather than failing the whole request. That's the kind of ___ an interviewer is listening for.",
          answer: "resilience",
        },
        {
          line: "The check `candidates[0].score < 0.5` is a confidence gate — if even the best match is weak, I return `self.fallback_message` rather than letting the LLM ___ an answer from irrelevant context. This is the single most important guardrail against confidently-wrong responses.",
          answer: "hallucinate",
        },
        {
          line: "In production I'd monitor: retrieval recall (are the right docs being found?), generation latency per stage, fallback rate (a spike means either the index is stale or query distribution shifted), and a sample of responses sent to human review for ___.",
          answer: "groundedness",
        },
      ],
    },

    {
      id: "design-content-moderation-pipeline",
      title: "Design a Content Moderation Pipeline",
      difficulty: "medium",
      prompt:
        "Design a pipeline that moderates user-generated content (text posts) before they're published, using a mix of fast classifiers and an LLM for ambiguous cases.",
      patternKeywords: ["tiered classification", "latency budget", "human-in-the-loop", "false positive tradeoff"],
      solution: `def moderate(post, fast_classifier, llm_classifier, human_queue):
    score = fast_classifier(post)
    if score < 0.2:
        return "approve"
    if score > 0.9:
        return "block"
    # ambiguous middle band — escalate
    verdict = llm_classifier(post)
    if verdict == "uncertain":
        human_queue.add(post)
        return "pending_review"
    return verdict`,
      solutionExplanation: [
        "I structure this as a tiered cascade: a cheap fast classifier (a small fine-tuned model, milliseconds) handles the bulk of clear-cut cases, and only ambiguous content pays the cost of an LLM call. This keeps the median latency low while reserving expensive reasoning for where it matters.",
        "The thresholds `0.2` and `0.9` define three bands: confidently safe, confidently unsafe, and ambiguous. I'd tune these from a labeled validation set, balancing the cost of false positives (blocking legitimate content — user trust) against false negatives (letting harmful content through — brand and legal risk).",
        "For the middle band, I call `llm_classifier(post)` — slower but more nuanced, since it can reason about context, sarcasm, or cultural nuance that a small classifier misses. Even this can return `'uncertain'`.",
        "When even the LLM is uncertain, I add the post to `human_queue` and return `'pending_review'` rather than guessing. This human-in-the-loop fallback is essential for edge cases — and the queue itself becomes a source of new training labels for the fast classifier, closing the loop over time.",
      ],
      testCase: {
        input: `post with fast_classifier score 0.95`,
        expected: `"block"`,
        trace: [
          "score = fast_classifier(post)  # 0.95",
          "score < 0.2 is False",
          "score > 0.9 is True",
          "return 'block'",
        ],
        traceExplanations: [
          "The fast classifier alone is confident this content is unsafe.",
          "Not in the safe band.",
          "Above the high-confidence unsafe threshold — no need to spend an LLM call.",
          "Blocked immediately, keeping latency low for this clear-cut case.",
        ],
      },
      blanks: [
        { line: `if score < ___:`, answer: "0.2" },
        { line: `if score > ___:`, answer: "0.9" },
        { line: `verdict = ___(post)`, answer: "llm_classifier" },
        { line: `if verdict == ___:`, answer: '"uncertain"' },
        { line: `human_queue.___(post)`, answer: "add" },
      ],
      explanationBlanks: [
        {
          line: "I structure this as a tiered cascade: a cheap fast classifier (a small fine-tuned model, milliseconds) handles the bulk of clear-cut cases, and only ambiguous content pays the cost of an LLM call. This keeps the ___ latency low while reserving expensive reasoning for where it matters.",
          answer: "median",
        },
        {
          line: "The thresholds `0.2` and `0.9` define three bands: confidently safe, confidently unsafe, and ambiguous. I'd tune these from a labeled validation set, balancing the cost of ___ (blocking legitimate content — user trust) against false negatives (letting harmful content through — brand and legal risk).",
          answer: "false positives",
        },
        {
          line: "For the middle band, I call `llm_classifier(post)` — slower but more nuanced, since it can reason about context, sarcasm, or cultural nuance that a small classifier misses. Even this can return ___.",
          answer: "'uncertain'",
        },
        {
          line: "When even the LLM is uncertain, I add the post to `human_queue` and return `'pending_review'` rather than guessing. This human-in-the-loop fallback is essential for edge cases — and the queue itself becomes a source of new ___ for the fast classifier, closing the loop over time.",
          answer: "training labels",
        },
      ],
    },

    {
      id: "debug-hallucinating-prod-model",
      title: "The Model Is Hallucinating in Production — Debug It",
      difficulty: "hard",
      prompt:
        "Your team gets a report that the production chatbot has started giving confidently wrong answers about a product feature that was working fine last week. Walk me through how you'd debug this.",
      patternKeywords: ["debugging checklist", "root cause analysis", "regression", "RAG vs. model"],
      solution: `from typing import Any

def debug_hallucination(report: str) -> dict[str, Any]:
    checks = [
        ("retrieval", "did the retrieved context actually contain the right info?"),
        ("recency", "was the doc index updated/changed recently?"),
        ("prompt", "did the prompt template or system prompt change recently?"),
        ("model", "was the underlying model version upgraded?"),
        ("repro", "can I reproduce it with the exact same query + context?"),
    ]
    findings = {}
    for name, question in checks:
        findings[name] = input(f"[{name}] {question} -> ")
    return findings`,
      solutionExplanation: [
        "I treat this as a structured elimination process, not guesswork — I encode the checklist as a list of `(name, question)` tuples so the order is explicit and reviewable, and so a teammate could run the same checklist later.",
        "First I check `retrieval`: is this a generation problem or a retrieval problem? If the retrieved chunks don't contain the answer, the LLM is doing its job — generating plausibly from bad context — and the fix is in the index, not the prompt.",
        "Next, `recency`: 'working last week, broken now' is the strongest signal of a regression. I'd check deploy logs and doc-index update timestamps for anything that changed in that window — a re-embedding job, a schema migration, a new doc version.",
        "Then `prompt` and `model`: did someone tweak the system prompt, or did the model provider silently update the underlying model version (this happens with hosted APIs)? Both can shift behavior without any code change on our side.",
        "Finally `repro`: I try to reproduce the exact failure with the same query and the same retrieved context, isolating whether it's deterministic (a real bug) or probabilistic (sampling temperature / occasional bad retrieval). I use `input()` here as a stand-in for 'gather findings interactively' — in practice this would be a runbook, but the structure — a fixed list of named checks executed in order — is the actual interview answer.",
      ],
      testCase: {
        input: `findings = {"retrieval": "context did NOT mention the new pricing tiers", ...}`,
        expected: `root cause is in retrieval/index, not the LLM`,
        trace: [
          "checks run in order: retrieval, recency, prompt, model, repro",
          "retrieval check reveals: retrieved chunks are stale, missing new pricing info",
          "recency check reveals: doc index was last re-embedded 3 weeks ago, pricing page changed last week",
          "conclusion: stale vector index is the root cause",
        ],
        traceExplanations: [
          "Running checks in a fixed order means the first failing check often points straight at the root cause.",
          "If retrieval already returns the wrong context, the model never had a chance — it's hallucinating from incomplete information, technically 'correctly'.",
          "Cross-referencing with recency confirms the timeline: the doc changed after the last re-index.",
          "The fix is a re-embedding/index refresh job and ideally an automated trigger on doc updates — not a model or prompt change.",
        ],
      },
      blanks: [
        { line: `checks = [`, answer: "checks" },
        { line: `("retrieval", "did the retrieved context actually contain the ___ info?"),`, answer: "right" },
        { line: `findings = {___}`, answer: "" },
        { line: `for name, question in ___:`, answer: "checks" },
        { line: `findings[name] = input(f"[{name}] {___} -> ")`, answer: "question" },
      ],
      explanationBlanks: [
        {
          line: "I treat this as a structured elimination process, not guesswork — I encode the checklist as a list of `(name, question)` tuples so the order is explicit and reviewable, and so a teammate could ___ the same checklist later.",
          answer: "run",
        },
        {
          line: "First I check `retrieval`: is this a generation problem or a retrieval problem? If the retrieved chunks don't contain the answer, the LLM is doing its job — generating plausibly from bad context — and the fix is in the ___, not the prompt.",
          answer: "index",
        },
        {
          line: "Next, `recency`: 'working last week, broken now' is the strongest signal of a ___. I'd check deploy logs and doc-index update timestamps for anything that changed in that window — a re-embedding job, a schema migration, a new doc version.",
          answer: "regression",
        },
        {
          line: "Then `prompt` and `model`: did someone tweak the system prompt, or did the model provider silently update the underlying model version (this happens with hosted APIs)? Both can shift behavior without any ___ on our side.",
          answer: "code change",
        },
        {
          line: "Finally `repro`: I try to reproduce the exact failure with the same query and the same retrieved context, isolating whether it's deterministic (a real bug) or probabilistic (sampling temperature / occasional bad retrieval). I use `input()` here as a stand-in for 'gather findings interactively' — in practice this would be a runbook, but the structure — a fixed list of named checks executed in order — is the actual ___ answer.",
          answer: "interview",
        },
      ],
    },

    {
      id: "explain-tradeoff-to-pm",
      title: "Explain a Latency/Quality Tradeoff to a Non-Technical Stakeholder",
      difficulty: "easy",
      prompt:
        "How would you explain to a product manager why adding a reranking step will improve answer quality but add 300ms of latency — and how would you frame the decision for them to weigh in on?",
      patternKeywords: ["stakeholder communication", "tradeoff framing", "non-technical explanation", "decision framing"],
      solution: `from dataclasses import dataclass

@dataclass
class TradeoffOption:
    name: str
    user_facing_pros: list
    user_facing_cons: list
    metric_deltas: dict

reranking = TradeoffOption(
    name="Add reranking step",
    user_facing_pros=["Answers are noticeably more relevant"],
    user_facing_cons=["Response feels ~0.3s slower"],
    metric_deltas={"answer_relevance": "+12%", "p95_latency_ms": "+300"},
)`,
      solutionExplanation: [
        "I structure the explanation as a `TradeoffOption` dataclass — not because the PM needs Python, but because forcing myself to fill in `user_facing_pros`, `user_facing_cons`, and `metric_deltas` separately keeps me from burying the cost inside jargon. Each field maps to a sentence I'd actually say out loud.",
        "`user_facing_pros` translates the technical change into user language: not 'we added a cross-encoder reranker' but 'answers are noticeably more relevant'. The PM doesn't need to know what reranking is — they need to know what changes for the user.",
        "`user_facing_cons` does the same for the cost: '0.3 seconds slower' is concrete and comparable to things the PM already has intuition for (e.g., 'about as long as a page load they'd notice').",
        "`metric_deltas` is the bridge for when the PM asks 'how do you know?' — I keep the actual numbers (`+12%` relevance, `+300ms` p95 latency) available but don't lead with them, since leading with metrics can make the conversation feel like a defense rather than a collaborative decision.",
        "Framing it this way turns 'should we do this?' into a question the PM is actually equipped to answer: is a 12% relevance gain worth a perceptible 300ms delay for our users, given what we know about their patience for this product? That's their call to make, and my job is to make the inputs to that call legible.",
      ],
      testCase: {
        input: `reranking.metric_deltas`,
        expected: `{"answer_relevance": "+12%", "p95_latency_ms": "+300"}`,
        trace: [
          "TradeoffOption is constructed with name, pros, cons, and metric_deltas",
          "metric_deltas = {'answer_relevance': '+12%', 'p95_latency_ms': '+300'}",
          "PM is shown user_facing_pros/cons first, metric_deltas only on request",
          "PM decides based on user-facing impact, with numbers available as backup",
        ],
        traceExplanations: [
          "All four fields are filled at definition time — nothing is hidden, just sequenced.",
          "These are the hard numbers from an offline eval run.",
          "Leading with 'more relevant answers, slightly slower' is more persuasive and honest than leading with percentages.",
          "The PM owns the product decision; engineering owns making the tradeoff space clear.",
        ],
      },
      blanks: [
        { line: `@___`, answer: "dataclass" },
        { line: `user_facing_pros: ___`, answer: "list" },
        { line: `metric_deltas: ___`, answer: "dict" },
        { line: `user_facing_cons=["Response feels ~0.3s ___"],`, answer: "slower" },
        { line: `metric_deltas={"answer_relevance": "+12%", "p95_latency_ms": ___},`, answer: '"+300"' },
      ],
      explanationBlanks: [
        {
          line: "I structure the explanation as a `TradeoffOption` dataclass — not because the PM needs Python, but because forcing myself to fill in `user_facing_pros`, `user_facing_cons`, and `metric_deltas` separately keeps me from burying the cost inside ___.",
          answer: "jargon",
        },
        {
          line: "`user_facing_pros` translates the technical change into user language: not 'we added a cross-encoder reranker' but 'answers are noticeably more relevant'. The PM doesn't need to know what reranking is — they need to know what changes for the ___.",
          answer: "user",
        },
        {
          line: "`user_facing_cons` does the same for the cost: '0.3 seconds slower' is concrete and comparable to things the PM already has ___ for (e.g., 'about as long as a page load they'd notice').",
          answer: "intuition",
        },
        {
          line: "`metric_deltas` is the bridge for when the PM asks 'how do you know?' — I keep the actual numbers (`+12%` relevance, `+300ms` p95 latency) available but don't lead with them, since leading with metrics can make the conversation feel like a ___ rather than a collaborative decision.",
          answer: "defense",
        },
        {
          line: "Framing it this way turns 'should we do this?' into a question the PM is actually equipped to answer: is a 12% relevance gain worth a perceptible 300ms delay for our users, given what we know about their patience for this product? That's their call to make, and my job is to make the inputs to that call ___.",
          answer: "legible",
        },
      ],
    },

    {
      id: "ambiguous-requirements-prioritization",
      title: "Tell Me About a Time You Handled Ambiguous Requirements",
      difficulty: "medium",
      prompt:
        "Tell me about a time you were asked to build an ML feature with vague or incomplete requirements. How did you approach scoping it, and how did you prioritize what to build first?",
      patternKeywords: ["STAR method", "scoping", "prioritization", "ambiguity"],
      solution: `from dataclasses import dataclass

@dataclass
class STARResponse:
    situation: str
    task: str
    action: str
    result: str

    def summary(self):
        return (
            f"Situation: {self.situation}\\n"
            f"Task: {self.task}\\n"
            f"Action: {self.action}\\n"
            f"Result: {self.result}"
        )

response = STARResponse(
    situation="PM asked for 'a smarter search' with no defined success metric",
    task="Scope a feature that's shippable in 2 weeks and measurably better",
    action="Defined relevance@5 as the metric, shipped a v1 reranker behind a flag, A/B tested",
    result="Reranker shipped, +8% relevance, became the template for future feature scoping",
)`,
      solutionExplanation: [
        "I use the `STARResponse` dataclass to force structure on what could otherwise be a rambling anecdote — `situation`, `task`, `action`, `result` are the four things an interviewer is listening for, and naming them as fields keeps my answer from drifting into irrelevant detail.",
        "`situation` sets up the ambiguity concretely: 'a smarter search' with no defined success metric is a real, common scoping problem — vague enough to be relatable, specific enough to sound like it actually happened.",
        "`task` reframes the ambiguous ask into something boundable: a 2-week timebox and a requirement for measurability. This is the key prioritization move — converting 'make it better' (unbounded) into 'ship something we can A/B test' (bounded).",
        "`action` shows the actual work: picking a concrete metric (`relevance@5`), choosing a small reversible first step (a reranker behind a feature flag), and validating with an A/B test rather than shipping to everyone and hoping.",
        "`result` closes the loop with a measurable outcome (`+8% relevance`) and a secondary, often more valuable outcome — the approach itself became reusable. The `summary()` method exists to remind me that a STAR answer should be tellable in under two minutes; if `summary()` would print a wall of text, the answer is too long.",
      ],
      testCase: {
        input: `response.summary()`,
        expected: `"Situation: ...\\nTask: ...\\nAction: ...\\nResult: ..."`,
        trace: [
          "STARResponse constructed with situation, task, action, result strings",
          "summary() formats each field on its own line with a label prefix",
          "f-strings interpolate self.situation, self.task, etc.",
          "returns a 4-line string suitable for a verbal walkthrough",
        ],
        traceExplanations: [
          "All four parts are defined upfront, in the order an interviewer expects to hear them.",
          "The labeled-line format mirrors how you'd actually pace a spoken answer: one beat per part.",
          "f-strings keep the formatting readable and avoid string concatenation clutter.",
          "A 4-line summary is a sanity check on length — a good STAR answer is concise.",
        ],
      },
      blanks: [
        { line: `@___`, answer: "dataclass" },
        { line: `def ___(self):`, answer: "summary" },
        { line: `f"Situation: {self.___}\\n"`, answer: "situation" },
        { line: `task="Scope a feature that's shippable in 2 weeks and ___ better",`, answer: "measurably" },
        { line: `result="Reranker shipped, ___ relevance, became the template for future feature scoping",`, answer: "+8%" },
      ],
      explanationBlanks: [
        {
          line: "I use the `STARResponse` dataclass to force structure on what could otherwise be a rambling anecdote — `situation`, `task`, `action`, `result` are the four things an interviewer is listening for, and naming them as fields keeps my answer from drifting into irrelevant ___.",
          answer: "detail",
        },
        {
          line: "`situation` sets up the ambiguity concretely: 'a smarter search' with no defined success metric is a real, common scoping problem — vague enough to be relatable, specific enough to sound like it actually ___.",
          answer: "happened",
        },
        {
          line: "`task` reframes the ambiguous ask into something boundable: a 2-week timebox and a requirement for measurability. This is the key prioritization move — converting 'make it better' (unbounded) into 'ship something we can ___' (bounded).",
          answer: "A/B test",
        },
        {
          line: "`action` shows the actual work: picking a concrete metric (`relevance@5`), choosing a small reversible first step (a reranker behind a feature flag), and validating with an A/B test rather than shipping to everyone and ___.",
          answer: "hoping",
        },
        {
          line: "`result` closes the loop with a measurable outcome (`+8% relevance`) and a secondary, often more valuable outcome — the approach itself became reusable. The `summary()` method exists to remind me that a STAR answer should be tellable in under two minutes; if `summary()` would print a wall of text, the answer is too ___.",
          answer: "long",
        },
      ],
    },
  ],
}
