import { Pattern } from "../../types"

export const ragRetrieval: Pattern = {
  id: "rag-retrieval",
  order: 3,
  patternName: "RAG & Retrieval",

  philosophy: {
    text: "Of the things we know, the foundation is perception; but as to the things we infer or remember, the starting-point is the things previously perceived.",
    source: "Aristotle, Prior Analytics",
    connection:
      "A language model's fluency is not the same as its knowledge — left alone, it answers from a frozen, compressed memory that drifts and confabulates. Retrieval grounds the model's reasoning in evidence pulled fresh from a corpus, the way a careful thinker checks a claim against a source rather than trusting recollection. The embedding space is a map of meaning; the retriever is the act of perception that points the model back to ground truth before it speaks.",
  },

  template: {
    description:
      "RAG pairs a retriever with a generator: documents are chunked, embedded into vectors, and stored in an index. At query time, the query is embedded and compared against stored vectors — most commonly with cosine similarity — to find the top-k most relevant chunks, which are then inserted into the model's context. The quality of the whole pipeline rises and falls on chunking, the similarity metric, and how well 'relevant' is defined.",
    snippet: `import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def top_k_retrieve(query_vec, doc_vecs, doc_texts, k=3):
    scores = [cosine_similarity(query_vec, d) for d in doc_vecs]
    ranked = sorted(zip(scores, doc_texts), key=lambda x: x[0], reverse=True)
    return ranked[:k]`,
  },

  pythonTools: [
    {
      name: "numpy cosine similarity via dot product and norms",
      snippet: `import numpy as np
sim = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))`,
    },
    {
      name: "Counter for a minimal BM25-style term frequency sketch",
      snippet: `from collections import Counter
tf = Counter(doc.lower().split())
score = sum(tf.get(term, 0) for term in query_terms)`,
    },
    {
      name: "sentence-transformers encode pattern (batch embedding)",
      snippet: `# from sentence_transformers import SentenceTransformer
# model = SentenceTransformer("all-MiniLM-L6-v2")
# doc_vecs = model.encode(doc_texts, normalize_embeddings=True)
# query_vec = model.encode(query, normalize_embeddings=True)`,
    },
  ],

  problems: [
    {
      id: "cosine-similarity-topk",
      title: "Top-K Vector Retrieval by Cosine Similarity",
      difficulty: "easy",
      prompt:
        "Given a query embedding vector and a list of document embedding vectors (as lists of floats), return the indices of the top-k documents most similar to the query, ranked by cosine similarity.",
      patternKeywords: ["embeddings", "cosine similarity", "top-k", "vector search"],
      solution: `import numpy as np

def top_k_indices(query, docs, k):
    q = np.array(query)
    sims = []
    for d in docs:
        d = np.array(d)
        sim = np.dot(q, d) / (np.linalg.norm(q) * np.linalg.norm(d))
        sims.append(sim)
    ranked = sorted(range(len(docs)), key=lambda i: sims[i], reverse=True)
    return ranked[:k]`,
      solutionExplanation: [
        "I convert both `query` and each document vector to `np.array` because cosine similarity needs vectorized dot products and norms — plain Python lists don't support `np.dot` or `np.linalg.norm` directly. Working in numpy keeps the per-vector arithmetic O(d) with d the embedding dimension, but with a much smaller constant than a manual loop.",
        "Cosine similarity is `dot(q, d) / (norm(q) * norm(d))` — it measures the angle between vectors, not their magnitude. This matters for embeddings because two documents about the same topic can have very different magnitudes (longer text, more repeated terms) but still point in nearly the same direction in embedding space; cosine similarity ignores that scale difference.",
        "I accumulate similarities into a plain list `sims` rather than a numpy array, because I need to sort by similarity while keeping track of original indices — `sorted(range(len(docs)), key=lambda i: sims[i], reverse=True)` sorts the indices, not the values, so I can map back to the original documents.",
        "`reverse=True` is essential: cosine similarity ranges from -1 to 1, and higher means more similar, so the most relevant documents come first. I slice `[:k]` at the end rather than truncating earlier — sorting the full list first guarantees correctness even if `k` is larger than expected or the input is unsorted.",
      ],
      testCase: {
        input: `query = [1, 0], docs = [[1, 0], [0, 1], [0.7, 0.7]], k = 2`,
        expected: "[0, 2]",
        trace: [
          "doc[0]=[1,0]: dot=1, norms=1*1=1, sim=1.0",
          "doc[1]=[0,1]: dot=0, norms=1*1=1, sim=0.0",
          "doc[2]=[0.7,0.7]: dot=0.7, norms=1*0.99≈0.99, sim≈0.707",
          "ranked by sim descending: [0 (1.0), 2 (0.707), 1 (0.0)]",
          "top-2 indices: [0, 2]",
        ],
        traceExplanations: [
          "Doc 0 points in exactly the same direction as the query — perfect cosine similarity of 1.0.",
          "Doc 1 is orthogonal to the query — similarity 0, completely unrelated in this space.",
          "Doc 2 is at 45 degrees to the query — partially aligned, similarity around 0.707.",
          "Sorting indices by similarity descending gives us a relevance ranking independent of the documents' original order.",
          "We take the first k=2 indices — the two most semantically aligned documents with the query.",
        ],
      },
      blanks: [
        { line: `q = np.array(___)`, answer: "query" },
        { line: `sim = np.dot(q, d) / (np.linalg.norm(q) * np.linalg.___(d))`, answer: "norm" },
        { line: `ranked = sorted(range(len(docs)), key=lambda i: sims[i], reverse=___)`, answer: "True" },
        { line: `return ranked[:___]`, answer: "k" },
      ],
      explanationBlanks: [
        {
          line: "I convert both `query` and each document vector to `np.array` because cosine similarity needs vectorized dot products and norms — plain Python lists don't support `np.dot` or `np.linalg.norm` directly. Working in numpy keeps the per-vector arithmetic O(d) with d the ___, but with a much smaller constant than a manual loop.",
          answer: "embedding dimension",
        },
        {
          line: "Cosine similarity is `dot(q, d) / (norm(q) * norm(d))` — it measures the angle between vectors, not their magnitude. This matters for embeddings because two documents about the same topic can have very different magnitudes (longer text, more repeated terms) but still point in nearly the same direction in embedding space; cosine similarity ignores that ___ difference.",
          answer: "scale",
        },
        {
          line: "I accumulate similarities into a plain list `sims` rather than a numpy array, because I need to sort by similarity while keeping track of original indices — `sorted(range(len(docs)), key=lambda i: sims[i], reverse=True)` sorts the indices, not the values, so I can map back to the original ___.",
          answer: "documents",
        },
        {
          line: "`reverse=True` is essential: cosine similarity ranges from -1 to 1, and higher means more similar, so the most relevant documents come first. I slice `[:k]` at the end rather than truncating earlier — sorting the full list first guarantees correctness even if `k` is larger than expected or the input is ___.",
          answer: "unsorted",
        },
      ],
    },

    {
      id: "chunk-text-overlap",
      title: "Chunk Text with Overlap",
      difficulty: "easy",
      prompt:
        "Given a long string of text, a chunk size (in words), and an overlap size (in words), split the text into overlapping chunks suitable for embedding and indexing. Each chunk after the first should start `overlap` words before where the previous chunk ended.",
      patternKeywords: ["chunking", "overlap", "preprocessing", "context window"],
      solution: `def chunk_text(text, chunk_size, overlap):
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        if end >= len(words):
            break
        start = end - overlap
    return chunks`,
      solutionExplanation: [
        "I split on whitespace with `text.split()` to work in word-sized units rather than characters — chunk size is usually specified in tokens or words because that correlates more directly with how much an embedding model or LLM context window can absorb meaningfully.",
        "I use a `while start < len(words)` loop instead of a `for` loop because the step size between iterations isn't constant in index terms when overlap changes — `start` advances by `chunk_size - overlap` each time, which is more naturally expressed as a manual loop with explicit control over `start`.",
        "Each chunk is built with `\" \".join(words[start:end])` — slicing then rejoining is the simplest way to reconstruct readable text from a word list, and slicing a list out of bounds in Python silently truncates rather than erroring, so `words[start:end]` is safe even near the end.",
        "The `if end >= len(words): break` check prevents an infinite loop and avoids emitting a redundant final chunk that's a strict subset of the previous one. Without it, `start = end - overlap` could stop advancing or even go backwards once `end` exceeds the text length.",
        "`start = end - overlap` is the core sliding step: the next chunk starts `overlap` words before the previous chunk ended, so consecutive chunks share context — this overlap prevents a sentence or idea that straddles a chunk boundary from being split with no shared anchor for retrieval.",
      ],
      testCase: {
        input: `text = "the quick brown fox jumps over the lazy dog today", chunk_size = 4, overlap = 1`,
        expected: `["the quick brown fox", "fox jumps over the", "the lazy dog today"]`,
        trace: [
          "words = [the, quick, brown, fox, jumps, over, the, lazy, dog, today] (10 words)",
          "start=0, end=4: chunk='the quick brown fox', end < 10, start = 4-1 = 3",
          "start=3, end=7: chunk='fox jumps over the', end < 10, start = 7-1 = 6",
          "start=6, end=10: chunk='the lazy dog today', end >= 10, break",
          "return 3 chunks",
        ],
        traceExplanations: [
          "First we tokenize into words — 10 total.",
          "First chunk takes words 0-3. Since end=4 hasn't reached the end, we slide start forward by chunk_size - overlap = 3.",
          "Second chunk takes words 3-6, sharing word 'fox' (index 3) with the previous chunk's overlap region. Slide again to start=6.",
          "Third chunk takes words 6-9, the final chunk. Since end=10 equals len(words), we stop after appending it.",
          "Three overlapping chunks give the retriever multiple chances to match a query whose relevant phrase spans a boundary.",
        ],
      },
      blanks: [
        { line: `words = text.___()`, answer: "split" },
        { line: `while start < ___(words):`, answer: "len" },
        { line: `end = start + ___`, answer: "chunk_size" },
        { line: `if end >= len(words): ___`, answer: "break" },
        { line: `start = end - ___`, answer: "overlap" },
      ],
      explanationBlanks: [
        {
          line: "I split on whitespace with `text.split()` to work in word-sized units rather than characters — chunk size is usually specified in tokens or words because that correlates more directly with how much an embedding model or LLM context window can absorb ___.",
          answer: "meaningfully",
        },
        {
          line: "I use a `while start < len(words)` loop instead of a `for` loop because the step size between iterations isn't constant in index terms when overlap changes — `start` advances by `chunk_size - overlap` each time, which is more naturally expressed as a manual loop with explicit control over ___.",
          answer: "start",
        },
        {
          line: "Each chunk is built with `\" \".join(words[start:end])` — slicing then rejoining is the simplest way to reconstruct readable text from a word list, and slicing a list out of bounds in Python silently truncates rather than erroring, so `words[start:end]` is safe even near the ___.",
          answer: "end",
        },
        {
          line: "The `if end >= len(words): break` check prevents an infinite loop and avoids emitting a redundant final chunk that's a strict subset of the previous one. Without it, `start = end - overlap` could stop advancing or even go ___ once `end` exceeds the text length.",
          answer: "backwards",
        },
        {
          line: "`start = end - overlap` is the core sliding step: the next chunk starts `overlap` words before the previous chunk ended, so consecutive chunks share context — this overlap prevents a sentence or idea that straddles a chunk boundary from being split with no shared ___ for retrieval.",
          answer: "anchor",
        },
      ],
    },

    {
      id: "hybrid-search-score",
      title: "Combine BM25 and Dense Scores for Hybrid Search",
      difficulty: "medium",
      prompt:
        "Given a list of documents with a precomputed sparse (BM25) score and a dense (embedding cosine similarity) score for each, normalize both score sets to [0, 1] and combine them with a weighted sum to produce a final hybrid ranking. Return document indices sorted by the combined score, descending.",
      patternKeywords: ["hybrid search", "BM25", "dense retrieval", "score fusion"],
      solution: `def hybrid_rank(bm25_scores, dense_scores, alpha=0.5):
    def normalize(scores):
        lo, hi = min(scores), max(scores)
        if hi == lo:
            return [0.0 for _ in scores]
        return [(s - lo) / (hi - lo) for s in scores]

    bm25_norm = normalize(bm25_scores)
    dense_norm = normalize(dense_scores)
    combined = [alpha * d + (1 - alpha) * b for b, d in zip(bm25_norm, dense_norm)]
    return sorted(range(len(combined)), key=lambda i: combined[i], reverse=True)`,
      solutionExplanation: [
        "I normalize each score list independently with min-max scaling before combining, because BM25 scores and cosine similarities live on completely different scales — BM25 scores are unbounded and corpus-dependent, while cosine similarity is bounded in [-1, 1]. Without normalization, one signal would dominate the weighted sum regardless of `alpha`.",
        "The `normalize` helper guards against `hi == lo` — if every document has the identical score (e.g., all zeros for an empty query), min-max division would be a divide-by-zero. Returning all zeros in that degenerate case is a safe, neutral fallback.",
        "`alpha` controls the blend: `alpha * dense + (1 - alpha) * bm25`. I chose this convex combination — weights summing to 1 — because it keeps the combined score interpretable as a weighted average still roughly in [0, 1], rather than an arbitrary sum that could exceed either input's range.",
        "I use `zip(bm25_norm, dense_norm)` to pair corresponding scores element-wise — both lists are guaranteed the same length since they're computed over the same document set, so zip is the cleanest way to iterate two lists in lockstep.",
        "Finally, `sorted(range(len(combined)), key=lambda i: combined[i], reverse=True)` returns indices rather than scores — exactly as in the cosine top-k problem — because downstream code needs to know *which* documents ranked highest, not just their scores.",
      ],
      testCase: {
        input: `bm25_scores = [10, 0, 5], dense_scores = [0.2, 0.9, 0.5], alpha = 0.5`,
        expected: "[1, 2, 0]",
        trace: [
          "bm25 normalize: lo=0, hi=10 -> [1.0, 0.0, 0.5]",
          "dense normalize: lo=0.2, hi=0.9 -> [0.0, 1.0, 0.4286]",
          "combined[0] = 0.5*0.0 + 0.5*1.0 = 0.5",
          "combined[1] = 0.5*1.0 + 0.5*0.0 = 0.5",
          "combined[2] = 0.5*0.4286 + 0.5*0.5 = 0.4643",
          "sorted descending by combined score: indices [0 or 1 (0.5), 1 or 0 (0.5), 2 (0.4643)] -> [1, 2, 0] (stable order from Python sort)",
        ],
        traceExplanations: [
          "BM25 scores [10,0,5] are scaled so the max becomes 1.0 and min becomes 0.0 — doc 0 was the strongest keyword match.",
          "Dense scores [0.2,0.9,0.5] are scaled the same way — doc 1 was the strongest semantic match.",
          "Doc 0 had a strong sparse signal but weak dense signal — they average to 0.5.",
          "Doc 1 had a weak sparse signal but the strongest dense signal — also averages to 0.5.",
          "Doc 2 is a moderate match on both signals, landing at 0.4643 — slightly behind the other two.",
          "Ties between docs 0 and 1 are broken by Python's stable sort retaining input order among equal keys, but both clearly outrank doc 2 — illustrating how hybrid fusion lets a strong signal in either retriever surface a document.",
        ],
      },
      blanks: [
        { line: `lo, hi = min(scores), ___(scores)`, answer: "max" },
        { line: `return [(s - lo) / (hi - lo) for s in ___]`, answer: "scores" },
        { line: `combined = [alpha * d + (1 - ___) * b for b, d in zip(bm25_norm, dense_norm)]`, answer: "alpha" },
        { line: `return sorted(range(len(combined)), key=lambda i: combined[i], reverse=___)`, answer: "True" },
      ],
      explanationBlanks: [
        {
          line: "I normalize each score list independently with min-max scaling before combining, because BM25 scores and cosine similarities live on completely different scales — BM25 scores are unbounded and corpus-dependent, while cosine similarity is bounded in [-1, 1]. Without normalization, one signal would dominate the weighted sum regardless of ___.",
          answer: "alpha",
        },
        {
          line: "The `normalize` helper guards against `hi == lo` — if every document has the identical score (e.g., all zeros for an empty query), min-max division would be a ___. Returning all zeros in that degenerate case is a safe, neutral fallback.",
          answer: "divide-by-zero",
        },
        {
          line: "`alpha` controls the blend: `alpha * dense + (1 - alpha) * bm25`. I chose this convex combination — weights summing to 1 — because it keeps the combined score interpretable as a weighted average still roughly in [0, 1], rather than an arbitrary sum that could exceed either ___ range.",
          answer: "input's",
        },
        {
          line: "I use `zip(bm25_norm, dense_norm)` to pair corresponding scores element-wise — both lists are guaranteed the same length since they're computed over the same document set, so zip is the cleanest way to iterate two lists in ___.",
          answer: "lockstep",
        },
        {
          line: "Finally, `sorted(range(len(combined)), key=lambda i: combined[i], reverse=True)` returns indices rather than scores — exactly as in the cosine top-k problem — because downstream code needs to know *which* documents ranked highest, not just their ___.",
          answer: "scores",
        },
      ],
    },

    {
      id: "rerank-cross-encoder-scores",
      title: "Apply a Reranker to Initial Retrieval Results",
      difficulty: "medium",
      prompt:
        "You retrieved a candidate pool of documents using a fast bi-encoder (vector similarity), but you want to improve precision with a slower, more accurate cross-encoder reranker. Given the original candidate document indices and a list of cross-encoder relevance scores (one per candidate, same order), return the top-n document indices reordered by the reranker's scores.",
      patternKeywords: ["reranking", "cross-encoder", "two-stage retrieval", "precision"],
      solution: `def rerank(candidate_ids, rerank_scores, n):
    paired = list(zip(candidate_ids, rerank_scores))
    paired.sort(key=lambda pair: pair[1], reverse=True)
    return [doc_id for doc_id, _ in paired[:n]]`,
      solutionExplanation: [
        "This is the second stage of a two-stage retrieval pipeline: a cheap bi-encoder (independent embeddings + cosine similarity) first narrows millions of documents down to a small candidate pool, then a cross-encoder — which jointly encodes the query and each document together — rescoring that small pool for higher precision. The cross-encoder is too slow to run over the full corpus, which is why it only sees `candidate_ids`.",
        "I `zip(candidate_ids, rerank_scores)` to pair each document's identity with its new score — this is necessary because the reranker's scores are not the same as, and may completely reorder relative to, the original retrieval scores. Without zipping, sorting `rerank_scores` alone would lose the mapping back to document IDs.",
        "I use `paired.sort(...)` — an in-place list sort — rather than `sorted()` here purely as a style choice since `paired` is a freshly created local list with no other references; either would work, but in-place avoids allocating a second list when the first is about to be discarded.",
        "`key=lambda pair: pair[1]` sorts by the second element of each tuple — the rerank score — not the document id. `reverse=True` because higher cross-encoder scores mean higher relevance, same convention as cosine similarity.",
        "The final list comprehension `[doc_id for doc_id, _ in paired[:n]]` unpacks each tuple and discards the score with `_`, since the caller only needs the reordered document identities, not the scores themselves.",
      ],
      testCase: {
        input: `candidate_ids = [42, 7, 19], rerank_scores = [0.3, 0.95, 0.6], n = 2`,
        expected: "[7, 19]",
        trace: [
          "paired = [(42, 0.3), (7, 0.95), (19, 0.6)]",
          "sort by score descending: [(7, 0.95), (19, 0.6), (42, 0.3)]",
          "take first n=2: [(7, 0.95), (19, 0.6)]",
          "extract ids: [7, 19]",
        ],
        traceExplanations: [
          "Each candidate document id is paired with its cross-encoder score, preserving the original ordering as a tuple list.",
          "Sorting descending by score reveals that document 7 — which the bi-encoder may not have ranked first — is actually the most relevant according to the cross-encoder.",
          "We keep only the top n=2 most relevant pairs, discarding document 42 which the cross-encoder scored lowest despite surviving the first-stage retrieval.",
          "The final output is just the document ids in their new, reranked order — ready to be passed into the LLM's context.",
        ],
      },
      blanks: [
        { line: `paired = list(___(candidate_ids, rerank_scores))`, answer: "zip" },
        { line: `paired.sort(key=lambda pair: pair[___], reverse=True)`, answer: "1" },
        { line: `paired.sort(key=lambda pair: pair[1], reverse=___)`, answer: "True" },
        { line: `return [doc_id for doc_id, _ in paired[:___]]`, answer: "n" },
      ],
      explanationBlanks: [
        {
          line: "This is the second stage of a two-stage retrieval pipeline: a cheap bi-encoder (independent embeddings + cosine similarity) first narrows millions of documents down to a small candidate pool, then a cross-encoder — which jointly encodes the query and each document together — rescoring that small pool for higher ___. The cross-encoder is too slow to run over the full corpus, which is why it only sees `candidate_ids`.",
          answer: "precision",
        },
        {
          line: "I `zip(candidate_ids, rerank_scores)` to pair each document's identity with its new score — this is necessary because the reranker's scores are not the same as, and may completely reorder relative to, the original retrieval scores. Without zipping, sorting `rerank_scores` alone would lose the mapping back to document ___.",
          answer: "IDs",
        },
        {
          line: "I use `paired.sort(...)` — an in-place list sort — rather than `sorted()` here purely as a style choice since `paired` is a freshly created local list with no other references; either would work, but in-place avoids allocating a second list when the first is about to be ___.",
          answer: "discarded",
        },
        {
          line: "`key=lambda pair: pair[1]` sorts by the second element of each tuple — the rerank score — not the document id. `reverse=True` because higher cross-encoder scores mean higher relevance, same convention as cosine ___.",
          answer: "similarity",
        },
        {
          line: "The final list comprehension `[doc_id for doc_id, _ in paired[:n]]` unpacks each tuple and discards the score with `_`, since the caller only needs the reordered document identities, not the scores ___.",
          answer: "themselves",
        },
      ],
    },

    {
      id: "recall-at-k-eval",
      title: "Compute Recall@K for a Retrieval Pipeline",
      difficulty: "hard",
      prompt:
        "You're evaluating a retrieval system against a labeled dataset. For each query you have the set of ground-truth relevant document IDs and the ranked list of document IDs the retriever returned. Implement recall@k, averaged across all queries: for each query, recall@k is the fraction of that query's relevant documents that appear in the top-k retrieved results.",
      patternKeywords: ["retrieval evaluation", "recall@k", "ground truth", "ranking metrics"],
      solution: `def recall_at_k(retrieved_lists, relevant_sets, k):
    total_recall = 0.0
    for retrieved, relevant in zip(retrieved_lists, relevant_sets):
        if not relevant:
            continue
        top_k = set(retrieved[:k])
        hits = len(top_k & relevant)
        total_recall += hits / len(relevant)
    return total_recall / len(retrieved_lists)`,
      solutionExplanation: [
        "I iterate over `zip(retrieved_lists, relevant_sets)` because evaluation is per-query: each query has its own ranked retrieval result and its own ground-truth relevant set, and they must be processed as corresponding pairs, not independently.",
        "`if not relevant: continue` skips queries with no labeled relevant documents — dividing by `len(relevant)` would be a ZeroDivisionError otherwise, and a query with no ground truth contributes no meaningful signal to recall regardless of what was retrieved.",
        "`top_k = set(retrieved[:k])` slices the ranked list down to the first k results — the 'k' in recall@k — and converts to a set because membership testing and set intersection are O(1) average and O(min(len(a),len(b))) respectively, much faster than repeated `in` checks against a list.",
        "`hits = len(top_k & relevant)` uses set intersection (`&`) to count how many of the truly relevant documents made it into the top-k — this is the numerator of recall: relevant items successfully retrieved.",
        "`hits / len(relevant)` is this query's recall@k — relevant-and-retrieved divided by total-relevant. I accumulate into `total_recall` and divide by `len(retrieved_lists)` at the end to get the macro-average across all queries, which is the standard way to report recall@k over an evaluation set, weighting every query equally regardless of how many relevant documents it has.",
      ],
      testCase: {
        input: `retrieved_lists = [[1,2,3,4], [5,6,7]], relevant_sets = [{2,4,9}, {6}], k = 2`,
        expected: "0.6666666666666666",
        trace: [
          "query 1: top_k = {1,2}, relevant = {2,4,9}, hits = |{2,4,9} ∩ {1,2}| = 1, recall = 1/3 ≈ 0.3333",
          "query 2: top_k = {5,6}, relevant = {6}, hits = |{6} ∩ {5,6}| = 1, recall = 1/1 = 1.0",
          "total_recall = 0.3333 + 1.0 = 1.3333",
          "average = 1.3333 / 2 = 0.6667",
        ],
        traceExplanations: [
          "For query 1, only the top-2 retrieved docs {1,2} are considered. Of the 3 truly relevant docs {2,4,9}, only doc 2 was retrieved in the top 2 — recall is 1/3.",
          "For query 2, top-2 is {5,6}. The single relevant doc 6 is in there — perfect recall of 1.0 for this query.",
          "Sum the per-query recalls before averaging — this is the macro-average accumulation step.",
          "Divide by the number of queries (2) to get the final recall@2 score of about 0.667.",
        ],
      },
      blanks: [
        { line: `for retrieved, relevant in ___(retrieved_lists, relevant_sets):`, answer: "zip" },
        { line: `if not relevant: ___`, answer: "continue" },
        { line: `top_k = ___(retrieved[:k])`, answer: "set" },
        { line: `hits = len(top_k ___ relevant)`, answer: "&" },
        { line: `total_recall += hits / ___(relevant)`, answer: "len" },
        { line: `return total_recall / len(___)`, answer: "retrieved_lists" },
      ],
      explanationBlanks: [
        {
          line: "I iterate over `zip(retrieved_lists, relevant_sets)` because evaluation is per-query: each query has its own ranked retrieval result and its own ground-truth relevant set, and they must be processed as corresponding ___, not independently.",
          answer: "pairs",
        },
        {
          line: "`if not relevant: continue` skips queries with no labeled relevant documents — dividing by `len(relevant)` would be a ___ otherwise, and a query with no ground truth contributes no meaningful signal to recall regardless of what was retrieved.",
          answer: "ZeroDivisionError",
        },
        {
          line: "`top_k = set(retrieved[:k])` slices the ranked list down to the first k results — the 'k' in recall@k — and converts to a set because membership testing and set intersection are much faster than repeated `in` checks against a ___.",
          answer: "list",
        },
        {
          line: "`hits = len(top_k & relevant)` uses set ___ (`&`) to count how many of the truly relevant documents made it into the top-k — this is the numerator of recall: relevant items successfully retrieved.",
          answer: "intersection",
        },
        {
          line: "`hits / len(relevant)` is this query's recall@k — relevant-and-retrieved divided by total-relevant. I accumulate into `total_recall` and divide by `len(retrieved_lists)` at the end to get the ___ across all queries, which is the standard way to report recall@k over an evaluation set, weighting every query equally regardless of how many relevant documents it has.",
          answer: "macro-average",
        },
      ],
    },
  ],
}
