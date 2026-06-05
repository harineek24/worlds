"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { patterns } from "@/content"

const COMING_SOON = [
  "Sliding Window",
  "Binary Search",
  "Stack",
  "Linked List",
  "Trees",
  "Tries",
  "Heap / Priority Queue",
  "Backtracking",
  "Graphs",
  "1D Dynamic Programming",
  "2D Dynamic Programming",
  "Greedy",
  "Intervals",
  "Math & Geometry",
  "Bit Manipulation",
]

export default function Sidebar() {
  const params = useParams()
  const activePattern = params?.patternId as string

  return (
    <aside className="w-56 min-h-screen bg-[#1a1208] border-r border-[#5c3d1e] flex flex-col py-8 px-4 shrink-0">
      <p className="text-[#a0845c] text-xs uppercase tracking-widest mb-6 font-mono">Patterns</p>

      <nav className="flex flex-col gap-1">
        {patterns.map((p) => {
          const isActive = activePattern === p.id
          return (
            <Link
              key={p.id}
              href={`/${p.id}/study/${p.problems[0].id}`}
              className={`text-sm px-3 py-2 rounded font-mono transition-colors ${
                isActive
                  ? "bg-[#5c3d1e] text-[#f5e6c8]"
                  : "text-[#a0845c] hover:text-[#f5e6c8] hover:bg-[#2a1f0e]"
              }`}
            >
              {p.patternName}
            </Link>
          )
        })}

        <div className="mt-4 border-t border-[#2a1f0e] pt-4 flex flex-col gap-1">
          {COMING_SOON.map((name) => (
            <span key={name} className="text-xs px-3 py-2 text-[#4a3520] font-mono cursor-default">
              {name}
            </span>
          ))}
        </div>
      </nav>
    </aside>
  )
}
