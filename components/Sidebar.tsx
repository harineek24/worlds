"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { patterns } from "@/content"
import { aiTopics } from "@/content/ai-eng"

const DIFFICULTY_DOT: Record<string, string> = {
  easy: "bg-[#2d6a2d]",
  medium: "bg-[#6a4e2d]",
  hard: "bg-[#6a2d2d]",
}

export default function Sidebar() {
  const params = useParams()
  const pathname = usePathname()
  const isAi = pathname?.startsWith("/ai/")
  const activePattern = params?.patternId as string
  const activeProblem = params?.problemId as string

  return (
    <aside className="w-60 min-h-screen bg-[#1a1208] border-r border-[#5c3d1e] flex flex-col py-8 px-4 shrink-0">
      <p className="text-[#a0845c] text-xs uppercase tracking-widest mb-6 font-mono">Patterns</p>

      <nav className="flex flex-col gap-1">
        {patterns.map((p) => {
          const isActive = activePattern === p.id
          return (
            <div key={p.id}>
              {/* Pattern row */}
              <Link
                href={`/${p.id}/study/${p.problems[0].id}`}
                className={`text-sm px-3 py-2 rounded font-mono transition-colors block ${
                  isActive && !isAi
                    ? "text-[#f5e6c8]"
                    : "text-[#a0845c] hover:text-[#f5e6c8] hover:bg-[#2a1f0e]"
                }`}
              >
                {p.patternName}
              </Link>

              {/* Problems list — only shown when this pattern is active */}
              {isActive && !isAi && (
                <div className="ml-3 mt-1 mb-2 flex flex-col gap-0.5 border-l border-[#3a2510] pl-3">
                  {p.problems.map((prob) => {
                    const isProblemActive = activeProblem === prob.id
                    return (
                      <Link
                        key={prob.id}
                        href={`/${p.id}/study/${prob.id}`}
                        className={`text-xs py-1.5 px-2 rounded font-mono flex items-center gap-2 transition-colors ${
                          isProblemActive
                            ? "bg-[#5c3d1e] text-[#f5e6c8]"
                            : "text-[#7a5c38] hover:text-[#c8a97e] hover:bg-[#2a1f0e]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DIFFICULTY_DOT[prob.difficulty]}`} />
                        <span className="truncate">{prob.title}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

      </nav>

      <p className="text-[#a0845c] text-xs uppercase tracking-widest mb-6 mt-8 font-mono">AI Engineering</p>

      <nav className="flex flex-col gap-1">
        {aiTopics.map((p) => {
          const isActive = isAi && activePattern === p.id
          return (
            <div key={p.id}>
              <Link
                href={`/ai/${p.id}/study/${p.problems[0].id}`}
                className={`text-sm px-3 py-2 rounded font-mono transition-colors block ${
                  isActive
                    ? "text-[#f5e6c8]"
                    : "text-[#a0845c] hover:text-[#f5e6c8] hover:bg-[#2a1f0e]"
                }`}
              >
                {p.patternName}
              </Link>

              {isActive && (
                <div className="ml-3 mt-1 mb-2 flex flex-col gap-0.5 border-l border-[#3a2510] pl-3">
                  {p.problems.map((prob) => {
                    const isProblemActive = activeProblem === prob.id
                    return (
                      <Link
                        key={prob.id}
                        href={`/ai/${p.id}/study/${prob.id}`}
                        className={`text-xs py-1.5 px-2 rounded font-mono flex items-center gap-2 transition-colors ${
                          isProblemActive
                            ? "bg-[#5c3d1e] text-[#f5e6c8]"
                            : "text-[#7a5c38] hover:text-[#c8a97e] hover:bg-[#2a1f0e]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DIFFICULTY_DOT[prob.difficulty]}`} />
                        <span className="truncate">{prob.title}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
