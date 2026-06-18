"use client"

import { Blank } from "@/content/projects/types"

export default function ProseBlanks({
  blanks,
  submitted,
  answers,
  onChange,
}: {
  blanks: Blank[]
  submitted: boolean
  answers: string[]
  onChange: (index: number, value: string) => void
}) {
  return (
    <ol className="flex flex-col gap-3">
      {blanks.map((blank, i) => {
        const isCorrect = answers[i]?.trim() === blank.answer
        const parts = blank.line.split("___")

        return (
          <li key={i} className="flex gap-3">
            <span className="text-[#5c3d1e] text-xs font-mono mt-0.5 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex items-baseline flex-wrap gap-x-1 gap-y-1 text-[#c8a97e] text-sm leading-relaxed">
              {parts.map((part, j) => (
                <span key={j} className="inline-flex items-baseline gap-1 flex-wrap">
                  <span>{part}</span>
                  {j < parts.length - 1 && (
                    <input
                      value={answers[i] ?? ""}
                      onChange={(e) => onChange(i, e.target.value)}
                      disabled={submitted}
                      placeholder="___"
                      className={`w-40 px-2 py-0.5 rounded text-center font-mono text-xs outline-none border transition-colors ${
                        !submitted
                          ? "bg-[#1a1208] border-[#5c3d1e] text-[#f5e6c8] focus:border-[#a0845c] placeholder-[#4a3520]"
                          : isCorrect
                          ? "bg-[#0d2b0d] border-[#2d6a2d] text-[#6fcf6f]"
                          : "bg-[#2b0d0d] border-[#6a2d2d] text-[#cf6f6f]"
                      }`}
                    />
                  )}
                  {submitted && !isCorrect && j === parts.length - 1 && (
                    <span className="text-[#6a2d2d] text-xs">→ {blank.answer}</span>
                  )}
                </span>
              ))}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
