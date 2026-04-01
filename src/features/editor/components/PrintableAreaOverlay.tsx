import type { PrintableArea } from '../types'

type PrintableAreaOverlayProps = {
  area: PrintableArea
}

export function PrintableAreaOverlay({
  area,
}: PrintableAreaOverlayProps) {
  return (
    <div
      className="pointer-events-none absolute rounded-[1.05rem] border border-sky-500/55 bg-[linear-gradient(180deg,rgba(186,230,253,0.08),rgba(255,255,255,0.03))] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.38),0_0_0_1px_rgba(14,165,233,0.04)]"
      style={{
        height: `${area.height}%`,
        left: `${area.x}%`,
        top: `${area.y}%`,
        width: `${area.width}%`,
      }}
    >
      <div className="absolute inset-[5px] rounded-[0.85rem] border border-white/30" />
      <div className="absolute inset-0 rounded-[1.05rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_42%)]" />
      <div className="absolute -top-2 left-2 rounded-full border border-sky-500/12 bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700/90 shadow-sm">
        Zone imprimable
      </div>
      <div className="absolute left-1.5 top-1.5 h-3.5 w-3.5 rounded-tl-[0.75rem] border-l-2 border-t-2 border-sky-500/65" />
      <div className="absolute right-1.5 top-1.5 h-3.5 w-3.5 rounded-tr-[0.75rem] border-r-2 border-t-2 border-sky-500/65" />
      <div className="absolute bottom-1.5 left-1.5 h-3.5 w-3.5 rounded-bl-[0.75rem] border-b-2 border-l-2 border-sky-500/65" />
      <div className="absolute bottom-1.5 right-1.5 h-3.5 w-3.5 rounded-br-[0.75rem] border-b-2 border-r-2 border-sky-500/65" />
    </div>
  )
}
