"use client"

import { use, useState } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getPattern } from "@/content"
import PhilosophyBanner from "@/components/PhilosophyBanner"
import TwoColumn from "@/components/TwoColumn"
import FillBlank from "@/components/FillBlank"

export default function ChallengePage({
  params,
}: {
  params: Promise<{ patternId: string; problemId: string }>
}) {
  const { patternId, problemId } = use(params)
  const pattern = getPattern(patternId)
  if (!pattern) notFound()

  const problem = pattern.problems.find((p) => p.id === problemId)
  if (!problem) notFound()

  const [answers, setAnswers] = useState<string[]>(Array(problem.blanks.length).fill(""))
  const [submitted, setSubmitted] = useState(false)

  const correct = problem.blanks.filter((b, i) => answers[i]?.trim() === b.answer).length
  const total = problem.blanks.length

  function handleChange(index: number, value: string) {
    setAnswers((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const nextProblem = pattern.problems[pattern.problems.findIndex((p) => p.id === problemId) + 1]

  return (
    <div className="flex flex-col min-h-screen">
      <PhilosophyBanner philosophy={pattern.philosophy} />

      <div className="flex flex-col gap-8 px-10 py-8">

        {/* Problem + Pattern (same as study, pattern name hidden until submit) */}
        <TwoColumn
          label="Problem"
          left={
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <h1 className="text-[#f5e6c8] font-mono text-base font-semibold">{problem.title}</h1>
                <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                  problem.difficulty === "easy" ? "text-[#6fcf6f] bg-[#0d2b0d]" :
                  problem.difficulty === "medium" ? "text-[#cfb06f] bg-[#2b1f0d]" :
                  "text-[#cf6f6f] bg-[#2b0d0d]"
                }`}>{problem.difficulty}</span>
              </div>
              <p className="text-[#c8a97e] text-sm leading-relaxed">{problem.prompt}</p>
            </div>
          }
          right={
            <div className="flex flex-col gap-3">
              <p className="text-[#a0845c] text-xs uppercase tracking-widest">Which pattern?</p>
              <div className="flex flex-wrap gap-2">
                {problem.patternKeywords.map((kw) => (
                  <span key={kw} className="text-xs px-3 py-1 rounded-full border border-[#5c3d1e] text-[#a0845c] font-mono">
                    {kw}
                  </span>
                ))}
              </div>
              {submitted ? (
                <div className="mt-3 pt-3 border-t border-[#2a1f0e]">
                  <p className="text-[#f5e6c8] font-mono text-sm">→ {pattern.patternName}</p>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-[#2a1f0e]">
                  <p className="text-[#4a3520] font-mono text-xs italic">Pattern revealed on submit</p>
                </div>
              )}
            </div>
          }
        />

        {/* Fill in the blanks — solution */}
        <TwoColumn
          label="Fill in the Blanks — Solution"
          left={<FillBlank blanks={problem.blanks} submitted={submitted} answers={answers} onChange={handleChange} />}
          right={
            <div className="flex flex-col gap-3">
              <p className="text-[#a0845c] text-xs uppercase tracking-widest mb-1">What are you doing here?</p>
              {submitted ? (
                <ol className="flex flex-col gap-3">
                  {problem.solutionExplanation.map((line, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-[#5c3d1e] text-xs font-mono mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      <p className="text-[#c8a97e] text-sm leading-relaxed">{line}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-[#4a3520] font-mono text-xs italic">Explanation revealed on submit</p>
              )}
            </div>
          }
        />

        {/* Trace blanks */}
        <TwoColumn
          label={`Trace — ${problem.testCase.input}`}
          left={
            <div className="flex flex-col gap-2">
              {problem.testCase.trace.map((line, i) => (
                <p key={i} className="text-[#c8a97e] font-mono text-xs leading-relaxed">{line}</p>
              ))}
            </div>
          }
          right={
            submitted ? (
              <ol className="flex flex-col gap-3">
                {problem.testCase.traceExplanations.map((exp, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-[#5c3d1e] text-xs font-mono mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <p className="text-[#c8a97e] text-sm leading-relaxed">{exp}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-[#4a3520] font-mono text-xs italic">Trace explanation revealed on submit</p>
            )
          }
        />

        {/* Submit / Score */}
        <div className="flex items-center justify-between border-t border-[#2a1f0e] pt-6 pb-8">
          <div>
            {submitted && (
              <p className={`font-mono text-sm ${correct === total ? "text-[#6fcf6f]" : "text-[#cfb06f]"}`}>
                {correct}/{total} correct
                {correct === total ? " — clean run" : " — review the study page"}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <Link
              href={`/${patternId}/study/${problemId}`}
              className="px-5 py-3 border border-[#5c3d1e] text-[#a0845c] hover:text-[#f5e6c8] font-mono text-sm rounded transition-colors"
            >
              ← Back to Study
            </Link>
            {!submitted ? (
              <button
                onClick={() => setSubmitted(true)}
                className="px-8 py-3 bg-[#5c3d1e] hover:bg-[#7a5230] text-[#f5e6c8] font-mono text-sm rounded transition-colors"
              >
                Submit
              </button>
            ) : nextProblem ? (
              <Link
                href={`/${patternId}/study/${nextProblem.id}`}
                className="px-8 py-3 bg-[#5c3d1e] hover:bg-[#7a5230] text-[#f5e6c8] font-mono text-sm rounded transition-colors"
              >
                Next Problem →
              </Link>
            ) : (
              <span className="px-8 py-3 text-[#4a3520] font-mono text-sm">Pattern Complete</span>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
