export default function TwoColumn({
  left,
  right,
  label,
}: {
  left: React.ReactNode
  right: React.ReactNode
  label?: string
}) {
  return (
    <div className="w-full">
      {label && (
        <p className="text-[#a0845c] text-xs uppercase tracking-widest font-mono mb-3 px-1">{label}</p>
      )}
      <div className="grid grid-cols-2 border border-[#3a2510] rounded-sm overflow-hidden">
        <div className="border-r border-[#3a2510] p-5">{left}</div>
        <div className="p-5">{right}</div>
      </div>
    </div>
  )
}
