import { useEffect, useRef, useState } from 'react'

import { minLogoSizePercent } from '../../constants/logoPlacement'
import type {
  DesignElement,
  LogoPosition,
  LogoSize,
  PrintableArea,
} from '../../types'

type LogoPreviewLayerProps = {
  area: PrintableArea
  element: DesignElement | null
  isSelected: boolean
  onPositionChange: (position: LogoPosition) => void
  onSizeChange: (size: LogoSize) => void
  onSelect: () => void
}

type InteractionMode = 'drag' | 'resize' | null

export function LogoPreviewLayer({
  area,
  element,
  isSelected,
  onPositionChange,
  onSizeChange,
  onSelect,
}: LogoPreviewLayerProps) {
  const areaRef = useRef<HTMLDivElement | null>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const interactionModeRef = useRef<InteractionMode>(null)
  const logoPositionRef = useRef<LogoPosition | null>(null)
  const logoSizeRef = useRef<LogoSize | null>(null)
  const resizeStartRef = useRef({
    height: 0,
    positionX: 0,
    positionY: 0,
    pointerX: 0,
    pointerY: 0,
    width: 0,
  })
  const [interactionMode, setInteractionMode] = useState<InteractionMode>(null)

  useEffect(() => {
    return () => {
      resetDocumentFeedback()
    }
  }, [])

  useEffect(() => {
    logoPositionRef.current = element?.position ?? null
  }, [element])

  useEffect(() => {
    logoSizeRef.current = element?.size ?? null
  }, [element])

  if (!element) {
    return null
  }

  const currentLogoPosition = element.position
  const currentLogoSize = element.size
  const logoAsset = element.asset
  const isInteractive = Boolean(interactionMode || isSelected)

  function updateInteractionMode(nextMode: InteractionMode) {
    interactionModeRef.current = nextMode
    setInteractionMode(nextMode)
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!areaRef.current || interactionModeRef.current === 'resize') {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    onSelect()

    const areaRect = areaRef.current.getBoundingClientRect()
    const currentLeft = (currentLogoPosition.x / 100) * areaRect.width
    const currentTop = (currentLogoPosition.y / 100) * areaRect.height

    dragOffsetRef.current = {
      x: event.clientX - areaRect.left - currentLeft,
      y: event.clientY - areaRect.top - currentTop,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    applyDocumentFeedback('drag')
    updateInteractionMode('drag')
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (interactionModeRef.current !== 'drag' || !areaRef.current) {
      return
    }

    const nextLogoSize = logoSizeRef.current

    if (!nextLogoSize) {
      return
    }

    const areaRect = areaRef.current.getBoundingClientRect()
    const logoWidth = (nextLogoSize.width / 100) * areaRect.width
    const logoHeight = (nextLogoSize.height / 100) * areaRect.height

    const nextLeft = clamp(
      event.clientX - areaRect.left - dragOffsetRef.current.x,
      0,
      areaRect.width - logoWidth,
    )
    const nextTop = clamp(
      event.clientY - areaRect.top - dragOffsetRef.current.y,
      0,
      areaRect.height - logoHeight,
    )

    const nextPosition = {
      x: (nextLeft / areaRect.width) * 100,
      y: (nextTop / areaRect.height) * 100,
    }

    logoPositionRef.current = nextPosition
    onPositionChange(nextPosition)
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    updateInteractionMode(null)
    resetDocumentFeedback()
  }

  function handleResizePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (!areaRef.current) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    resizeStartRef.current = {
      positionX: currentLogoPosition.x,
      positionY: currentLogoPosition.y,
      pointerX: event.clientX,
      pointerY: event.clientY,
      width: currentLogoSize.width,
      height: currentLogoSize.height,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    applyDocumentFeedback('resize')
    updateInteractionMode('resize')
  }

  function handleResizePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (interactionModeRef.current !== 'resize' || !areaRef.current) {
      return
    }

    const areaRect = areaRef.current.getBoundingClientRect()
    const logoAspectRatio =
      resizeStartRef.current.height > 0
        ? resizeStartRef.current.width / resizeStartRef.current.height
        : 1

    const deltaXPercent =
      ((event.clientX - resizeStartRef.current.pointerX) / areaRect.width) * 100
    const deltaYPercent =
      ((event.clientY - resizeStartRef.current.pointerY) / areaRect.height) * 100

    const maxWidth = Math.min(
      100 - resizeStartRef.current.positionX,
      (100 - resizeStartRef.current.positionY) * logoAspectRatio,
    )
    const projectedWidthFromX = resizeStartRef.current.width + deltaXPercent
    const projectedWidthFromY =
      resizeStartRef.current.width + deltaYPercent * logoAspectRatio
    const averagedProjectedWidth =
      (projectedWidthFromX + projectedWidthFromY) / 2

    const nextWidth = clamp(
      averagedProjectedWidth,
      minLogoSizePercent,
      maxWidth,
    )
    const nextSize = {
      width: nextWidth,
      height: nextWidth / logoAspectRatio,
    }

    logoSizeRef.current = nextSize
    onSizeChange(nextSize)
  }

  function handleResizePointerUp(
    event: React.PointerEvent<HTMLButtonElement>,
  ) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    updateInteractionMode(null)
    resetDocumentFeedback()
  }

  return (
    <div
      ref={areaRef}
      className="pointer-events-none absolute"
      style={{
        height: `${area.height}%`,
        left: `${area.x}%`,
        top: `${area.y}%`,
        width: `${area.width}%`,
      }}
    >
      <div
        role="presentation"
        className={`pointer-events-auto absolute flex touch-none select-none items-center justify-center rounded-[0.9rem] ${
          interactionMode === 'drag'
            ? 'cursor-grabbing'
            : isSelected
              ? 'cursor-grab'
              : 'cursor-pointer'
        }`}
        style={{
          height: `${currentLogoSize.height}%`,
          left: `${currentLogoPosition.x}%`,
          top: `${currentLogoPosition.y}%`,
          width: `${currentLogoSize.width}%`,
          willChange: interactionMode ? 'left, top, width, height' : 'auto',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={() => {
          updateInteractionMode(null)
          resetDocumentFeedback()
        }}
      >
        <div
          className={`pointer-events-none absolute -inset-2.5 rounded-[1.1rem] border transition-all duration-150 ${
            isSelected
              ? 'border-sky-500/25 opacity-100 shadow-[0_0_0_4px_rgba(14,165,233,0.08),0_18px_34px_-22px_rgba(14,165,233,0.22)]'
              : 'opacity-0'
          }`}
        />
        <div
          className={`relative flex h-full w-full items-center justify-center rounded-[0.95rem] border transition-[box-shadow,background-color,border-color,transform] duration-150 ${
            interactionMode
              ? 'scale-[1.01] border-sky-500/75 bg-white/36 shadow-[0_20px_32px_-20px_rgba(14,165,233,0.42)]'
              : isSelected
                ? 'scale-[1.01] border-sky-500/60 bg-white/30 shadow-[0_18px_28px_-22px_rgba(14,165,233,0.3)]'
              : 'border-transparent bg-transparent'
          }`}
        >
          <div
            className={`pointer-events-none absolute inset-[5px] rounded-[0.8rem] border transition-opacity duration-150 ${
              isInteractive
                ? 'border-sky-500/42 opacity-100'
                : 'border-transparent opacity-0'
            }`}
            style={{
              borderStyle: 'dashed',
            }}
          />
          <div
            className={`pointer-events-none absolute inset-0 rounded-[0.95rem] transition-opacity duration-150 ${
              isInteractive ? 'opacity-100' : 'opacity-0'
            } bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_68%)]`}
          />
          <div
            className={`pointer-events-none absolute -top-2 left-2 rounded-full border border-sky-500/12 bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700/90 shadow-sm transition-all duration-150 ${
              isSelected ? 'opacity-100' : 'opacity-0'
            }`}
            
          >
            Element actif
          </div>
          <img
            src={logoAsset.src}
            alt={logoAsset.name}
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
            className="max-h-full max-w-full object-contain drop-shadow-[0_12px_20px_rgba(28,25,23,0.18)]"
          />

          <button
            type="button"
            aria-label="Redimensionner le logo"
            className={`absolute -bottom-4 -right-4 flex h-11 w-11 touch-none items-center justify-center rounded-full border border-white/95 text-white transition-[transform,background-color,box-shadow,opacity] duration-150 ${
              interactionMode === 'resize'
                ? 'scale-110 cursor-se-resize bg-sky-600 opacity-100 shadow-[0_16px_28px_-14px_rgba(14,116,144,0.65)]'
                : isSelected
                  ? 'cursor-se-resize bg-stone-900/96 opacity-100 shadow-[0_12px_22px_-14px_rgba(28,25,23,0.65)]'
                  : 'cursor-se-resize opacity-0'
            }`}
            onPointerDown={(event) => {
              onSelect()
              handleResizePointerDown(event)
            }}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onPointerCancel={handleResizePointerUp}
            onLostPointerCapture={() => {
              updateInteractionMode(null)
              resetDocumentFeedback()
            }}
          >
            <span className="pointer-events-none relative block h-4.5 w-4.5">
              <span className="absolute inset-[4px] rounded-[2px] border-r-2 border-b-2 border-white" />
            </span>
          </button>

          <div
            className={`pointer-events-none absolute -left-2 -top-2 h-3.5 w-3.5 rounded-full border border-white/95 bg-sky-500 shadow-[0_8px_18px_-12px_rgba(14,165,233,0.55)] transition-opacity duration-150 ${
              isSelected ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            className={`pointer-events-none absolute -right-2 -top-2 h-3.5 w-3.5 rounded-full border border-white/95 bg-sky-500 shadow-[0_8px_18px_-12px_rgba(14,165,233,0.55)] transition-opacity duration-150 ${
              isSelected ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            className={`pointer-events-none absolute -bottom-2 -left-2 h-3.5 w-3.5 rounded-full border border-white/95 bg-sky-500 shadow-[0_8px_18px_-12px_rgba(14,165,233,0.55)] transition-opacity duration-150 ${
              isSelected ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      </div>
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function applyDocumentFeedback(mode: Exclude<InteractionMode, null>) {
  document.body.style.userSelect = 'none'
  document.body.style.cursor = mode === 'resize' ? 'se-resize' : 'grabbing'
}

function resetDocumentFeedback() {
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}
