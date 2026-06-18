import { Project } from "../types"

export const tattoosAndHenna: Project = {
  id: "tattoos-and-henna",
  order: 6,
  name: "Tattoos & Henna",
  tagline: "A real-time collaborative coloring and henna-design studio built with React, Konva, and PartyKit",
  repoUrl: "https://github.com/harineek24/tattoos-and-henna",
  techStack: [
    "React 19",
    "TypeScript",
    "Vite",
    "React Router",
    "Tailwind CSS v4",
    "Konva / react-konva",
    "PartyKit (partysocket)",
    "Neon (serverless Postgres)",
    "@neondatabase/serverless",
    "Canvas 2D API",
    "uuid",
    "Vercel",
  ],
  highLevelSummary: [
    {
      line: "This is a browser-based coloring and henna-design studio with two modes: a digital coloring book and a virtual hand you decorate with henna patterns, and the standout feature is that multiple people can color the same page together in ___.",
      answer: "real-time",
    },
    {
      line: "Real-time sync is powered by ___, which runs a small WebSocket server per room and relays every brush stroke, fill, and cursor position between connected users.",
      answer: "PartyKit",
    },
    {
      line: "The drawing surface itself is just the native ___ API for the coloring book, while the henna studio uses Konva to let users drag, scale, and rotate design stamps onto a hand outline.",
      answer: "Canvas 2D",
    },
    {
      line: "Saved designs and community creations are persisted to a serverless ___ database, but the app is built to gracefully fall back to localStorage if no database is configured.",
      answer: "Postgres",
    },
  ],
  workflowSummary: [
    {
      line: "The app is a single-page React app built with ___ and uses React Router to switch between two routes — a coloring page at the root and a henna studio at /henna.",
      answer: "Vite",
    },
    {
      line: "On the coloring page, every stroke is drawn locally onto an HTML canvas using the native 2D context, and tools include a brush with four brush types, a flood-fill bucket implemented as a hand-rolled scanline ___ algorithm, and an eraser.",
      answer: "flood-fill",
    },
    {
      line: "When two users join the same room, the app opens a ___ connection through the partysocket client library, normalizes stroke and cursor coordinates to a 0-1 range so they render correctly regardless of each user's canvas size, and broadcasts them to everyone else.",
      answer: "WebSocket",
    },
    {
      line: "On the server side, a tiny PartyKit server class in party/coloring.ts just rebroadcasts incoming messages to every other connection in the room and stores the latest canvas snapshot in its built-in storage so a ___ user gets caught up automatically.",
      answer: "late-joining",
    },
    {
      line: "The henna studio route is a different interaction model entirely: it renders a hand image as the canvas background and uses react-konva so users can drag pre-made SVG henna designs like mandalas, paisleys, and lotuses onto the hand, then resize and rotate them with a ___ handle.",
      answer: "Transformer",
    },
    {
      line: "Both the saved-design gallery and the community gallery read and write through a small data-access layer, designStore.ts, which checks whether a ___ connection string is configured and, if so, runs SQL queries directly from the browser using the Neon serverless driver.",
      answer: "Neon",
    },
    {
      line: "If no database is configured, that same data layer transparently falls back to ___ so the gallery and community features still work for local development or a database-less deployment.",
      answer: "localStorage",
    },
    {
      line: "The finished app — whether a colored page or a henna design — can be downloaded as a PNG, copied to the clipboard, or shared through the native Web Share API, and the whole front end is deployed as a static SPA on ___ with a rewrite rule that routes all paths back to index.html.",
      answer: "Vercel",
    },
  ],
  technicalQuestions: [
    {
      question: "Why use PartyKit instead of rolling your own WebSocket server or using something like Socket.IO?",
      answer:
        "PartyKit gives you a per-room, edge-deployed WebSocket actor model for free — each room is its own isolated server instance with built-in key-value storage (party.storage), connection enumeration (party.getConnections()), and a simple deploy story via 'npx partykit deploy'. For a feature this small (broadcast strokes, store latest canvas snapshot), that's much less infrastructure than standing up and scaling a custom Node WebSocket server or paying for a hosted Socket.IO backend.",
    },
    {
      question: "How do you keep the canvas in sync across users with potentially different screen sizes?",
      answer:
        "Every stroke, fill, and cursor event is normalized to a 0-1 coordinate range relative to the sender's canvas dimensions before being broadcast (e.g. dividing x by canvas.width), and the receiving client denormalizes by multiplying by its own canvas width/height. Since the canvas itself is rendered at a fixed internal resolution (800x600) and only scaled visually via CSS transforms, this keeps strokes aligned regardless of each user's viewport or zoom level.",
    },
    {
      question: "What happens when someone joins a room that's already in progress?",
      answer:
        "The PartyKit server persists the most recent full canvas snapshot as a base64 image data URL in its room storage whenever an 'image' event comes through (e.g. after loading a template or uploaded image). On connect, onConnect() checks that storage and, if present, sends the stored image straight to the new connection so they see the current state immediately, even though they missed all the individual strokes that built up to it.",
    },
    {
      question: "Why implement flood fill yourself instead of using a canvas library feature?",
      answer:
        "The native Canvas 2D API has no built-in bucket-fill primitive, so floodFill() reads the canvas's full ImageData, does an iterative scanline/stack-based flood fill with a color-tolerance check (so anti-aliased edges still get caught), writes the filled pixels back, and the same function is reused for both local fills and remote fills replayed from other users — keeping the fill logic identical regardless of who triggered it.",
    },
    {
      question: "How does the data layer decide between Neon and localStorage, and why design it that way?",
      answer:
        "designStore.ts calls isNeonConfigured(), which just checks whether VITE_NEON_DATABASE_URL is set. If it is, every read/write goes through tagged-template SQL queries via @neondatabase/serverless (Neon's HTTP driver, which works directly from the browser without a persistent connection pool); if not, or if a query throws, it falls back to JSON in localStorage. That makes the app runnable with zero backend setup for local development while still supporting a real shared Postgres-backed gallery in production.",
    },
    {
      question: "Why use Konva for the henna studio but plain canvas for the coloring page?",
      answer:
        "The coloring page just needs free-hand pixel painting, which is exactly what the imperative Canvas 2D API is built for and is cheaper than maintaining a scene graph for that use case. The henna studio, on the other hand, needs discrete, individually selectable, draggable, scalable, and rotatable design objects placed on top of a hand image — that's a retained-mode scene-graph problem, which is what Konva (via react-konva's declarative components and built-in Transformer) is designed to solve.",
    },
    {
      question: "What's the security/abuse surface of running SQL queries directly from the client with the Neon driver?",
      answer:
        "Because the Neon connection string is exposed via a VITE_ env variable, it ships in the client bundle, so this approach only makes sense with a database/role that has narrowly scoped permissions (e.g. insert/select on just the designs and shared_creations tables) and no sensitive data. The queries themselves use tagged template literals, which the Neon driver parameterizes, so they're not vulnerable to SQL injection — but anyone with the deployed site could still hit the same database directly, so it's appropriate for a low-stakes community gallery, not for anything requiring real access control.",
    },
  ],
}
