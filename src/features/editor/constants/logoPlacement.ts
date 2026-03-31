import type { LogoManualControls, LogoPosition, LogoSize } from '../types'

export const defaultLogoSizePercent = 72
export const minLogoSizePercent = 18

export function getDefaultLogoPosition(): LogoPosition {
  const centeredOffset = (100 - defaultLogoSizePercent) / 2

  return {
    x: centeredOffset,
    y: centeredOffset,
  }
}

export function getCenteredLogoPosition(size: LogoSize): LogoPosition {
  return {
    x: clamp((100 - size.width) / 2, 0, 100 - size.width),
    y: clamp((100 - size.height) / 2, 0, 100 - size.height),
  }
}

export function getDefaultLogoSize(
  logoAspectRatio = 1,
  printableAreaAspectRatio = 1,
): LogoSize {
  const safeLogoAspectRatio = logoAspectRatio > 0 ? logoAspectRatio : 1
  const safePrintableAreaAspectRatio =
    printableAreaAspectRatio > 0 ? printableAreaAspectRatio : 1

  if (safeLogoAspectRatio >= safePrintableAreaAspectRatio) {
    return {
      width: defaultLogoSizePercent,
      height:
        (defaultLogoSizePercent * safePrintableAreaAspectRatio) /
        safeLogoAspectRatio,
    }
  }

  return {
    width:
      (defaultLogoSizePercent * safeLogoAspectRatio) /
      safePrintableAreaAspectRatio,
    height: defaultLogoSizePercent,
  }
}

export function getLogoManualControls(
  position: LogoPosition,
  size: LogoSize,
): LogoManualControls {
  return {
    x: position.x,
    y: position.y,
    width: size.width,
  }
}

export function getMaxLogoWidth(
  position: LogoPosition,
  aspectRatio: number,
): number {
  const safeAspectRatio = aspectRatio > 0 ? aspectRatio : 1
  const widthLimitedByRightEdge = 100 - position.x
  const widthLimitedByBottomEdge = (100 - position.y) * safeAspectRatio

  return Math.max(
    minLogoSizePercent,
    Math.min(widthLimitedByRightEdge, widthLimitedByBottomEdge),
  )
}

export function getLogoSizeFromWidth(
  width: number,
  aspectRatio: number,
): LogoSize {
  const safeAspectRatio = aspectRatio > 0 ? aspectRatio : 1

  return {
    width,
    height: width / safeAspectRatio,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function normalizeLogoManualControls(
  controls: LogoManualControls,
  currentSize: LogoSize,
): LogoManualControls {
  const aspectRatio =
    currentSize.height > 0 ? currentSize.width / currentSize.height : 1

  const requestedWidth = clamp(controls.width, minLogoSizePercent, 100)
  const requestedHeight = requestedWidth / aspectRatio
  const requestedX = clamp(controls.x, 0, 100 - requestedWidth)
  const requestedY = clamp(controls.y, 0, 100 - requestedHeight)
  const maxWidth = getMaxLogoWidth({ x: requestedX, y: requestedY }, aspectRatio)
  const nextWidth = clamp(requestedWidth, minLogoSizePercent, maxWidth)
  const nextHeight = nextWidth / aspectRatio
  const nextX = clamp(requestedX, 0, 100 - nextWidth)
  const nextY = clamp(requestedY, 0, 100 - nextHeight)

  return {
    x: nextX,
    y: nextY,
    width: nextWidth,
  }
}
