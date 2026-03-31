import type { EditorElementId } from './EditorElementId'
import type { LogoPosition } from './LogoPosition'
import type { LogoSize } from './LogoSize'
import type { UploadedLogo } from './UploadedLogo'

export type DesignElement = {
  asset: UploadedLogo
  id: EditorElementId
  position: LogoPosition
  size: LogoSize
  type: 'image'
}
