import { Project } from "../types"

export const sweet: Project = {
  id: "sweet",
  order: 5,
  name: "Sweet",
  tagline: "A client-side Next.js app for building shareable digital gift boxes of sweets and flowers.",
  repoUrl: "https://github.com/harineek24/sweet",
  techStack: [
    "Next.js 16 (App Router)",
    "React 19",
    "TypeScript 5.8 (strict)",
    "Tailwind CSS 4",
    "React hooks (no external state library)",
    "localStorage",
    "base64 URL encoding",
  ],
  highLevelSummary: [
    {
      line: "SweetBox is a ___ application that lets users build a shareable digital gift box out of sweets, flowers, and hearts.",
      answer: "Next.js",
    },
    {
      line: "There's no backend at all, no database and no authentication, everything runs entirely on the ___.",
      answer: "client",
    },
    {
      line: "Once you've picked your items and written a note, the whole gift box gets packed into a ___-encoded URL so anyone with the link can open it.",
      answer: "base64",
    },
    {
      line: "Saved boxes also persist locally in the browser, with up to ___ boxes kept in localStorage.",
      answer: "50",
    },
  ],
  workflowSummary: [
    {
      line: "Everything interactive lives in a single client component called ___, which is about six hundred and thirty lines and holds all the state in React hooks.",
      answer: "SweetsBuilder",
    },
    {
      line: "The component is driven by a stage machine with four states, starting at the item-picking stage which I just call ___.",
      answer: "pick",
    },
    {
      line: "Users browse a catalog of fifty-one items split across three categories, sweets, flowers, and ___.",
      answer: "hearts",
    },
    {
      line: "After picking up to eighteen items, they move to an optional note stage to add a recipient name, a message, and a ___ name.",
      answer: "sender",
    },
    {
      line: "On the final box stage, the items get split by category at render time so flowers and hearts form a layered ___ while the sweets get rendered separately in a candy box with a lid and ribbon.",
      answer: "bouquet",
    },
    {
      line: "To share the result, the whole GiftBox object is serialized with JSON.stringify and then encoded using ___ so it can be embedded directly in the URL's query string.",
      answer: "btoa",
    },
    {
      line: "When someone opens that link, the component decodes the payload on mount and renders the box in a read-only ___ mode, with no server lookup required.",
      answer: "view",
    },
    {
      line: "If a user wants to revisit past creations, there's also a gallery stage that lists saved boxes pulled straight out of ___.",
      answer: "localStorage",
    },
  ],
  technicalQuestions: [
    {
      question: "Why did you choose to encode the entire gift box in the URL instead of using a backend?",
      answer:
        "The project is intentionally backend-free — no database, no auth, no API routes. Encoding the GiftBox object as base64 in a query parameter (btoa(JSON.stringify(box))) means the recipient's browser can decode and render the box without any server request, which keeps the architecture trivially simple and the hosting cost essentially zero, at the cost of no versioning or compression on the payload.",
    },
    {
      question: "How does the stage machine in SweetsBuilder work?",
      answer:
        "It's a single `stage` state variable that cycles through four values: pick (item selection grid, filterable by category, max 18 items), note (optional recipient/message/sender form), box (final rendered view), and gallery (list of saved boxes from localStorage). There's no reducer or external state library — it's plain useState driving conditional rendering.",
    },
    {
      question: "How are the bouquet and candy box visuals constructed from the selected items?",
      answer:
        "At render time the selected items are split by category: flowers and hearts become `bouquetItems` rendered with layered greenery PNGs (a bottom bush layer, the items in a flex-wrap-reverse layout with negative margins for overlap, and a top bush layer at a higher z-index), while sweets become `sweetBoxItems` rendered in a separate candy box with a lid, ribbon and CSS-only bow. Each item gets a deterministic pseudo-random rotation via a formula like ((i*7+3)%11)-5 degrees so the layout looks organic without being randomized on every render.",
    },
    {
      question: "What happens to saved boxes in localStorage, and what are the limitations?",
      answer:
        "Saved boxes are stored under a single localStorage key as an array of {id, box} objects, capped at 50 entries with the oldest pruned on save. IDs are random 8-character base-36 strings. There's no migration strategy, so if the GiftBox schema changes, old saved entries could break silently, and there's no cross-device sync since everything lives in one browser's storage.",
    },
    {
      question: "Why use emoji fallbacks instead of relying solely on the PNG images?",
      answer:
        "Each catalog item always has an `emoji` field plus an optional `image` field. The ItemVisual sub-component renders the image when present but has an onError handler that falls back to the emoji, so if a PNG fails to load or is missing, the UI degrades gracefully instead of showing a broken image icon.",
    },
    {
      question: "How is the item catalog structured, and why are the IDs non-sequential?",
      answer:
        "sweetsData.ts defines a flat array of 51 SweetItem objects (17 sweets, 22 flowers, 12 hearts) with id, name, emoji, optional image, flavor, meaning, color, and category fields. The IDs have gaps across four batches (1-12, 13-24, 25-36, 37-51) because items were added incrementally over time; lookups use a simple linear Array.find, which is fine at this scale.",
    },
    {
      question: "What's an example of a CSS animation bug you'd watch out for in this codebase, based on the architecture?",
      answer:
        "The README documents exactly this: the original sweetbox-pop-in keyframe animation used transform: rotate(0deg) in its final frame, which wiped out the per-item inline rotation transforms applied to bouquet items. The fix was bouquet-fade-in, which animates the scale CSS property instead of transform, so it can coexist with each item's independently-set rotation transform.",
    },
  ],
}
