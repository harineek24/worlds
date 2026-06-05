import { Pattern } from "@/content/types"

export default function PhilosophyBanner({ philosophy }: { philosophy: Pattern["philosophy"] }) {
  return (
    <div className="w-full border-b border-[#5c3d1e] bg-[#140e06] px-10 py-6">
      <p className="text-[#f5e6c8] text-base italic leading-relaxed font-serif max-w-3xl">
        &ldquo;{philosophy.text}&rdquo;
      </p>
      <p className="text-[#a0845c] text-xs font-mono mt-2">{philosophy.source}</p>
      <p className="text-[#7a5c38] text-sm mt-3 max-w-2xl leading-relaxed">{philosophy.connection}</p>
    </div>
  )
}
