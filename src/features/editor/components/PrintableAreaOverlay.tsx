import type { PrintableArea } from '../types'

type PrintableAreaOverlayProps = {
  area: PrintableArea
}

export function PrintableAreaOverlay({
  area,
}: PrintableAreaOverlayProps) {
  return (
    <div
      className="pointer-events-none absolute rounded-[1rem] border border-dashed border-sky-500/40 bg-[linear-gradient(180deg,rgba(186,230,253,0.06),rgba(186,230,253,0.02))] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28)]"
      style={{
        height: `${area.height}%`,
        left: `${area.x}%`,
        top: `${area.y}%`,
        width: `${area.width}%`,
      }}
    >
      <div className="absolute inset-1 rounded-[0.8rem] border border-white/25" />
      <div className="absolute -top-2 left-2 rounded-full border border-sky-500/10 bg-white/88 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700/90 shadow-sm">
        Zone imprimable
      </div>
      <div className="absolute left-1 top-1 h-3 w-3 rounded-tl-[0.65rem] border-l-2 border-t-2 border-sky-500/50" />
      <div className="absolute right-1 top-1 h-3 w-3 rounded-tr-[0.65rem] border-r-2 border-t-2 border-sky-500/50" />
      <div className="absolute bottom-1 left-1 h-3 w-3 rounded-bl-[0.65rem] border-b-2 border-l-2 border-sky-500/50" />
      <div className="absolute bottom-1 right-1 h-3 w-3 rounded-br-[0.65rem] border-b-2 border-r-2 border-sky-500/50" />
    </div>
  )
}
