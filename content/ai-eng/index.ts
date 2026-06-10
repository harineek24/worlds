import { promptEngineering } from "./patterns/02-prompt-engineering"
import { ragRetrieval } from "./patterns/03-rag-retrieval"
import { finetuning } from "./patterns/04-finetuning"
import { evaluationObservability } from "./patterns/05-evaluation-observability"
import { agentsTools } from "./patterns/06-agents-tools"
import { productionInfra } from "./patterns/07-production-infra"
import { systemDesignBehavioral } from "./patterns/08-system-design-behavioral"
import { Pattern } from "../types"

// Sidebar order follows lockedinai.com/blog/ai-engineer-interview-questions curriculum
// To add a new topic: create content/ai-eng/patterns/XX-name.ts, import it here, add to array
export const aiTopics: Pattern[] = [
  promptEngineering,
  ragRetrieval,
  finetuning,
  evaluationObservability,
  agentsTools,
  productionInfra,
  systemDesignBehavioral,
]

export function getAiTopic(id: string): Pattern | undefined {
  return aiTopics.find((p) => p.id === id)
}
