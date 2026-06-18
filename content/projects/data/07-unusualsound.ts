import { Project } from "../types"

export const unusualSound: Project = {
  id: "unusualsound",
  order: 7,
  name: "Unusual Sound",
  tagline:
    "An edge-optimized anomaly detection system that listens to industrial machine audio and flags abnormal sounds in real time.",
  repoUrl: "https://github.com/harineek24/unusualsound",
  techStack: [
    "Python",
    "PyTorch",
    "torchaudio",
    "librosa",
    "scikit-learn",
    "ONNX / ONNX Runtime",
    "TensorFlow / TFLite (int8 quantization)",
    "Streamlit",
    "NumPy / SciPy",
    "MIMII dataset (DCASE)",
  ],
  highLevelSummary: [
    {
      line: "This project is an end-to-end anomaly detection system that listens to industrial machine audio and predicts equipment failure before it happens, which is why I called it ___.",
      answer: "Unusual Sound",
    },
    {
      line: "It's trained on the ___ dataset, which contains real recordings of fans, pumps, sliders, and valves operating normally and abnormally.",
      answer: "MIMII",
    },
    {
      line: "The core model is a ___ that learns to reconstruct normal machine sounds, and anything it reconstructs poorly gets flagged as an anomaly.",
      answer: "Conv1D autoencoder",
    },
    {
      line: "Because factories can't always rely on cloud connectivity, the whole pipeline is designed to run on a resource-constrained microcontroller, specifically targeting an ARM ___.",
      answer: "Cortex-M4",
    },
  ],
  workflowSummary: [
    {
      line: "It starts with raw 16kHz mono audio clips of about 10 seconds each, which get converted into a spectrogram using a ___ pipeline.",
      answer: "DSP",
    },
    {
      line: "I run a short-time Fourier transform with an FFT size of 1024 and a hop length of 512, giving roughly 50 percent overlap between frames, then pass that through a ___ filterbank with 128 bands to get a perceptually scaled representation.",
      answer: "Mel",
    },
    {
      line: "That produces a log-scaled, normalized spectrogram of shape 128 by 313, which becomes the actual input tensor to the model.",
      answer: "128 by 313",
    },
    {
      line: "The model itself is an autoencoder trained only on normal operating sounds, so it never sees labeled anomalies during training, which makes it effectively a ___ approach.",
      answer: "one-class",
    },
    {
      line: "Architecturally it's a Conv1D encoder-decoder that treats the mel bands as channels and convolves over the time axis, compressing everything down to a latent space of dimension ___.",
      answer: "32",
    },
    {
      line: "At inference time I compute the mean squared reconstruction error between the input spectrogram and the model's output, and flag a clip as anomalous if that error exceeds a threshold set at the 95th ___ of training reconstruction errors.",
      answer: "percentile",
    },
    {
      line: "Once a model is trained in PyTorch, I export it to ___ format so it can run cross-platform through ONNX Runtime and be validated against the original PyTorch outputs.",
      answer: "ONNX",
    },
    {
      line: "From there I convert it further into TFLite with post-training int8 quantization, which shrinks the model roughly fourfold so it fits inside the device's flash budget of ___.",
      answer: "256 KB",
    },
    {
      line: "Finally, there's a Streamlit app where you can upload audio or pick a synthetic sample, watch the spectrogram render live, and toggle between the PyTorch and ___ inference backends to compare results.",
      answer: "ONNX",
    },
  ],
  technicalQuestions: [
    {
      question: "Why did you choose an autoencoder instead of a standard binary classifier for anomaly detection?",
      answer:
        "In real industrial settings, failure data is scarce — you might get thousands of normal recordings but only a handful of true failures. An autoencoder only needs to learn what 'normal' sounds like, so it trains entirely on normal samples and flags anything it can't reconstruct well. That one-class setup is far more realistic for deployment than trying to collect a balanced labeled dataset of rare failure modes.",
    },
    {
      question: "Why Conv1D over Conv2D, given the input is a spectrogram, which is naturally 2D?",
      answer:
        "The mel spectrogram has a frequency axis (128 mel bands) and a time axis (313 frames). Instead of treating it as an image and convolving over both axes with Conv2D, I treat the mel bands as channels and only convolve over the time axis with Conv1D. That's sufficient for capturing how the spectral pattern evolves over time, and it keeps the parameter count much smaller — important since the whole point is fitting on a Cortex-M4.",
    },
    {
      question: "How do you decide the threshold for what counts as an anomaly?",
      answer:
        "After training, I run the model over the normal training set and collect the distribution of reconstruction errors. The threshold is set at the 95th percentile of that distribution, so the model tolerates the natural variance in normal samples but flags clips whose error is meaningfully higher — which in practice corresponds to abnormal machine behavior it never saw during training.",
    },
    {
      question: "Walk me through the model conversion pipeline — why go through both ONNX and TFLite?",
      answer:
        "The model is trained in PyTorch, then exported to ONNX first because that's a well-supported, framework-agnostic intermediate format — I validate the ONNX outputs against the original PyTorch outputs to make sure nothing broke in conversion. From ONNX I go to TFLite via an ONNX-to-TensorFlow SavedModel step, then apply post-training int8 quantization using a representative calibration dataset. ONNX alone covers server/desktop deployment through ONNX Runtime, but TFLite with TFLite Micro is what actually lets the model run on a microcontroller.",
    },
    {
      question: "What's the tradeoff with int8 quantization, and was it worth it here?",
      answer:
        "Int8 quantization roughly cuts the model size by 4x compared to float32, which matters a lot when your flash budget is only 256KB. The cost is a small accuracy hit, on the order of 1-2% in my testing, which is an easy tradeoff for an anomaly detector that doesn't need to be perfectly precise — it just needs to reliably separate normal from clearly abnormal sounds.",
    },
    {
      question: "Why is on-device inference preferable to streaming audio to the cloud here?",
      answer:
        "If you've got thousands of sensors across a factory floor, continuously streaming 16kHz audio to the cloud is expensive in bandwidth and introduces latency and a hard dependency on connectivity. Running inference directly on a microcontroller next to the sensor gives sub-second detection, works even if the network drops, and scales without per-sensor cloud costs — which is the whole motivation behind the edge-deployment design.",
    },
    {
      question: "How would you take this from a demo to something running on real hardware?",
      answer:
        "Right now the edge profiling is simulated in software — I estimate latency and memory budgets for a Cortex-M4 rather than running on physical silicon. The real next step would be deploying the quantized TFLite model with TFLite Micro on an actual Cortex-M4 dev board, wiring up a real-time I2S microphone capture loop instead of pre-recorded clips, and validating against live sensor data instead of the MIMII dataset. After that I'd look at pruning or knowledge distillation to shrink the model further, and eventually some form of continuous learning so the model adapts as equipment ages.",
    },
  ],
}
