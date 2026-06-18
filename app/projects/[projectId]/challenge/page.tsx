"use client"

import { use, useState } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { getProject } from "@/content/projects"
import TwoColumn from "@/components/TwoColumn"
import ProseBlanks from "@/components/ProseBlanks"

export default function ProjectChallengePage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params)
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") ?? "high-level" // "high-level" | "workflow"

  const project = getProject(projectId)
  if (!project) notFound()

  const activeBlanks = mode === "workflow" ? project.workflowSummary : project.highLevelSummary

  const [answers, setAnswers] = useState<string[]>(Array(activeBlanks.length).fill(""))
  const [submitted, setSubmitted] = useState(false)

  const correct = activeBlanks.filter((b, i) => answers[i]?.trim() === b.answer).length
  const total = activeBlanks.length

  function handleChange(index: number, value: string) {
    setAnswers((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const modeLabel = mode === "workflow" ? "Test Workflow" : "Test High-Level"

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-10 py-8 border-b border-[#2a1f0e]">
        <h1 className="text-[#f5e6c8] font-mono text-xl font-semibold">{project.name}</h1>
        <p className="text-[#c8a97e] text-sm mt-2 leading-relaxed">{project.tagline}</p>
      </div>

      <div className="flex flex-col gap-8 px-10 py-8">
        <TwoColumn
          label={modeLabel}
          left={
            <ProseBlanks
              blanks={activeBlanks}
              submitted={submitted}
              answers={answers}
              onChange={handleChange}
            />
          }
          right={
            <div className="flex flex-col gap-3">
              <p className="text-[#a0845c] text-xs uppercase tracking-widest">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((t) => (
                  <span key={t} className="text-xs px-3 py-1 rounded-full border border-[#5c3d1e] text-[#a0845c] font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          }
        />

        {submitted && (
          <TwoColumn
            label="Technical Questions You Should Expect"
            left={
              <ol className="flex flex-col gap-4">
                {project.technicalQuestions.map((qa, i) => (
                  <li key={i} className="flex flex-col gap-1">
                    <p className="text-[#f5e6c8] font-mono text-sm font-semibold">Q: {qa.question}</p>
                    <p className="text-[#c8a97e] text-sm leading-relaxed">A: {qa.answer}</p>
                  </li>
                ))}
              </ol>
            }
            right={<p className="text-[#4a3520] font-mono text-xs italic">Review these before your next interview.</p>}
          />
        )}

        <div className="flex items-center justify-between border-t border-[#2a1f0e] pt-6 pb-8">
          <div>
            {submitted && (
              <p className={`font-mono text-sm ${correct === total ? "text-[#6fcf6f]" : "text-[#cfb06f]"}`}>
                {correct}/{total} correct
                {correct === total ? " — clean run" : " — review the study page"}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href={`/projects/${projectId}/study`}
              className="px-5 py-3 border border-[#5c3d1e] text-[#a0845c] hover:text-[#f5e6c8] font-mono text-sm rounded transition-colors"
            >
              ← Back to Study
            </Link>
            {!submitted && mode !== "high-level" && (
              <Link
                href={`/projects/${projectId}/challenge?mode=high-level`}
                className="px-5 py-3 border border-[#5c3d1e] text-[#a0845c] hover:text-[#f5e6c8] font-mono text-sm rounded transition-colors"
              >
                Switch to High-Level
              </Link>
            )}
            {!submitted && mode !== "workflow" && (
              <Link
                href={`/projects/${projectId}/challenge?mode=workflow`}
                className="px-5 py-3 border border-[#5c3d1e] text-[#a0845c] hover:text-[#f5e6c8] font-mono text-sm rounded transition-colors"
              >
                Switch to Workflow
              </Link>
            )}
            {!submitted && (
              <button
                onClick={() => setSubmitted(true)}
                className="px-8 py-3 bg-[#5c3d1e] hover:bg-[#7a5230] text-[#f5e6c8] font-mono text-sm rounded transition-colors"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
