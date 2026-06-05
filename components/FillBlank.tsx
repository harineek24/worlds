"use client"

import { useState } from "react"
import { Blank } from "@/content/types"

export default function FillBlank({
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
    <div className="flex flex-col gap-3">
      {blanks.map((blank, i) => {
        const parts = blank.line.split("___")
        const isCorrect = answers[i]?.trim() === blank.answer
        return (
          <div key={i} className="font-mono text-sm flex items-center flex-wrap gap-1">
            {parts.map((part, j) => (
              <span key={j} className="flex items-center gap-1">
                <span className="text-[#c8a97e]">{part}</span>
                {j < parts.length - 1 && (
                  <input
                    value={answers[i] ?? ""}
                    onChange={(e) => onChange(i, e.target.value)}
                    disabled={submitted}
                    className={`w-24 px-2 py-0.5 rounded text-center font-mono text-sm outline-none border transition-colors ${
                      !submitted
                        ? "bg-[#1a1208] border-[#5c3d1e] text-[#f5e6c8] focus:border-[#a0845c]"
                        : isCorrect
                        ? "bg-[#0d2b0d] border-[#2d6a2d] text-[#6fcf6f]"
                        : "bg-[#2b0d0d] border-[#6a2d2d] text-[#cf6f6f]"
                    }`}
                  />
                )}
              </span>
            ))}
            {submitted && !isCorrect && (
              <span className="text-[#6a2d2d] text-xs ml-2">→ {blank.answer}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
