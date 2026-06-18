import { Project } from "../types"

export const hirefinch: Project = {
  id: "hirefinch",
  order: 3,
  name: "Hirefinch",
  tagline: "Real-time AI voice screening platform that cut unqualified candidate pass-through by 80%",
  techStack: [
    "WebSockets",
    "Google Gemini",
    "PostgreSQL",
    "pgvector",
    "FastAPI",
    "Python asyncio",
    "Redis",
    "Next.js",
  ],
  highLevelSummary: [
    {
      line: "Hirefinch is a real-time AI voice screening platform that interviews candidates over a live audio call and decides on the spot whether they actually match the role.",
      answer: "real-time",
    },
    {
      line: "It streams the candidate's voice to Gemini over WebSockets, pulls in job-specific context with RAG retrieval, and scores answers as they happen instead of after a recording is uploaded.",
      answer: "WebSockets",
    },
    {
      line: "That live scoring cut unqualified candidates getting passed through to human recruiters by 80 percent.",
      answer: "80",
    },
    {
      line: "Across the recruiting team that translated into roughly 50 hours saved that used to go into screening calls that were never going to lead anywhere.",
      answer: "50",
    },
  ],
  workflowSummary: [
    {
      line: "When a candidate joins a screening session, their browser opens a persistent WebSocket connection that streams audio chunks to the backend instead of waiting for a full recording to finish.",
      answer: "WebSocket",
    },
    {
      line: "Each audio chunk is pushed onto an asyncio queue so the connection's read loop never blocks on slower downstream work like transcription or scoring.",
      answer: "asyncio queue",
    },
    {
      line: "A separate consumer task pulls chunks off that queue and forwards them to Gemini's streaming API, which returns incremental transcripts as the candidate is still talking.",
      answer: "Gemini",
    },
    {
      line: "Before the interview even starts, the job description and scoring rubric are split into chunks and embedded into vectors stored in Postgres using the pgvector extension.",
      answer: "pgvector",
    },
    {
      line: "As each candidate answer comes in, we embed it and run a similarity search against those rubric vectors to retrieve the specific requirements that answer should be judged against.",
      answer: "similarity search",
    },
    {
      line: "That retrieved context gets injected into the prompt we send Gemini, so the model is scoring against the actual job requirements instead of guessing from general knowledge.",
      answer: "prompt",
    },
    {
      line: "Each answer gets a structured qualification score back from Gemini, and those scores accumulate in Redis for the duration of the call so we can track the conversation's running state without hitting Postgres on every turn.",
      answer: "Redis",
    },
    {
      line: "If a candidate's running score drops below the qualification threshold partway through, the system can end the screen early instead of running the full call to completion.",
      answer: "threshold",
    },
    {
      line: "At the end of the session the final score and transcript are persisted to Postgres, and only candidates above the bar get surfaced to recruiters for a real interview.",
      answer: "Postgres",
    },
    {
      line: "Filtering at that stage is what drove the 80 percent drop in unqualified candidates reaching a human, since most of the filtering work now happens automatically during the call itself.",
      answer: "80 percent",
    },
  ],
  technicalQuestions: [
    {
      question: "Why pgvector instead of a dedicated vector database like Pinecone or Weaviate?",
      answer:
        "The rubric and job-requirement embeddings were a small, well-structured dataset that already lived in Postgres alongside candidates, jobs, and call transcripts. Adding pgvector meant one less service to operate and one less data store to keep in sync — the similarity search is just another query joined against relational data we already had. A dedicated vector DB would only have paid off at a scale or recall requirement we weren't near, so it would have been added operational complexity without a real benefit.",
    },
    {
      question: "How do you keep the voice pipeline asynchronous so it doesn't block under load?",
      answer:
        "The WebSocket read loop only does one job: pull bytes off the socket and push them onto an asyncio queue. Everything expensive — transcription, embedding, retrieval, scoring — happens in separate consumer tasks reading off that queue. That separation means a slow Gemini response or a slow Postgres query never stalls the socket itself, so audio keeps flowing in even if downstream processing is momentarily behind.",
    },
    {
      question: "How is the 80 percent reduction number actually measured?",
      answer:
        "We compared the rate at which candidates were forwarded to a human recruiter before and after launch, using the same job postings and similar candidate volume as the baseline. Before automated screening, almost every applicant who scheduled a call got passed through for a recruiter review. After Hirefinch's scoring threshold was in place, only the candidates who cleared the rubric-based bar got surfaced, and that pass-through rate dropped by roughly 80 percent.",
    },
    {
      question: "What happens if Gemini's response is slow — how do you avoid dead air on a live call?",
      answer:
        "We stream Gemini's response token by token rather than waiting for a complete answer, so the candidate hears the start of a follow-up question as soon as it's available instead of waiting on the full generation. If latency still spikes, we have short filler responses queued to bridge the gap, and we set aggressive timeouts so a stalled request gets retried or skipped rather than leaving silence on the call.",
    },
    {
      question: "How do you handle candidate audio privacy and data retention?",
      answer:
        "Audio is only buffered transiently in memory for transcription and isn't written to disk; what gets persisted is the transcript and the structured score, not the raw recording. Transcripts are scoped per job posting and access-controlled to the recruiters on that req, and candidates are told up front that the call is AI-screened and what gets stored, which matters for both trust and compliance.",
    },
    {
      question: "Why retrieve context per answer instead of just putting the whole job description in the prompt once?",
      answer:
        "Job descriptions and rubrics can be long, and stuffing the entire document into every prompt wastes context and dilutes the model's attention on the specific requirement that answer is actually relevant to. Retrieving just the rubric chunks that are semantically closest to the candidate's answer keeps the prompt focused, keeps latency down, and makes the scoring more consistent because Gemini is judging against the right criterion instead of the whole document at once.",
    },
    {
      question: "How do you decide on the qualification threshold, and what happens at the boundary?",
      answer:
        "The threshold was tuned against a set of historical screening calls with known recruiter outcomes, picking a cutoff that minimized false negatives — we'd rather let a borderline candidate through than wrongly cut someone qualified. Scores near the boundary get flagged for a quick human spot-check rather than an automatic reject, so the system errs toward catching edge cases instead of silently filtering them out.",
    },
    {
      question: "Why end the call early for low-scoring candidates instead of always running the full screen?",
      answer:
        "Once the running score is clearly below threshold partway through, finishing the remaining questions rarely changes the outcome and just costs more Gemini calls and more of the candidate's time. Ending early lets us wrap the call respectfully, give the candidate a clear next step, and free up the pipeline for the next session sooner, which is part of where the time savings came from.",
    },
  ],
}
