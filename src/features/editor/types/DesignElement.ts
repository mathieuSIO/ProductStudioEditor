import type { EditorElementId } from './EditorElementId'
import type { LogoPosition } from './LogoPosition'
import type { LogoSize } from './LogoSize'
import type { PrintFormat } from './PrintFormat'
import type { UploadedLogo } from './UploadedLogo'

export type DesignElement = {
  asset: UploadedLogo
  id: EditorElementId
  position: LogoPosition
  printFormat: PrintFormat
  size: LogoSize
  type: 'image'
}
