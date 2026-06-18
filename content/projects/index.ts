import { medEase } from "./data/01-medease"
import { investagent } from "./data/02-investagent"
import { hirefinch } from "./data/03-hirefinch"
import { lifewink } from "./data/04-lifewink"
import { sweet } from "./data/05-sweet"
import { tattoosAndHenna } from "./data/06-tattoos-and-henna"
import { unusualSound } from "./data/07-unusualsound"
import { Project } from "./types"

// To add a new project: create content/projects/data/XX-name.ts, import it here, add to array
export const projects: Project[] = [
  medEase,
  investagent,
  hirefinch,
  lifewink,
  sweet,
  tattoosAndHenna,
  unusualSound,
]

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}
