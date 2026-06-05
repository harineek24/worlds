import { redirect } from "next/navigation"
import { patterns, getFirstProblemId } from "@/content"

export default function Home() {
  const first = patterns[0]
  redirect(`/${first.id}/study/${getFirstProblemId(first)}`)
}
