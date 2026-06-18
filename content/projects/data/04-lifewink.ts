import { Project } from "../types"

export const lifewink: Project = {
  id: "lifewink",
  order: 4,
  name: "Lifewink",
  tagline:
    "Context-aware AI search backend that turns raw user metadata into real-time, relevant content retrieval.",
  techStack: [
    "LangChain",
    "AWS Lambda",
    "Amazon API Gateway",
    "OpenSearch (k-NN / vector search)",
    "OpenSearch hybrid (BM25 + vector) search",
    "Embedding model (e.g. OpenAI / Sentence-Transformers)",
    "DynamoDB (user metadata store)",
    "Python",
  ],
  highLevelSummary: [
    {
      line: "Lifewink's search backend takes raw signals about a user — things like recent activity, stated interests, and behavioral metadata — and turns them into a ___ query so the content we surface actually matches what that person cares about right now.",
      answer: "vector",
    },
    {
      line: "Instead of relying on static keyword search, we built a dynamic query transformation pipeline using ___ that reformulates and enriches the user's context before it ever hits the search index.",
      answer: "LangChain",
    },
    {
      line: "The whole thing runs on ___, so we get serverless scaling — the backend spins up only when a query comes in and scales out automatically under load without us managing servers.",
      answer: "AWS Lambda",
    },
    {
      line: "End to end, the system is built to retrieve and surface relevant content in ___, which matters because stale or slow recommendations basically defeat the purpose of a personalization feature.",
      answer: "real time",
    },
  ],
  workflowSummary: [
    {
      line: "It starts when raw user metadata — session activity, profile attributes, recent interactions — lands in a ___ that acts as the source of truth for what we know about that user.",
      answer: "metadata store (DynamoDB)",
    },
    {
      line: "A request comes in through ___, which is the entry point that triggers our Lambda function and handles auth, throttling, and routing for the search backend.",
      answer: "API Gateway",
    },
    {
      line: "Inside the Lambda, we use a LangChain ___ to take that raw metadata and decide what actually matters for this query — filtering noise and pulling out the signals worth encoding.",
      answer: "transformation chain",
    },
    {
      line: "That chain reformulates the cleaned-up context into a structured prompt, which we pass to an ___ to get back a dense vector representation of the user's intent.",
      answer: "embedding model",
    },
    {
      line: "We don't throw away lexical signals either — the pipeline also derives keyword filters from the metadata so we can run a ___ search instead of relying purely on vector similarity.",
      answer: "hybrid",
    },
    {
      line: "That combined query — dense vector plus keyword filters — gets sent to ___, where we run an approximate k-NN search over indexed content embeddings.",
      answer: "OpenSearch",
    },
    {
      line: "OpenSearch returns the nearest-neighbor candidates ranked by similarity, and we apply a lightweight re-ranking step in the same Lambda invocation using ___ as additional signal alongside the vector score.",
      answer: "the keyword/BM25 score",
    },
    {
      line: "Because each invocation is stateless and short-lived, ___ lets the whole pipeline scale horizontally with traffic instead of us provisioning a fixed-size search service.",
      answer: "AWS Lambda",
    },
    {
      line: "The final ranked results get serialized and returned through the same API Gateway response path, so the caller sees ___ content recommendations within a single request-response cycle.",
      answer: "real-time",
    },
    {
      line: "As user metadata changes — new activity, updated interests — the next request simply re-runs the transformation pipeline, so personalization stays current without any separate ___ job.",
      answer: "batch retraining",
    },
  ],
  technicalQuestions: [
    {
      question: "What does 'dynamic query transformation' actually mean here?",
      answer:
        "It means the query sent to OpenSearch isn't a fixed template — it's assembled per-request from whatever metadata we have about the user at that moment. A LangChain chain decides which fields are relevant, normalizes and summarizes them, and reformulates them into both an embedding prompt and a set of keyword filters. The 'transformation' is that raw, unstructured metadata becomes a structured, optimized query tailored to that specific user and moment, rather than a static search string.",
    },
    {
      question: "Why Lambda instead of a long-running service?",
      answer:
        "Search traffic here is bursty and unpredictable — it tracks user activity, not a steady load. Lambda lets us scale to zero when there's no traffic and scale out automatically during spikes without capacity planning or running idle infrastructure. Since each query is a self-contained transform-then-search operation with no need for persistent in-memory state between requests, it maps cleanly onto a stateless function model.",
    },
    {
      question: "How do you handle cold starts in a latency-sensitive search path?",
      answer:
        "We keep the Lambda's dependencies lean — the LangChain chain and embedding client are initialized once at module load and reused across warm invocations, not rebuilt per request. We also rely on provisioned concurrency for the search function during expected traffic windows to avoid cold starts on the critical path, and keep the deployment package small so cold init time itself stays low when a cold start is unavoidable.",
    },
    {
      question: "Why OpenSearch over a dedicated vector DB like Pinecone?",
      answer:
        "We needed both vector similarity and traditional keyword/metadata filtering in the same query, since relevance here depends on more than just embedding distance — recency, content type, and other structured fields matter too. OpenSearch's k-NN plugin gives us approximate nearest-neighbor search alongside its existing full-text and filtering capabilities, so we get hybrid search in one system instead of stitching together a vector DB and a separate search engine.",
    },
    {
      question: "How do you keep embeddings and queries fresh as metadata changes?",
      answer:
        "User-side embeddings aren't precomputed and cached for long — they're generated fresh on each request from the current metadata snapshot, so personalization reflects the latest signal without a stale cache to invalidate. Content-side embeddings, which change far less often, are reindexed into OpenSearch through a separate ingestion path whenever content is added or updated, decoupling content freshness from query-time latency.",
    },
    {
      question: "What happens if the embedding model or OpenSearch is slow or unavailable?",
      answer:
        "The Lambda sets tight timeouts on both the embedding call and the OpenSearch query, and falls back to the keyword-only filters derived earlier in the pipeline if the vector step fails, so we degrade to lexical search rather than failing the request outright. We also log these fallback events so we can see how often vector retrieval is unavailable and whether it's a capacity or transient network issue.",
    },
    {
      question: "How do you decide which metadata fields actually matter for a given query?",
      answer:
        "That logic lives in the LangChain transformation step — it applies a set of rules and prompt-based heuristics to weigh recency and specificity, preferring explicit signals like stated interests over weaker ones like passive browsing history. It's tuned iteratively by looking at retrieval quality on sample queries rather than hard-coded once and forgotten.",
    },
    {
      question: "How would you scale this if query volume grew 10x?",
      answer:
        "Lambda concurrency scales automatically, so the orchestration layer isn't the bottleneck — the constraint would shift to OpenSearch cluster capacity and the embedding model's throughput. I'd address that by sharding the OpenSearch index, adding read replicas, and potentially batching or caching embedding calls for repeated metadata patterns to cut down on redundant inference calls under heavy load.",
    },
  ],
}
