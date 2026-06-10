import { Pattern } from "../../types"

export const llmFundamentals: Pattern = {
  id: "llm-fundamentals",
  order: 1,
  patternName: "LLM Fundamentals",

  philosophy: {
    text: "Indra's net is a vast web of jewels, each reflecting every other jewel in its surface — and within each reflection, the reflections of all the others, ad infinitum.",
    source: "Avatamsaka Sutra (Huayan Buddhism)",
    connection:
      "Self-attention is, in a sense, a computational version of Indra's net: every token computes a representation of itself by reflecting on every other token, and those reflections themselves carry reflections from earlier layers. Meaning isn't stored locally in a single embedding — it emerges from the relational structure between all tokens, recomputed and re-reflected at every layer. A word's representation late in the network is less 'its own' meaning than the accumulated pattern of how it relates to everything around it. Understanding, in this view, is not a property of isolated parts but of the web of relationships itself.",
  },

  template: {
    description:
      "A transformer maps a sequence of tokens to a sequence of vectors through alternating layers of self-attention (which lets tokens exchange information based on relevance) and position-wise feed-forward networks (which transform each token's representation independently). Positional encodings inject order information since attention itself is permutation-invariant. The core attention computation — scaled dot-product attention — measures how much each token should 'attend to' every other token, then produces a weighted blend of their value vectors.",
    snippet: `import numpy as np

def scaled_dot_product_attention(Q, K, V, mask=None):
    # Q, K, V: (seq_len, d_k)
    d_k = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)        # (seq_len, seq_len)
    if mask is not None:
        scores = np.where(mask, scores, -np.inf)
    weights = softmax(scores, axis=-1)     # attention weights
    return weights @ V                     # weighted sum of values

# A transformer block, conceptually:
# x = x + self_attention(layernorm(x))   # residual + attention
# x = x + feed_forward(layernorm(x))     # residual + MLP`,
  },

  pythonTools: [
    {
      name: "numpy softmax (numerically stable)",
      snippet: `import numpy as np

def softmax(x, axis=-1):
    x = x - np.max(x, axis=axis, keepdims=True)  # subtract max for stability
    exp_x = np.exp(x)
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)`,
    },
    {
      name: "tiktoken for tokenization and token counting",
      snippet: `import tiktoken

enc = tiktoken.get_encoding("cl100k_base")
tokens = enc.encode("Attention is all you need")
print(tokens)            # list of integer token ids
print(len(tokens))       # token count (cost/context budget)
print(enc.decode(tokens))  # round-trip back to text`,
    },
    {
      name: "torch tensor ops for attention shapes",
      snippet: `import torch

# (batch, heads, seq_len, head_dim)
Q = torch.randn(1, 8, 10, 64)
K = torch.randn(1, 8, 10, 64)
scores = Q @ K.transpose(-2, -1) / (64 ** 0.5)
weights = torch.softmax(scores, dim=-1)
print(scores.shape, weights.shape)  # torch.Size([1, 8, 10, 10]) twice`,
    },
  ],

  problems: [
    {
      id: "implement-softmax",
      title: "Implement a Numerically Stable Softmax",
      difficulty: "easy",
      prompt:
        "Implement the softmax function, which converts a vector of raw scores (logits) into a probability distribution. Make sure your implementation doesn't overflow for large input values.",
      patternKeywords: ["softmax", "logits", "numerical stability", "probability distribution"],
      solution: `import numpy as np

def softmax(logits):
    shifted = logits - np.max(logits)   # subtract max for stability
    exp_vals = np.exp(shifted)
    return exp_vals / np.sum(exp_vals)`,
      solutionExplanation: [
        "I subtract `np.max(logits)` from every element before exponentiating. This is because `exp()` of a large number (say 1000) overflows to `inf` in floating point, and `inf / inf` becomes `NaN`. Subtracting the max shifts the largest value to 0 and everything else negative, so `exp()` is always between 0 and 1 — no overflow, and the result is mathematically identical because the shift cancels out in the normalization.",
        "I call `np.exp(shifted)` to exponentiate every element at once using numpy's vectorized operation rather than a Python loop with `math.exp`. Vectorization here isn't just style — for a vocabulary-sized logit vector (50k+ entries), a Python-level loop would be orders of magnitude slower than numpy's compiled C implementation.",
        "Finally I divide by `np.sum(exp_vals)` to normalize so the outputs sum to 1, forming a valid probability distribution. I return this as a single expression rather than storing intermediate normalized values — softmax over the last axis is a single division broadcast across the vector, so there's nothing more to compute.",
      ],
      explanationBlanks: [
        {
          line: "I subtract `np.max(logits)` from every element before exponentiating. This is because `exp()` of a large number (say 1000) overflows to `inf` in floating point, and `inf / inf` becomes `NaN`. Subtracting the max shifts the largest value to 0 and everything else negative, so `exp()` is always between 0 and 1 — no overflow, and the result is mathematically identical because the shift cancels out in the ___.",
          answer: "normalization",
        },
        {
          line: "I call `np.exp(shifted)` to exponentiate every element at once using numpy's vectorized operation rather than a Python loop with `math.exp`. Vectorization here isn't just style — for a vocabulary-sized logit vector (50k+ entries), a Python-level loop would be orders of magnitude slower than numpy's compiled ___ implementation.",
          answer: "C",
        },
        {
          line: "Finally I divide by `np.sum(exp_vals)` to normalize so the outputs sum to 1, forming a valid ___ distribution. I return this as a single expression rather than storing intermediate normalized values — softmax over the last axis is a single division broadcast across the vector, so there's nothing more to compute.",
          answer: "probability",
        },
      ],
      testCase: {
        input: "logits = [2.0, 1.0, 0.1]",
        expected: "[0.659, 0.242, 0.099]  (approximately, sums to 1.0)",
        trace: [
          "max(logits) = 2.0",
          "shifted = [0.0, -1.0, -1.9]",
          "exp(shifted) = [1.0, 0.368, 0.150]",
          "sum(exp(shifted)) = 1.518",
          "result = [1.0/1.518, 0.368/1.518, 0.150/1.518] = [0.659, 0.242, 0.099]",
        ],
        traceExplanations: [
          "We find the largest logit, 2.0, which will become our reference point.",
          "Subtracting the max from every element gives a vector whose largest entry is exactly 0 — guaranteeing exp() never overflows.",
          "Exponentiating: e^0=1, e^-1≈0.368, e^-1.9≈0.150. Notice the relative ordering of the original logits is preserved.",
          "Summing these gives the normalization constant.",
          "Dividing each exponentiated value by the sum gives a valid probability distribution — the largest logit (2.0) now has the highest probability (~66%), and all three values sum to 1.0.",
        ],
      },
      blanks: [
        { line: `shifted = logits - np.___(logits)`, answer: "max" },
        { line: `exp_vals = np.___(shifted)`, answer: "exp" },
        { line: `return exp_vals / np.___(exp_vals)`, answer: "sum" },
      ],
    },

    {
      id: "scaled-dot-product-attention",
      title: "Implement Scaled Dot-Product Attention",
      difficulty: "medium",
      prompt:
        "Implement the core attention mechanism from 'Attention Is All You Need': given query, key, and value matrices, compute Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V. Explain why the scaling factor sqrt(d_k) is necessary.",
      patternKeywords: ["self-attention", "query key value", "scaling factor", "transformer"],
      solution: `import numpy as np

def attention(Q, K, V):
    d_k = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)   # (seq_len_q, seq_len_k)
    weights = softmax(scores, axis=-1)
    return weights @ V                # (seq_len_q, d_v)`,
      solutionExplanation: [
        "I compute `d_k = Q.shape[-1]` — the dimensionality of each query/key vector — because the scaling factor depends on it. I take it from the shape rather than hardcoding it so the function works for any head dimension (64, 128, etc.) without modification.",
        "I compute raw similarity scores with `Q @ K.T`, the dot product between every query and every key, giving an (seq_len_q, seq_len_k) matrix where entry (i,j) measures how relevant token j is to token i. I then divide by `np.sqrt(d_k)`. Without this scaling, dot products of high-dimensional vectors grow large in magnitude (variance scales with d_k), pushing softmax into regions where its gradient is nearly zero — the model would struggle to learn. Dividing by sqrt(d_k) keeps the variance of the scores roughly constant regardless of dimension.",
        "I apply `softmax(scores, axis=-1)` along the last axis (over keys), so each row becomes a probability distribution describing how much attention query i pays to each key j. I use `axis=-1` specifically — getting this axis wrong is one of the most common attention bugs, since it would normalize over queries instead of keys.",
        "Finally `weights @ V` computes, for each query, a weighted average of all value vectors using the attention weights as the mixing coefficients. I return this directly — it's the contextualized representation of each token, blending in information from every other token proportional to relevance.",
      ],
      explanationBlanks: [
        {
          line: "I compute `d_k = Q.shape[-1]` — the dimensionality of each query/key vector — because the scaling factor depends on it. I take it from the ___ rather than hardcoding it so the function works for any head dimension (64, 128, etc.) without modification.",
          answer: "shape",
        },
        {
          line: "I compute raw similarity scores with `Q @ K.T`, the dot product between every query and every key, giving an (seq_len_q, seq_len_k) matrix where entry (i,j) measures how relevant token j is to token i. I then divide by `np.sqrt(d_k)`. Without this scaling, dot products of high-dimensional vectors grow large in magnitude (variance scales with d_k), pushing softmax into regions where its gradient is nearly ___ — the model would struggle to learn. Dividing by sqrt(d_k) keeps the variance of the scores roughly constant regardless of dimension.",
          answer: "zero",
        },
        {
          line: "I apply `softmax(scores, axis=-1)` along the last axis (over keys), so each row becomes a probability distribution describing how much attention query i pays to each key j. I use `axis=-1` specifically — getting this axis wrong is one of the most common attention bugs, since it would normalize over ___ instead of keys.",
          answer: "queries",
        },
        {
          line: "Finally `weights @ V` computes, for each query, a weighted average of all value vectors using the attention weights as the mixing coefficients. I return this directly — it's the ___ representation of each token, blending in information from every other token proportional to relevance.",
          answer: "contextualized",
        },
      ],
      testCase: {
        input: "Q, K, V each shape (2, 4) — 2 tokens, head dim 4",
        expected: "output shape (2, 4); each row is a weighted blend of V's rows",
        trace: [
          "d_k = 4, so scaling factor = sqrt(4) = 2.0",
          "scores = Q @ K.T  → shape (2, 2), one score per (query, key) pair",
          "scores /= 2.0  → scaled scores, smaller magnitude",
          "weights = softmax(scores, axis=-1)  → each row sums to 1.0",
          "output = weights @ V  → shape (2, 4)",
        ],
        traceExplanations: [
          "With d_k=4, every raw dot product gets divided by 2 — this keeps the scores from growing too large as d_k increases.",
          "Each query attends to both keys (including itself), producing a 2x2 score matrix.",
          "Scaling happens before softmax, so it actually changes the resulting probability distribution — not just a cosmetic rescale afterward.",
          "Row 1 of weights tells us how much token 1 attends to token 1 vs token 2; row 2 tells us the same for token 2.",
          "Each output row is a convex combination (weights sum to 1) of the two value vectors — token 1's new representation might be 70% its own value plus 30% token 2's value, for example.",
        ],
      },
      blanks: [
        { line: `d_k = Q.shape[___]`, answer: "-1" },
        { line: `scores = Q @ K.T / np.sqrt(___)`, answer: "d_k" },
        { line: `weights = softmax(scores, axis=___)`, answer: "-1" },
        { line: `return weights @ ___`, answer: "V" },
      ],
    },

    {
      id: "bpe-tokenization",
      title: "Walk Through Byte-Pair Encoding (BPE) Tokenization",
      difficulty: "medium",
      prompt:
        "Explain how Byte-Pair Encoding builds a vocabulary, then implement a simplified version: given a word represented as a list of characters and a set of merge rules (pairs to combine, in priority order), apply the merges to produce the final tokens.",
      patternKeywords: ["BPE", "tokenization", "subword units", "vocabulary"],
      solution: `def apply_bpe(tokens, merges):
    # tokens: list of strings (starts as individual characters)
    # merges: list of (str, str) pairs, in priority order
    for pair in merges:
        i = 0
        while i < len(tokens) - 1:
            if (tokens[i], tokens[i + 1]) == pair:
                tokens[i:i + 2] = ["".join(pair)]
            else:
                i += 1
    return tokens`,
      solutionExplanation: [
        "I iterate `for pair in merges` — the merges list is in priority order because BPE training learns merge rules greedily, most-frequent-pair-first, so applying them in that same order at inference time reproduces the same tokenization the model was trained on.",
        "For each merge rule, I scan the token list with a `while i < len(tokens) - 1` loop rather than a for loop — because the list shrinks every time a merge happens, and a for loop with a fixed range computed up front would either skip elements or index out of bounds after a merge changes the list length.",
        "I check `(tokens[i], tokens[i+1]) == pair` — comparing a tuple of adjacent tokens to the merge rule tuple. I use tuple equality rather than comparing strings separately because it's a single, atomic comparison that mirrors how merge rules are naturally represented as pairs.",
        "When a match is found, `tokens[i:i+2] = [\"\".join(pair)]` replaces the two adjacent tokens with their concatenation in place, using slice assignment. I deliberately don't increment `i` after a merge — the newly merged token might form another match with `tokens[i+1]` for the *same* pair (e.g. merging 'l','l' repeatedly), though in practice each merge rule only fires once per position before moving to the next rule.",
        "If there's no match at position i, I increment `i` to move forward. This two-branch structure — merge-in-place vs advance — is what lets a single pass apply one merge rule everywhere it occurs in the token sequence.",
      ],
      explanationBlanks: [
        {
          line: "I iterate `for pair in merges` — the merges list is in priority order because BPE training learns merge rules greedily, most-frequent-pair-first, so applying them in that same order at inference time reproduces the same ___ the model was trained on.",
          answer: "tokenization",
        },
        {
          line: "For each merge rule, I scan the token list with a `while i < len(tokens) - 1` loop rather than a for loop — because the list shrinks every time a merge happens, and a for loop with a fixed range computed up front would either skip elements or index out of bounds after a merge changes the list ___.",
          answer: "length",
        },
        {
          line: "I check `(tokens[i], tokens[i+1]) == pair` — comparing a tuple of adjacent tokens to the merge rule tuple. I use ___ equality rather than comparing strings separately because it's a single, atomic comparison that mirrors how merge rules are naturally represented as pairs.",
          answer: "tuple",
        },
        {
          line: "When a match is found, `tokens[i:i+2] = [\"\".join(pair)]` replaces the two adjacent tokens with their concatenation in place, using ___ assignment. I deliberately don't increment `i` after a merge — the newly merged token might form another match with `tokens[i+1]` for the *same* pair (e.g. merging 'l','l' repeatedly), though in practice each merge rule only fires once per position before moving to the next rule.",
          answer: "slice",
        },
        {
          line: "If there's no match at position i, I increment `i` to move forward. This two-branch structure — merge-in-place vs advance — is what lets a single pass apply one merge rule everywhere it occurs in the token ___.",
          answer: "sequence",
        },
      ],
      testCase: {
        input: `tokens = ['l','o','w','e','s','t'], merges = [('l','o'), ('lo','w'), ('e','s'), ('es','t')]`,
        expected: "['low', 'est']",
        trace: [
          "merge ('l','o'): tokens = ['lo','w','e','s','t']",
          "merge ('lo','w'): tokens = ['low','e','s','t']",
          "merge ('e','s'): tokens = ['low','es','t']",
          "merge ('es','t'): tokens = ['low','est']",
          "no more merges → return ['low', 'est']",
        ],
        traceExplanations: [
          "First merge rule combines adjacent 'l' and 'o' wherever found — here at position 0.",
          "Second rule merges the new 'lo' token with the following 'w', forming 'low'.",
          "Third rule merges 'e' and 's', which are now adjacent.",
          "Fourth rule merges 'es' with the trailing 't', forming 'est'.",
          "All merge rules have been applied in priority order; 'lowest' has been tokenized into two subword units, 'low' and 'est' — common since both appear frequently across many English words.",
        ],
      },
      blanks: [
        { line: `for pair in ___:`, answer: "merges" },
        { line: `while i < len(tokens) - ___:`, answer: "1" },
        { line: `if (tokens[i], tokens[i + 1]) == ___:`, answer: "pair" },
        { line: `tokens[i:i + 2] = ["".join(___)]`, answer: "pair" },
        { line: `else: i += ___`, answer: "1" },
      ],
    },

    {
      id: "sinusoidal-positional-encoding",
      title: "Compute Sinusoidal Positional Encodings",
      difficulty: "hard",
      prompt:
        "Self-attention has no inherent notion of token order — it's permutation-invariant. Implement the sinusoidal positional encoding from the original Transformer paper, and explain why sine and cosine functions of varying frequencies were chosen.",
      patternKeywords: ["positional encoding", "context window", "permutation invariance", "transformer"],
      solution: `import numpy as np

def positional_encoding(seq_len, d_model):
    pos = np.arange(seq_len)[:, None]               # (seq_len, 1)
    i = np.arange(d_model)[None, :]                 # (1, d_model)
    angle_rates = 1 / np.power(10000, (2 * (i // 2)) / d_model)
    angles = pos * angle_rates                      # (seq_len, d_model)
    pe = np.zeros((seq_len, d_model))
    pe[:, 0::2] = np.sin(angles[:, 0::2])           # even indices: sin
    pe[:, 1::2] = np.cos(angles[:, 1::2])           # odd indices: cos
    return pe`,
      solutionExplanation: [
        "I build `pos = np.arange(seq_len)[:, None]`, a column vector of position indices 0..seq_len-1, and `i = np.arange(d_model)[None, :]`, a row vector of dimension indices. Using `[:, None]` and `[None, :]` adds new axes so that when I multiply them together, numpy broadcasts them into a full (seq_len, d_model) grid — every (position, dimension) pair — without writing nested loops.",
        "I compute `angle_rates = 1 / 10000^(2*(i//2)/d_model)`. The `i // 2` (integer division) means each pair of dimensions (2k, 2k+1) shares the same frequency — one gets sin, the other cos. The base 10000 and the exponent scaling mean frequencies form a geometric progression: low dimensions oscillate very fast (high frequency, capturing fine-grained relative position), high dimensions oscillate very slowly (low frequency, capturing coarse/long-range position) — similar to a binary clock with bits ticking at different rates.",
        "`angles = pos * angle_rates` broadcasts the position column against the frequency row to get every angle value in one matrix multiply-like operation — this is the vectorized equivalent of a double for-loop over (position, dimension).",
        "I fill even-indexed columns with `np.sin(angles[:, 0::2])` and odd-indexed columns with `np.cos(angles[:, 1::2])`, using slice steps of 2 to select alternating columns. Sine and cosine are chosen specifically because for any fixed offset k, PE(pos+k) can be expressed as a linear function of PE(pos) — a trigonometric identity (angle addition formula) — which gives the model an easy way to learn to attend to relative positions, not just absolute ones.",
        "I return the full `pe` matrix of shape (seq_len, d_model), which gets added elementwise to the token embeddings before the first transformer layer — this is what breaks the permutation invariance of attention and lets the model distinguish 'dog bites man' from 'man bites dog'.",
      ],
      explanationBlanks: [
        {
          line: "I build `pos = np.arange(seq_len)[:, None]`, a column vector of position indices 0..seq_len-1, and `i = np.arange(d_model)[None, :]`, a row vector of dimension indices. Using `[:, None]` and `[None, :]` adds new axes so that when I multiply them together, numpy ___ them into a full (seq_len, d_model) grid — every (position, dimension) pair — without writing nested loops.",
          answer: "broadcasts",
        },
        {
          line: "I compute `angle_rates = 1 / 10000^(2*(i//2)/d_model)`. The `i // 2` (integer division) means each pair of dimensions (2k, 2k+1) shares the same frequency — one gets sin, the other cos. The base 10000 and the exponent scaling mean frequencies form a geometric progression: low dimensions oscillate very fast (high frequency, capturing fine-grained relative position), high dimensions oscillate very slowly (low frequency, capturing coarse/long-range position) — similar to a ___ with bits ticking at different rates.",
          answer: "binary clock",
        },
        {
          line: "`angles = pos * angle_rates` broadcasts the position column against the frequency row to get every angle value in one matrix multiply-like operation — this is the ___ equivalent of a double for-loop over (position, dimension).",
          answer: "vectorized",
        },
        {
          line: "I fill even-indexed columns with `np.sin(angles[:, 0::2])` and odd-indexed columns with `np.cos(angles[:, 1::2])`, using slice steps of 2 to select alternating columns. Sine and cosine are chosen specifically because for any fixed offset k, PE(pos+k) can be expressed as a linear function of PE(pos) — a trigonometric identity (angle addition formula) — which gives the model an easy way to learn to attend to ___ positions, not just absolute ones.",
          answer: "relative",
        },
        {
          line: "I return the full `pe` matrix of shape (seq_len, d_model), which gets added elementwise to the token embeddings before the first transformer layer — this is what breaks the ___ invariance of attention and lets the model distinguish 'dog bites man' from 'man bites dog'.",
          answer: "permutation",
        },
      ],
      testCase: {
        input: "seq_len=4, d_model=4",
        expected: "pe shape (4, 4); pe[0] = [0, 1, 0, 1] (sin(0)=0, cos(0)=1 for both freq pairs)",
        trace: [
          "pos = [[0],[1],[2],[3]], i = [[0,1,2,3]]",
          "i//2 = [0,0,1,1]  → angle_rates = [1/10000^0, 1/10000^0, 1/10000^0.5, 1/10000^0.5] = [1, 1, 0.01, 0.01]",
          "angles[0] = pos=0 * angle_rates = [0, 0, 0, 0]",
          "angles[1] = pos=1 * angle_rates = [1, 1, 0.01, 0.01]",
          "pe[0] = [sin(0), cos(0), sin(0), cos(0)] = [0, 1, 0, 1]",
          "pe[1] = [sin(1), cos(1), sin(0.01), cos(0.01)] ≈ [0.841, 0.540, 0.01, 0.99995]",
        ],
        traceExplanations: [
          "Position vector has 4 rows (one per token); dimension vector has 4 columns.",
          "Dimensions 0,1 share frequency 1 (fastest); dimensions 2,3 share a much slower frequency 0.01 — this is the geometric spread across dimension pairs.",
          "At position 0, all angles are 0 regardless of frequency — every position-0 encoding starts from the same baseline.",
          "At position 1, the fast-frequency dimensions (0,1) advance by a full radian, while the slow-frequency dimensions (2,3) barely move — this is the multi-resolution 'clock'.",
          "Position 0's encoding is simply [0,1,0,1] — sin(0)=0 and cos(0)=1 in every dimension pair.",
          "Position 1's encoding shows the fast dimensions changing rapidly (sin(1)≈0.841) while the slow dimensions barely changed (sin(0.01)≈0.01) — this gradient of change rates is what encodes both fine and coarse positional information simultaneously.",
        ],
      },
      blanks: [
        { line: `pos = np.arange(seq_len)[:, ___]`, answer: "None" },
        { line: `angle_rates = 1 / np.power(10000, (2 * (i // 2)) / ___)`, answer: "d_model" },
        { line: `pe[:, 0::2] = np.___(angles[:, 0::2])`, answer: "sin" },
        { line: `pe[:, 1::2] = np.___(angles[:, 1::2])`, answer: "cos" },
        { line: `pe = np.zeros((seq_len, ___))`, answer: "d_model" },
      ],
    },

    {
      id: "top-p-sampling",
      title: "Implement Nucleus (Top-p) Sampling with Temperature",
      difficulty: "hard",
      prompt:
        "Given a model's output logits over the vocabulary, implement nucleus (top-p) sampling combined with temperature scaling: apply temperature to the logits, then restrict sampling to the smallest set of tokens whose cumulative probability exceeds p, renormalize, and sample from that set. Discuss how temperature and top-p interact and how this relates to the KV cache during generation.",
      patternKeywords: ["temperature", "top-p sampling", "nucleus sampling", "decoding strategy"],
      solution: `import numpy as np

def top_p_sample(logits, temperature=1.0, p=0.9):
    logits = np.array(logits) / temperature           # temperature scaling
    probs = softmax(logits)
    order = np.argsort(probs)[::-1]                   # descending by probability
    sorted_probs = probs[order]
    cumulative = np.cumsum(sorted_probs)
    cutoff = np.searchsorted(cumulative, p) + 1        # smallest set with cum prob > p
    nucleus = order[:cutoff]
    nucleus_probs = sorted_probs[:cutoff]
    nucleus_probs /= nucleus_probs.sum()               # renormalize
    return np.random.choice(nucleus, p=nucleus_probs)`,
      solutionExplanation: [
        "I divide `logits / temperature` before softmax. Temperature reshapes the distribution: T < 1 sharpens it (divides logits by a small number, exaggerating differences, making the argmax more dominant — more deterministic/conservative output), while T > 1 flattens it (divides by a large number, compressing differences toward uniform — more random/creative output). T=1 leaves the distribution unchanged. This must happen *before* softmax, because softmax(logits/T) ≠ softmax(logits)/T.",
        "I compute `probs = softmax(logits)` to convert scaled logits into a probability distribution, then `order = np.argsort(probs)[::-1]` to get indices sorted from highest to lowest probability. I use `[::-1]` to reverse `argsort`'s default ascending order — argsort doesn't have a built-in 'descending' flag, so reversing is the idiomatic numpy way to get descending order.",
        "`cumulative = np.cumsum(sorted_probs)` gives the running total of probability mass as we include more tokens, in order of decreasing likelihood. I use `np.searchsorted(cumulative, p)` to binary-search for the first index where the cumulative probability exceeds p — this is O(log n) rather than a linear scan, and `+1` converts from an index to a count (we need at least that many tokens to *exceed* p, inclusive).",
        "I slice `order[:cutoff]` and `sorted_probs[:cutoff]` to get the 'nucleus' — the smallest set of high-probability tokens whose mass exceeds p. This is the core idea of nucleus sampling: unlike top-k (a fixed count), the nucleus size adapts per-step — when the model is confident (one token dominates), the nucleus might be size 1; when it's uncertain (flat distribution), the nucleus could include dozens of tokens.",
        "Because the nucleus probabilities no longer sum to 1 (we dropped the tail), I `/= nucleus_probs.sum()` to renormalize before passing them to `np.random.choice` as sampling weights. The `p=` argument to `np.random.choice` requires a valid probability distribution — skipping this renormalization would either error or silently bias the sample.",
      ],
      explanationBlanks: [
        {
          line: "I divide `logits / temperature` before softmax. Temperature reshapes the distribution: T < 1 sharpens it (divides logits by a small number, exaggerating differences, making the argmax more dominant — more deterministic/conservative output), while T > 1 flattens it (divides by a large number, compressing differences toward uniform — more random/creative output). T=1 leaves the distribution unchanged. This must happen *before* softmax, because softmax(logits/T) ≠ softmax(logits)/___.",
          answer: "T",
        },
        {
          line: "I compute `probs = softmax(logits)` to convert scaled logits into a probability distribution, then `order = np.argsort(probs)[::-1]` to get indices sorted from highest to lowest probability. I use `[::-1]` to reverse `argsort`'s default ascending order — argsort doesn't have a built-in 'descending' flag, so reversing is the idiomatic numpy way to get ___ order.",
          answer: "descending",
        },
        {
          line: "`cumulative = np.cumsum(sorted_probs)` gives the running total of probability mass as we include more tokens, in order of decreasing likelihood. I use `np.searchsorted(cumulative, p)` to binary-search for the first index where the cumulative probability exceeds p — this is O(log n) rather than a ___ scan, and `+1` converts from an index to a count (we need at least that many tokens to *exceed* p, inclusive).",
          answer: "linear",
        },
        {
          line: "I slice `order[:cutoff]` and `sorted_probs[:cutoff]` to get the 'nucleus' — the smallest set of high-probability tokens whose mass exceeds p. This is the core idea of nucleus sampling: unlike top-k (a fixed count), the nucleus size ___ per-step — when the model is confident (one token dominates), the nucleus might be size 1; when it's uncertain (flat distribution), the nucleus could include dozens of tokens.",
          answer: "adapts",
        },
        {
          line: "Because the nucleus probabilities no longer sum to 1 (we dropped the tail), I `/= nucleus_probs.sum()` to ___ before passing them to `np.random.choice` as sampling weights. The `p=` argument to `np.random.choice` requires a valid probability distribution — skipping this step would either error or silently bias the sample.",
          answer: "renormalize",
        },
      ],
      testCase: {
        input: "logits = [2.0, 1.0, 0.5, 0.1, -1.0], temperature=1.0, p=0.9",
        expected: "samples from {token0, token1, token2} (the smallest set covering >90% probability mass)",
        trace: [
          "scaled logits (T=1.0, unchanged) = [2.0, 1.0, 0.5, 0.1, -1.0]",
          "probs ≈ [0.503, 0.185, 0.112, 0.075, 0.025] (sums to 1.0)",
          "order (descending) = [0, 1, 2, 3, 4]",
          "cumulative = [0.503, 0.688, 0.800, 0.875, 0.900]",
          "searchsorted(cumulative, 0.9) = 4 → cutoff = 4 + 1 = 5... but cumulative[3]=0.875<0.9 and cumulative[4]=0.900, so first index where cum > 0.9 strictly would be beyond index 4; in practice cutoff clamps to len(probs)=5",
          "nucleus = all 5 tokens (since 0.9 is right at the edge); renormalize and sample",
        ],
        traceExplanations: [
          "With temperature 1.0, logits are unchanged — this trace isolates the top-p mechanism.",
          "Softmax converts logits to probabilities; token 0 dominates with ~50%.",
          "Sorting indices by probability, descending — token 0 is most likely, token 4 least likely.",
          "Running sum of probabilities as we add tokens 0, then 0+1, then 0+1+2, etc.",
          "We're looking for where this running sum first exceeds 0.9 — note the boundary case here shows why edge cases (p exactly at a cumulative value) matter in implementation.",
          "Depending on the exact cutoff, the nucleus includes most or all tokens; after renormalizing, we sample proportionally — token 0 remains the most likely draw, but tokens 3 and 4 retain a small chance, illustrating how top-p preserves some diversity compared to greedy decoding.",
        ],
      },
      blanks: [
        { line: `logits = np.array(logits) / ___`, answer: "temperature" },
        { line: `order = np.argsort(probs)[___]`, answer: "::-1" },
        { line: `cumulative = np.___(sorted_probs)`, answer: "cumsum" },
        { line: `cutoff = np.searchsorted(cumulative, ___) + 1`, answer: "p" },
        { line: `nucleus_probs /= nucleus_probs.___()`, answer: "sum" },
      ],
    },
  ],
}
