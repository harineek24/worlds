import { notFound } from "next/navigation"
import Link from "next/link"
import { getPattern } from "@/content"
import PhilosophyBanner from "@/components/PhilosophyBanner"
import TwoColumn from "@/components/TwoColumn"

export default async function StudyPage({
  params,
}: {
  params: Promise<{ patternId: string; problemId: string }>
}) {
  const { patternId, problemId } = await params
  const pattern = getPattern(patternId)
  if (!pattern) notFound()

  const problem = pattern.problems.find((p) => p.id === problemId)
  if (!problem) notFound()

  const problemIndex = pattern.problems.findIndex((p) => p.id === problemId)
  const nextProblem = pattern.problems[problemIndex + 1]

  const solutionLines = problem.solution.trim().split("\n")
  const traceLines = problem.testCase.trace

  return (
    <div className="flex flex-col min-h-screen">
      <PhilosophyBanner philosophy={pattern.philosophy} />

      <div className="flex flex-col gap-8 px-10 py-8">

        {/* Problem + Pattern */}
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
              <p className="text-[#a0845c] text-xs uppercase tracking-widest">Pattern Keywords</p>
              <div className="flex flex-wrap gap-2">
                {problem.patternKeywords.map((kw) => (
                  <span key={kw} className="text-xs px-3 py-1 rounded-full border border-[#5c3d1e] text-[#a0845c] font-mono">
                    {kw}
                  </span>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-[#2a1f0e]">
                <p className="text-[#a0845c] text-xs uppercase tracking-widest mb-2">Pattern</p>
                <p className="text-[#f5e6c8] font-mono text-sm">→ {pattern.patternName}</p>
                <p className="text-[#7a5c38] text-xs mt-2 leading-relaxed">{pattern.template.description}</p>
              </div>
            </div>
          }
        />

        {/* Code + Explanation */}
        <TwoColumn
          label="Solution"
          left={
            <pre className="text-[#c8a97e] text-sm leading-7 font-mono whitespace-pre-wrap">{problem.solution}</pre>
          }
          right={
            <ol className="flex flex-col gap-3">
              {problem.solutionExplanation.map((line, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[#5c3d1e] text-xs font-mono mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[#c8a97e] text-sm leading-relaxed">{line}</p>
                </li>
              ))}
            </ol>
          }
        />

        {/* Trace + Explanation */}
        <TwoColumn
          label={`Trace — ${problem.testCase.input}`}
          left={
            <div className="flex flex-col gap-2">
              {traceLines.map((line, i) => (
                <p key={i} className="text-[#c8a97e] font-mono text-xs leading-relaxed">{line}</p>
              ))}
            </div>
          }
          right={
            <ol className="flex flex-col gap-3">
              {problem.testCase.traceExplanations.map((exp, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[#5c3d1e] text-xs font-mono mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[#c8a97e] text-sm leading-relaxed">{exp}</p>
                </li>
              ))}
            </ol>
          }
        />

        {/* Test Yourself — two separate modes */}
        <div className="flex justify-end gap-3 pb-8">
          <Link
            href={`/${patternId}/challenge/${problemId}?mode=explanation`}
            className="px-6 py-3 border border-[#5c3d1e] hover:bg-[#2a1f0e] text-[#a0845c] hover:text-[#f5e6c8] font-mono text-sm rounded transition-colors"
          >
            Test Reasoning →
          </Link>
          <Link
            href={`/${patternId}/challenge/${problemId}?mode=code`}
            className="px-6 py-3 bg-[#5c3d1e] hover:bg-[#7a5230] text-[#f5e6c8] font-mono text-sm rounded transition-colors"
          >
            Test Code →
          </Link>
        </div>

        {/* Next problem */}
        {nextProblem && (
          <div className="flex justify-between items-center border-t border-[#2a1f0e] pt-6 pb-8">
            <p className="text-[#4a3520] text-xs font-mono">Next in {pattern.patternName}</p>
            <Link
              href={`/${patternId}/study/${nextProblem.id}`}
              className="text-[#a0845c] hover:text-[#f5e6c8] font-mono text-sm transition-colors"
            >
              {nextProblem.title} →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
