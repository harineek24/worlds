import { Pattern } from "../../types"

export const finetuning: Pattern = {
  id: "finetuning",
  order: 4,
  patternName: "Fine-tuning & Adaptation",

  philosophy: {
    text: "The mind, while practicing concentration, is trained to dwell on a single object... Repeated practice creates a deep groove, a samskara, which the mind naturally falls into.",
    source: "Patanjali, Yoga Sutras (commentary tradition)",
    connection:
      "A samskara is a mental groove carved by repetition — not erased and replaced, but laid down on top of what's already there, gradually shifting which patterns the mind falls into by default. Fine-tuning works the same way: a pretrained model already has the deep, broad structure of language and reasoning carved in from a vast and varied practice. We don't re-carve the whole mind from scratch; we add a small, targeted set of new grooves — a low-rank adapter, a handful of preference comparisons — that bias the existing structure toward a new habit. Push too hard with too large a chisel, and you risk cutting through the old grooves entirely, the mind forgetting what it once knew. The art is in the smallest sufficient nudge.",
  },

  template: {
    description:
      "LoRA (Low-Rank Adaptation) freezes the pretrained weight matrix W and learns a small additive update ΔW = B @ A, where A and B are low-rank matrices (rank r << d). Instead of updating all d×d parameters, you only train d×r + r×d parameters — often less than 1% of the original. At inference, the adapted weight is simply W + B @ A, optionally merged back into W with zero added latency.",
    snippet: `import numpy as np

# Frozen pretrained weight: d x d
d, r = 4, 1
W = np.random.randn(d, d)

# Trainable low-rank factors: B is d x r, A is r x d
B = np.zeros((d, r))          # init to zero -> delta starts at 0
A = np.random.randn(r, d) * 0.01

x = np.random.randn(d)

# Forward pass: frozen path + low-rank adapter path
h_frozen = W @ x
h_adapter = (B @ A) @ x
h = h_frozen + h_adapter

# Only A and B receive gradients; W never changes
delta_W = B @ A
print(delta_W.shape)  # (d, d), but rank <= r`,
  },

  pythonTools: [
    {
      name: "torch low-rank delta: B @ A as nn.Parameter pair",
      snippet: `import torch
import torch.nn as nn

d, r = 768, 8
B = nn.Parameter(torch.zeros(d, r))
A = nn.Parameter(torch.randn(r, d) * 0.01)

delta_W = B @ A          # (d, d), rank <= r
W_adapted = W + delta_W   # W is frozen (requires_grad=False)`,
    },
    {
      name: "DPO-style loss: log-ratio margin with sigmoid",
      snippet: `import torch
import torch.nn.functional as F

def dpo_loss(logp_chosen, logp_rejected, ref_logp_chosen, ref_logp_rejected, beta=0.1):
    chosen_reward = beta * (logp_chosen - ref_logp_chosen)
    rejected_reward = beta * (logp_rejected - ref_logp_rejected)
    return -F.logsigmoid(chosen_reward - rejected_reward).mean()`,
    },
    {
      name: "parameter counting helper: trainable vs total",
      snippet: `def count_params(model):
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total = sum(p.numel() for p in model.parameters())
    return trainable, total, trainable / total`,
    },
  ],

  problems: [
    {
      id: "lora-delta-weight",
      title: "Compute a LoRA Delta Weight",
      difficulty: "easy",
      prompt:
        "Given a frozen weight matrix W of shape (d, d) and two low-rank matrices A (r, d) and B (d, r), write a function that returns the effective adapted weight W' = W + B @ A. Confirm the shapes work out and explain why B is typically initialized to zero.",
      patternKeywords: ["LoRA", "low-rank", "delta weight", "initialization"],
      solution: `import numpy as np

def lora_adapted_weight(W, A, B):
    delta_W = B @ A
    return W + delta_W`,
      solutionExplanation: [
        "I define `lora_adapted_weight(W, A, B)` taking the frozen weight and the two trainable factors as separate arguments — keeping them separate (rather than pre-multiplying) mirrors how they're stored during training, where A and B get independent gradient updates.",
        "`delta_W = B @ A` computes the low-rank update: B is (d, r) and A is (r, d), so `B @ A` (matrix multiplication via `@`) produces a (d, d) matrix — same shape as W — but its rank is at most r, since it's a product of two rank-r-or-less matrices.",
        "`return W + delta_W` adds the update to the frozen weight elementwise. This is the only place W appears, and it's never modified in place — at inference you can either keep this addition as a separate forward pass or merge it once into a new W' for zero extra latency.",
        "B is initialized to zero (and A to small random values) so that `delta_W = B @ A` is exactly zero at the start of training — the adapted model is mathematically identical to the pretrained model on step zero, guaranteeing training starts from a known-good point rather than a random perturbation.",
      ],
      testCase: {
        input: "W = 2x2 identity, A = [[1, 1]], B = [[0],[0]] (r=1)",
        expected: "[[1,0],[0,1]]  (delta_W is all zeros, so W' == W)",
        trace: [
          "B @ A = [[0],[0]] @ [[1,1]] = [[0,0],[0,0]]",
          "W + delta_W = [[1,0],[0,1]] + [[0,0],[0,0]] = [[1,0],[0,1]]",
        ],
        traceExplanations: [
          "With B all zeros, the (d,r) x (r,d) product collapses to an all-zero (d,d) matrix regardless of A's values — this is the zero-init guarantee in action.",
          "Adding the zero delta leaves W completely unchanged, confirming the adapted model starts identical to the base model.",
        ],
      },
      blanks: [
        { line: `def lora_adapted_weight(W, ___, B):`, answer: "A" },
        { line: `delta_W = B ___ A`, answer: "@" },
        { line: `return ___ + delta_W`, answer: "W" },
      ],
      explanationBlanks: [
        {
          line: "I define `lora_adapted_weight(W, A, B)` taking the frozen weight and the two trainable factors as separate arguments — keeping them separate (rather than pre-multiplying) mirrors how they're stored during training, where A and B get independent ___ updates.",
          answer: "gradient",
        },
        {
          line: "`delta_W = B @ A` computes the low-rank update: B is (d, r) and A is (r, d), so `B @ A` (matrix multiplication via `@`) produces a (d, d) matrix — same shape as W — but its ___ is at most r, since it's a product of two rank-r-or-less matrices.",
          answer: "rank",
        },
        {
          line: "`return W + delta_W` adds the update to the frozen weight elementwise. This is the only place W appears, and it's never modified in place — at inference you can either keep this addition as a separate forward pass or ___ it once into a new W' for zero extra latency.",
          answer: "merge",
        },
        {
          line: "B is initialized to zero (and A to small random values) so that `delta_W = B @ A` is exactly zero at the start of training — the adapted model is mathematically identical to the pretrained model on step zero, guaranteeing training starts from a ___ point rather than a random perturbation.",
          answer: "known-good",
        },
      ],
    },

    {
      id: "param-count-full-vs-lora",
      title: "Compare Trainable Parameters: Full Fine-Tune vs LoRA",
      difficulty: "easy",
      prompt:
        "Write a function that, given a layer dimension d and a LoRA rank r, returns the number of trainable parameters for (a) full fine-tuning of a (d, d) weight matrix and (b) LoRA with rank r. Use it to explain why PEFT methods make fine-tuning large models tractable on limited hardware.",
      patternKeywords: ["PEFT", "trainable parameters", "full fine-tuning", "LoRA rank"],
      solution: `def compare_param_counts(d, r):
    full_params = d * d
    lora_params = d * r + r * d
    return full_params, lora_params, full_params / lora_params`,
      solutionExplanation: [
        "I define `compare_param_counts(d, r)` to take the weight matrix dimension `d` and the LoRA rank `r` — the two numbers that fully determine both parameter counts.",
        "`full_params = d * d` is the size of the original (d, d) weight matrix — every single weight is trainable in full fine-tuning, so this is just the matrix's element count.",
        "`lora_params = d * r + r * d` adds up the sizes of A (r, d) and B (d, r) — the only two matrices LoRA actually trains. I write it as two terms rather than `2 * d * r` to mirror the two separate matrices, even though they're algebraically equal.",
        "`return full_params, lora_params, full_params / lora_params` returns a tuple including the ratio — for typical values like d=4096, r=8, this ratio is in the thousands, which is the concrete number behind 'PEFT trains <1% of parameters.' Returning the ratio directly saves the caller from recomputing it.",
      ],
      testCase: {
        input: "d = 4096, r = 8",
        expected: "(16777216, 65536, 256.0)",
        trace: [
          "full_params = 4096 * 4096 = 16,777,216",
          "lora_params = 4096*8 + 8*4096 = 32768 + 32768 = 65,536",
          "ratio = 16,777,216 / 65,536 = 256.0",
        ],
        traceExplanations: [
          "Full fine-tuning of a single 4096x4096 attention/MLP weight matrix means ~16.8 million trainable parameters for that one matrix alone.",
          "LoRA with rank 8 needs only 65,536 parameters — A and B together — to represent an additive update to that same matrix.",
          "Full fine-tuning trains 256x more parameters per matrix than LoRA at this rank — across an entire model with dozens of such matrices, this is the difference between needing many GPUs with optimizer states and fitting on a single consumer GPU.",
        ],
      },
      blanks: [
        { line: `def compare_param_counts(d, ___):`, answer: "r" },
        { line: `full_params = d ___ d`, answer: "*" },
        { line: `lora_params = d * r + ___ * d`, answer: "r" },
        { line: `return full_params, lora_params, full_params / ___`, answer: "lora_params" },
      ],
      explanationBlanks: [
        {
          line: "I define `compare_param_counts(d, r)` to take the weight matrix dimension `d` and the LoRA rank `r` — the two numbers that fully determine both ___ counts.",
          answer: "parameter",
        },
        {
          line: "`full_params = d * d` is the size of the original (d, d) weight matrix — every single weight is trainable in full fine-tuning, so this is just the matrix's ___ count.",
          answer: "element",
        },
        {
          line: "`lora_params = d * r + r * d` adds up the sizes of A (r, d) and B (d, r) — the only two matrices LoRA actually trains. I write it as two terms rather than `2 * d * r` to mirror the two separate matrices, even though they're algebraically ___.",
          answer: "equal",
        },
        {
          line: "`return full_params, lora_params, full_params / lora_params` returns a tuple including the ratio — for typical values like d=4096, r=8, this ratio is in the thousands, which is the concrete number behind 'PEFT trains <1% of parameters.' Returning the ratio directly saves the caller from ___ it.",
          answer: "recomputing",
        },
      ],
    },

    {
      id: "dpo-loss",
      title: "Implement a DPO Loss Function",
      difficulty: "medium",
      prompt:
        "Direct Preference Optimization (DPO) trains a model directly on (chosen, rejected) preference pairs without a separate reward model. Given log-probabilities of a chosen and rejected response under the policy model and a frozen reference model, implement the DPO loss. Explain the role of the reference model and the beta hyperparameter.",
      patternKeywords: ["RLHF", "DPO", "preference pairs", "reference model"],
      solution: `import torch
import torch.nn.functional as F

def dpo_loss(policy_chosen, policy_rejected, ref_chosen, ref_rejected, beta=0.1):
    policy_logratio = policy_chosen - policy_rejected
    ref_logratio = ref_chosen - ref_rejected
    logits = beta * (policy_logratio - ref_logratio)
    loss = -F.logsigmoid(logits)
    return loss.mean()`,
      solutionExplanation: [
        "I take four log-probability tensors — `policy_chosen`, `policy_rejected`, `ref_chosen`, `ref_rejected` — as separate arguments rather than packing them into a dict, since DPO's math is naturally expressed as differences between exactly these four quantities.",
        "`policy_logratio = policy_chosen - policy_rejected` computes log(p_chosen) - log(p_rejected) under the model being trained — this is the policy's current preference strength for chosen over rejected, in log space, where subtraction of logs corresponds to a ratio.",
        "`ref_logratio = ref_chosen - ref_rejected` computes the same quantity under the frozen reference model (typically the SFT checkpoint before preference tuning) — this acts as an anchor, preventing the policy from drifting arbitrarily far just to satisfy preferences, which is DPO's implicit way of doing what a KL penalty does in RL-based RLHF.",
        "`logits = beta * (policy_logratio - ref_logratio)` is the core DPO quantity: how much more (or less) the policy now prefers chosen-over-rejected compared to the reference. `beta` scales this difference — a higher beta makes the loss more sensitive to deviations from the reference, effectively a stronger KL constraint.",
        "`loss = -F.logsigmoid(logits)` — I use `F.logsigmoid` instead of `torch.log(torch.sigmoid(...))` because the former is numerically stable for large negative inputs (avoids log(0)). The negative sign turns this into something to minimize: when `logits` is large and positive (policy strongly prefers chosen relative to reference), `logsigmoid(logits)` approaches 0, so the loss approaches 0 — exactly what we want.",
        "`return loss.mean()` averages the per-example loss across the batch — `.mean()` rather than `.sum()` keeps the loss magnitude independent of batch size, which keeps the learning rate's effective scale consistent regardless of how many preference pairs are in a batch.",
      ],
      testCase: {
        input:
          "policy_chosen=-1.0, policy_rejected=-2.0, ref_chosen=-1.5, ref_rejected=-1.5, beta=0.1 (single example)",
        expected: "loss ≈ 0.6444",
        trace: [
          "policy_logratio = -1.0 - (-2.0) = 1.0",
          "ref_logratio = -1.5 - (-1.5) = 0.0",
          "logits = 0.1 * (1.0 - 0.0) = 0.1",
          "loss = -logsigmoid(0.1) = -log(1/(1+e^-0.1)) ≈ -log(0.5250) ≈ 0.6444",
        ],
        traceExplanations: [
          "The policy already prefers 'chosen' over 'rejected' by 1.0 nat in log-prob space — a positive policy log-ratio means the model assigns higher probability to the chosen response.",
          "The reference model is indifferent between the two (equal log-probs), so its log-ratio is 0 — there's no built-in preference to anchor against here.",
          "Scaling by beta=0.1 gives a small positive logit — the policy has moved slightly in the preferred direction relative to the reference, but only modestly (0.1 is small).",
          "Because the logit is only mildly positive, sigmoid(0.1)≈0.525 is just above 0.5, so the loss (≈0.644) is still meaningfully greater than 0 — there's a gradient pushing the policy to widen this preference gap further.",
        ],
      },
      blanks: [
        { line: `policy_logratio = policy_chosen - ___`, answer: "policy_rejected" },
        { line: `ref_logratio = ref_chosen - ref_rejected`, answer: "ref_rejected" },
        { line: `logits = ___ * (policy_logratio - ref_logratio)`, answer: "beta" },
        { line: `loss = -F.___(logits)`, answer: "logsigmoid" },
        { line: `return loss.___()`, answer: "mean" },
      ],
      explanationBlanks: [
        {
          line: "I take four log-probability tensors — `policy_chosen`, `policy_rejected`, `ref_chosen`, `ref_rejected` — as separate arguments rather than packing them into a dict, since DPO's math is naturally expressed as differences between exactly these four ___.",
          answer: "quantities",
        },
        {
          line: "`policy_logratio = policy_chosen - policy_rejected` computes log(p_chosen) - log(p_rejected) under the model being trained — this is the policy's current preference strength for chosen over rejected, in log space, where subtraction of logs corresponds to a ___.",
          answer: "ratio",
        },
        {
          line: "`ref_logratio = ref_chosen - ref_rejected` computes the same quantity under the frozen reference model (typically the SFT checkpoint before preference tuning) — this acts as an anchor, preventing the policy from drifting arbitrarily far just to satisfy preferences, which is DPO's implicit way of doing what a ___ does in RL-based RLHF.",
          answer: "KL penalty",
        },
        {
          line: "`logits = beta * (policy_logratio - ref_logratio)` is the core DPO quantity: how much more (or less) the policy now prefers chosen-over-rejected compared to the reference. `beta` scales this difference — a higher beta makes the loss more sensitive to deviations from the reference, effectively a stronger ___ constraint.",
          answer: "KL",
        },
        {
          line: "`loss = -F.logsigmoid(logits)` — I use `F.logsigmoid` instead of `torch.log(torch.sigmoid(...))` because the former is numerically stable for large negative inputs (avoids log(0)). The negative sign turns this into something to minimize: when `logits` is large and positive (policy strongly prefers chosen relative to reference), `logsigmoid(logits)` approaches 0, so the loss approaches ___ — exactly what we want.",
          answer: "0",
        },
        {
          line: "`return loss.mean()` averages the per-example loss across the batch — `.mean()` rather than `.sum()` keeps the loss magnitude independent of batch size, which keeps the learning rate's effective scale consistent regardless of how many preference pairs are in a ___.",
          answer: "batch",
        },
      ],
    },

    {
      id: "int8-quantization-scale",
      title: "Compute Int8 Quantization Scale and Zero-Point",
      difficulty: "medium",
      prompt:
        "Implement affine (asymmetric) int8 quantization: given a float tensor's min and max values, compute the scale and zero-point that map floats to the int8 range [-128, 127], and write functions to quantize and dequantize a value. Explain why this matters for serving fine-tuned models cheaply.",
      patternKeywords: ["quantization", "int8", "scale", "zero-point"],
      solution: `def compute_qparams(fmin, fmax, qmin=-128, qmax=127):
    scale = (fmax - fmin) / (qmax - qmin)
    zero_point = round(qmin - fmin / scale)
    return scale, zero_point

def quantize(x, scale, zero_point, qmin=-128, qmax=127):
    q = round(x / scale + zero_point)
    return max(qmin, min(qmax, q))

def dequantize(q, scale, zero_point):
    return (q - zero_point) * scale`,
      solutionExplanation: [
        "I define `compute_qparams(fmin, fmax, qmin=-128, qmax=127)` with the int8 range as defaults — making them explicit parameters (rather than hardcoding -128/127 inline) means the same function works for uint8 (0-255) by just changing the defaults at the call site.",
        "`scale = (fmax - fmin) / (qmax - qmin)` is the size of one quantization 'bucket' in float units — it's the ratio of the float range to the integer range, so multiplying an integer delta by scale gives back a float delta.",
        "`zero_point = round(qmin - fmin / scale)` finds which integer corresponds to float zero — I use `round()` because zero_point must be an integer (it's a position in the int8 grid), but `fmin / scale` is generally fractional. This is the 'asymmetric' part: zero doesn't have to map to integer 0.",
        "In `quantize`, `q = round(x / scale + zero_point)` converts a float back to the integer grid: divide by the bucket size to get a grid position, then shift by zero_point to align grids. `round()` here introduces the actual quantization error — the 'lossy' step.",
        "`return max(qmin, min(qmax, q))` clamps the result into [-128, 127] — without this, an out-of-distribution float value could produce an integer outside int8's representable range, which would overflow or wrap incorrectly when stored.",
        "`dequantize(q, scale, zero_point)` reverses the mapping: `(q - zero_point) * scale` undoes the shift-then-divide of `quantize`. The result approximates the original float but isn't exact — the gap between original and dequantized value is the quantization error, which is why int4/int8 fine-tuning techniques (like QLoRA) keep a small set of parameters in higher precision.",
      ],
      testCase: {
        input: "fmin = -1.0, fmax = 3.0, x = 0.5",
        expected: "scale=0.01568627..., zero_point=-65, q=-33, dequant≈0.5019...",
        trace: [
          "scale = (3.0 - (-1.0)) / (127 - (-128)) = 4.0 / 255 ≈ 0.015686",
          "zero_point = round(-128 - (-1.0)/0.015686) = round(-128 + 63.75) = round(-64.25) = -64",
          "quantize(0.5): q = round(0.5/0.015686 + (-64)) = round(31.875 - 64) = round(-32.125) = -32",
          "clamp(-32) is within [-128,127], so q = -32",
          "dequantize(-32) = (-32 - (-64)) * 0.015686 = 32 * 0.015686 ≈ 0.502",
        ],
        traceExplanations: [
          "The float range [-1, 3] spans 4.0 units, mapped onto 256 integer buckets (-128 to 127), giving each bucket a width of about 0.0157.",
          "zero_point tells us which integer represents float 0.0 — here, integer -64 corresponds to approximately float 0, since -1.0 (fmin) maps near -128 and the offset works out to -64 for zero.",
          "To quantize 0.5, we find how many bucket-widths it is from fmin in grid units (31.875), then shift by zero_point (-64) to land on the correct integer, rounding to the nearest grid point: -32.",
          "-32 is comfortably inside [-128, 127], so no clamping is needed — this only matters for outlier values beyond the original [fmin, fmax] range.",
          "Dequantizing -32 gives back approximately 0.502, not exactly 0.5 — the small discrepancy (0.002) is the quantization error introduced by rounding to the nearest integer grid point.",
        ],
      },
      blanks: [
        { line: `scale = (fmax - fmin) / (qmax - ___)`, answer: "qmin" },
        { line: `zero_point = round(qmin - fmin / ___)`, answer: "scale" },
        { line: `q = round(x / scale + ___)`, answer: "zero_point" },
        { line: `return max(qmin, min(___, q))`, answer: "qmax" },
        { line: `return (q - zero_point) * ___`, answer: "scale" },
      ],
      explanationBlanks: [
        {
          line: "I define `compute_qparams(fmin, fmax, qmin=-128, qmax=127)` with the int8 range as defaults — making them explicit parameters (rather than hardcoding -128/127 inline) means the same function works for ___ (0-255) by just changing the defaults at the call site.",
          answer: "uint8",
        },
        {
          line: "`scale = (fmax - fmin) / (qmax - qmin)` is the size of one quantization ___ in float units — it's the ratio of the float range to the integer range, so multiplying an integer delta by scale gives back a float delta.",
          answer: "bucket",
        },
        {
          line: "`zero_point = round(qmin - fmin / scale)` finds which integer corresponds to float zero — I use `round()` because zero_point must be an integer (it's a position in the int8 grid), but `fmin / scale` is generally fractional. This is the '___' part: zero doesn't have to map to integer 0.",
          answer: "asymmetric",
        },
        {
          line: "In `quantize`, `q = round(x / scale + zero_point)` converts a float back to the integer grid: divide by the bucket size to get a grid position, then shift by zero_point to align grids. `round()` here introduces the actual quantization error — the ___ step.",
          answer: "lossy",
        },
        {
          line: "`return max(qmin, min(qmax, q))` clamps the result into [-128, 127] — without this, an out-of-distribution float value could produce an integer outside int8's representable range, which would ___ or wrap incorrectly when stored.",
          answer: "overflow",
        },
        {
          line: "`dequantize(q, scale, zero_point)` reverses the mapping: `(q - zero_point) * scale` undoes the shift-then-divide of `quantize`. The result approximates the original float but isn't exact — the gap between original and dequantized value is the quantization error, which is why int4/int8 fine-tuning techniques (like ___) keep a small set of parameters in higher precision.",
          answer: "QLoRA",
        },
      ],
    },

    {
      id: "ewc-catastrophic-forgetting",
      title: "Implement an EWC Penalty Against Catastrophic Forgetting",
      difficulty: "hard",
      prompt:
        "When fine-tuning on a new task or domain, a model can suffer catastrophic forgetting — overwriting weights important for previously learned tasks. Elastic Weight Consolidation (EWC) adds a penalty that discourages large changes to parameters that were important for the original task, weighted by their Fisher information. Implement the EWC penalty term given current parameters, the original (pretrained) parameters, and a per-parameter importance (Fisher) estimate.",
      patternKeywords: ["catastrophic forgetting", "EWC", "Fisher information", "regularization"],
      solution: `import torch

def ewc_penalty(current_params, original_params, fisher, lam=1000.0):
    penalty = 0.0
    for p_curr, p_orig, f in zip(current_params, original_params, fisher):
        penalty += (f * (p_curr - p_orig) ** 2).sum()
    return lam * penalty`,
      solutionExplanation: [
        "I take three parallel iterables — `current_params`, `original_params`, `fisher` — one entry per parameter tensor in the model, plus a scalar `lam` controlling the overall strength of the penalty relative to the task loss.",
        "`penalty = 0.0` initializes an accumulator as a Python float — it'll be promoted to a tensor on the first `+=` once it's added to a tensor result, so I don't need to know the device or dtype upfront.",
        "`for p_curr, p_orig, f in zip(...)` iterates over the three lists in lockstep using `zip` — this is the natural way to pair up 'current value', 'original value', and 'importance' for the same parameter tensor without indexing by position.",
        "`(f * (p_curr - p_orig) ** 2).sum()` is the core EWC term per parameter: `(p_curr - p_orig) ** 2` measures how far each weight has drifted from its pretrained value, and multiplying by `f` (the Fisher information, an estimate of how much that weight matters for the original task) weights the drift penalty — high-Fisher weights get penalized heavily for moving, low-Fisher weights are nearly free to change. `.sum()` collapses the per-element penalty tensor into a scalar.",
        "`return lam * penalty` scales the total penalty by `lam`, a hyperparameter that's added to the fine-tuning loss (`total_loss = task_loss + lam * ewc_penalty(...)`). A larger `lam` means more protection against forgetting at the cost of less adaptation to the new task — it's the same bias-variance knob as beta in DPO or rank in LoRA.",
      ],
      testCase: {
        input:
          "current_params=[tensor([1.0, 2.0])], original_params=[tensor([0.0, 2.0])], fisher=[tensor([4.0, 1.0])], lam=10",
        expected: "40.0",
        trace: [
          "diff = current - original = [1.0-0.0, 2.0-2.0] = [1.0, 0.0]",
          "diff_squared = [1.0, 0.0]",
          "fisher * diff_squared = [4.0*1.0, 1.0*0.0] = [4.0, 0.0]",
          "sum = 4.0 + 0.0 = 4.0",
          "penalty = 4.0",
          "return lam * penalty = 10 * 4.0 = 40.0",
        ],
        traceExplanations: [
          "The first weight moved from 0.0 to 1.0 (drift of 1.0); the second weight didn't move at all (drift of 0.0).",
          "Squaring the drift gives a non-negative penalty contribution per weight, with larger drifts penalized super-linearly.",
          "The first weight has Fisher information 4.0 — it was important for the original task — so its drift of 1.0 contributes 4.0 to the penalty. The second weight has Fisher 1.0 but didn't move, contributing 0.",
          "Summing across this tensor's elements gives 4.0 — most of the penalty comes from the important weight that moved.",
          "With only one parameter tensor in this example, the total penalty before scaling is just this 4.0.",
          "Scaling by lam=10 gives the final regularization term, 40.0, which gets added directly to the task's training loss.",
        ],
      },
      blanks: [
        { line: `def ewc_penalty(current_params, original_params, fisher, ___=1000.0):`, answer: "lam" },
        { line: `for p_curr, p_orig, f in ___(current_params, original_params, fisher):`, answer: "zip" },
        { line: `penalty += (f * (p_curr - p_orig) ** ___).sum()`, answer: "2" },
        { line: `return ___ * penalty`, answer: "lam" },
      ],
      explanationBlanks: [
        {
          line: "I take three parallel iterables — `current_params`, `original_params`, `fisher` — one entry per parameter tensor in the model, plus a scalar `lam` controlling the overall strength of the penalty relative to the ___.",
          answer: "task loss",
        },
        {
          line: "`penalty = 0.0` initializes an accumulator as a Python float — it'll be promoted to a tensor on the first `+=` once it's added to a tensor result, so I don't need to know the device or ___ upfront.",
          answer: "dtype",
        },
        {
          line: "`for p_curr, p_orig, f in zip(...)` iterates over the three lists in lockstep using `zip` — this is the natural way to pair up 'current value', 'original value', and 'importance' for the same parameter tensor without indexing by ___.",
          answer: "position",
        },
        {
          line: "`(f * (p_curr - p_orig) ** 2).sum()` is the core EWC term per parameter: `(p_curr - p_orig) ** 2` measures how far each weight has drifted from its pretrained value, and multiplying by `f` (the Fisher information, an estimate of how much that weight matters for the original task) weights the drift penalty — high-Fisher weights get penalized heavily for moving, low-Fisher weights are nearly free to change. `.sum()` collapses the per-element penalty tensor into a ___.",
          answer: "scalar",
        },
        {
          line: "`return lam * penalty` scales the total penalty by `lam`, a hyperparameter that's added to the fine-tuning loss (`total_loss = task_loss + lam * ewc_penalty(...)`). A larger `lam` means more protection against forgetting at the cost of less adaptation to the new task — it's the same bias-variance knob as ___ in DPO or rank in LoRA.",
          answer: "beta",
        },
      ],
    },
  ],
}
