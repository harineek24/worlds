import { notFound } from "next/navigation"
import Link from "next/link"
import { getProject } from "@/content/projects"
import TwoColumn from "@/components/TwoColumn"

export default async function ProjectStudyPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = getProject(projectId)
  if (!project) notFound()

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-10 py-8 border-b border-[#2a1f0e]">
        <h1 className="text-[#f5e6c8] font-mono text-xl font-semibold">{project.name}</h1>
        <p className="text-[#c8a97e] text-sm mt-2 leading-relaxed">{project.tagline}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {project.techStack.map((t) => (
            <span key={t} className="text-xs px-3 py-1 rounded-full border border-[#5c3d1e] text-[#a0845c] font-mono">
              {t}
            </span>
          ))}
        </div>
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#7a5c38] hover:text-[#c8a97e] font-mono mt-3 inline-block"
          >
            {project.repoUrl} →
          </a>
        )}
      </div>

      <div className="flex flex-col gap-8 px-10 py-8">
        <TwoColumn
          label="High-Level Summary — say this out loud first"
          left={
            <ol className="flex flex-col gap-3">
              {project.highLevelSummary.map((b, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[#5c3d1e] text-xs font-mono mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[#c8a97e] text-sm leading-relaxed">{b.line.replace("___", b.answer)}</p>
                </li>
              ))}
            </ol>
          }
          right={
            <p className="text-[#4a3520] font-mono text-xs italic">
              Memorize this as your 30-second answer to &ldquo;tell me about a project you worked on.&rdquo;
            </p>
          }
        />

        <TwoColumn
          label="Detailed Workflow — say this when asked to go deeper"
          left={
            <ol className="flex flex-col gap-3">
              {project.workflowSummary.map((b, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[#5c3d1e] text-xs font-mono mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[#c8a97e] text-sm leading-relaxed">{b.line.replace("___", b.answer)}</p>
                </li>
              ))}
            </ol>
          }
          right={
            <p className="text-[#4a3520] font-mono text-xs italic">
              This is the answer to &ldquo;walk me through the architecture / how it works end to end.&rdquo;
            </p>
          }
        />

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
          right={
            <p className="text-[#4a3520] font-mono text-xs italic">
              Drawn directly from the claims in your summaries above — be ready to defend every number and tech choice.
            </p>
          }
        />

        <div className="flex justify-end gap-3 pb-8">
          <Link
            href={`/projects/${projectId}/challenge?mode=high-level`}
            className="px-6 py-3 border border-[#5c3d1e] hover:bg-[#2a1f0e] text-[#a0845c] hover:text-[#f5e6c8] font-mono text-sm rounded transition-colors"
          >
            Test High-Level →
          </Link>
          <Link
            href={`/projects/${projectId}/challenge?mode=workflow`}
            className="px-6 py-3 bg-[#5c3d1e] hover:bg-[#7a5230] text-[#f5e6c8] font-mono text-sm rounded transition-colors"
          >
            Test Workflow →
          </Link>
        </div>
      </div>
    </div>
  )
}
