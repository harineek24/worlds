import { Project } from "../types"

export const medEase: Project = {
  id: "medease",
  order: 1,
  name: "MedEase",
  tagline: "A multi-portal AI healthcare platform with document summarization, drug interaction checking, and real-time voice consultations.",
  repoUrl: "https://github.com/harineek24/medEase",
  techStack: [
    "React 18",
    "TypeScript",
    "Vite",
    "Tailwind CSS",
    "React Router",
    "Three.js / React Three Fiber",
    "Framer Motion",
    "Web Audio API",
    "FastAPI",
    "Python",
    "Google Gemini API (gemini-2.5-flash)",
    "Gemini Live API (native audio)",
    "WebSockets",
    "RxNorm (NLM) API",
    "PostgreSQL (Neon)",
    "psycopg2",
    "Render",
    "Vercel",
  ],
  highLevelSummary: [
    {
      line: "I built MedEase, a multi-portal healthcare platform that serves three different roles: patients, doctors, and ___.",
      answer: "clinic administrators",
    },
    {
      line: "The core idea is to take messy, jargon-heavy medical paperwork and turn it into something a patient can actually understand, using ___ to read and summarize uploaded documents.",
      answer: "Google Gemini",
    },
    {
      line: "On top of that, it can run a live, spoken medical intake interview where the AI doctor asks questions out loud and the conversation happens over a real-time ___ connection.",
      answer: "WebSocket",
    },
    {
      line: "It also cross-checks every patient's medication list against the ___ drug database to flag dangerous interactions before they become a problem.",
      answer: "RxNorm",
    },
  ],
  workflowSummary: [
    {
      line: "The frontend is a ___ and TypeScript single-page app built with Vite and styled with Tailwind, and it talks to the backend over plain HTTP for most calls and a native WebSocket for the voice feature.",
      answer: "React 18",
    },
    {
      line: "The backend is a ___ application written in Python that exposes REST endpoints for document summarization, chat, medication analysis, appointments, billing, and a dedicated WebSocket route for voice.",
      answer: "FastAPI",
    },
    {
      line: "When a patient uploads a PDF or image of a medical document, the file is base64-encoded and sent straight to ___, which returns a structured, plain-English summary with sections like medications, test results, and warning signs.",
      answer: "Gemini",
    },
    {
      line: "From that summary, separate Gemini prompts extract medications and lab results into clean JSON so the frontend can render them as structured cards instead of raw markdown.",
      answer: "JSON",
    },
    {
      line: "For the live consultation, the patient clicks into Dr. MedAssist and the browser opens a WebSocket to a ___ route on the backend, which proxies bidirectional audio to and from the Gemini Live API.",
      answer: "/ws/voice/{session_id}",
    },
    {
      line: "Audio is captured with the Web Audio API at 16kHz on the way in and played back at 24kHz on the way out, streamed as raw binary frames rather than files so the conversation feels instant.",
      answer: "16kHz",
    },
    {
      line: "The model is steered by a system prompt that forces it to call a save_field function the moment the patient answers each intake question, so structured fields like chief complaint and symptom severity get written to the database in real time during the call.",
      answer: "save_field",
    },
    {
      line: "If the conversation contains red-flag symptoms like chest pain or trouble breathing, the backend triggers an emergency callback that pushes an alert to the client telling the patient to call 911.",
      answer: "911",
    },
    {
      line: "Whenever medications come up, either from an upload or a chat message, they get analyzed against the ___ API from the National Library of Medicine to detect interactions, duplicate therapies, and dosage issues.",
      answer: "RxNorm",
    },
    {
      line: "All of this, patients, doctors, summaries, medications, consultation sessions, and clinic billing data, is persisted in a ___ database hosted on Neon, with the backend deployed on Render and the frontend on Vercel.",
      answer: "PostgreSQL",
    },
  ],
  technicalQuestions: [
    {
      question: "How does the real-time voice consultation actually work end to end?",
      answer:
        "The browser opens a WebSocket to the FastAPI backend at /ws/voice/{session_id}. The Web Audio API captures the patient's mic at 16kHz and streams it as binary frames over the socket. The backend forwards that audio into the Gemini Live API (native audio model), which streams back synthesized speech at 24kHz that the backend relays to the client as binary frames for playback. The Live model is also given function-calling tools, so as it conducts the interview it calls save_field for every answer, which the backend persists to Postgres and pushes to the client as a 'field_extracted' WebSocket event so the UI updates live.",
    },
    {
      question: "Why use a WebSocket instead of polling or simple request/response for the voice feature?",
      answer:
        "Voice consultation needs low-latency, bidirectional streaming in both directions at once, the patient can be talking while the AI is still speaking. A WebSocket keeps one persistent connection open so audio chunks can flow continuously without the overhead of repeated HTTP requests or the lag of polling. It also lets the backend push out-of-band events, like field extraction, emergency alerts, and transcripts, asynchronously while audio is still streaming.",
    },
    {
      question: "What happens if the Gemini Live connection drops mid-consultation?",
      answer:
        "The WebSocket handler wraps the audio streaming task in a background asyncio task tied to the session, and the connection lifecycle is managed with try/finally so the session is marked inactive and the task is cancelled cleanly on disconnect. Because fields are saved to the database immediately via save_field as the patient answers, rather than only at the end, a dropped connection doesn't lose previously collected answers, the patient can resume or the doctor can review whatever was captured before the drop.",
    },
    {
      question: "How do you turn a messy uploaded medical document into a clean structured summary?",
      answer:
        "The uploaded PDF or image is base64-encoded and sent to Gemini with a tightly specified prompt that forces a fixed markdown format: overview, plain-English explanation of the diagnosis, medications, individually-listed test results with reference ranges, next steps, and warning signs. Once that summary text exists, separate follow-up prompts ask Gemini to re-read the same summary and emit medications and test results as strict JSON arrays, which is what the frontend actually renders as structured cards.",
    },
    {
      question: "How does the drug interaction checking work, and why use RxNorm specifically?",
      answer:
        "Each medication name gets resolved to an RxCUI via the RxNorm API from the National Library of Medicine, which is the standard normalized vocabulary for drugs in the US. Once medications are mapped to RxCUIs, the analyzer checks pairwise interactions, flags duplicate therapies within the same drug class, aggregates side effects, and validates dosages, then rolls all of that up into an overall risk level. Using RxNorm instead of hardcoding a drug list means the matching is based on an authoritative, regularly updated source rather than something that would go stale.",
    },
    {
      question: "How do you handle PII and HIPAA-adjacent concerns given this stores real medical data?",
      answer:
        "Honestly, this project is built as a portfolio/demo system rather than a production HIPAA-compliant platform, there's no formal BAA, encryption-at-rest policy, or audit logging layer. That said, the design follows reasonable practices: passwords are hashed before storage, patient credentials are auto-generated and emailed rather than user-chosen weak passwords, role-based portals (patient/doctor/admin) keep data access scoped, and the database itself is a managed Postgres instance on Neon rather than a local file. If I were taking this to production I'd add encryption at rest, access auditing, and a real authentication/session layer instead of basic login checks.",
    },
    {
      question: "Why three separate portals instead of one unified app?",
      answer:
        "Patients, doctors, and clinic admins need fundamentally different views into the same data, a patient wants their own history and a chat assistant, a doctor wants a feed of incoming updates and a calendar across many patients, and an admin needs billing, claims, and registration tools. Splitting them into role-specific layouts and routes (PatientLayout, DoctorLayout, ClinicAdminLayout) keeps each portal's UI focused and makes it straightforward to gate features and navigation by role rather than building one screen that tries to serve everyone.",
    },
    {
      question: "The README mentions SQLite but the actual backend code uses PostgreSQL, why the discrepancy, and what would you do about it?",
      answer:
        "That's a real gap I'd clean up, the database layer evolved from an early SQLite prototype to PostgreSQL on Neon (with psycopg2 and RealDictCursor) once the app needed to run on Render instead of locally, since SQLite's file-based storage doesn't survive across serverless/ephemeral deployments or concurrent connections well. The code even has a comment noting that Postgres returns datetime and Decimal objects that need explicit serialization, which SQLite didn't require, that's a good example of a deployment constraint driving an architecture change after the fact. The fix is simply updating the README to reflect Postgres as the source of truth.",
    },
  ],
}
