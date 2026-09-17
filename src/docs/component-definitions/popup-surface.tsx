import { PopupSurface } from '../../components/popup-surface'
import type { ComponentDefinition } from '../component-docs'

function PopupSurfaceDemo() {
  return (
    <div className="popup-surface-preview">
      <PopupSurface className="popup-surface-preview__tile">
        <span className="popup-surface-preview__title">Modal Surface</span>
        <span className="popup-surface-preview__meta">抬升浮层主体材质</span>
      </PopupSurface>
      <PopupSurface className="popup-surface-preview__tile" level="tooltip">
        <span className="popup-surface-preview__title">Tooltip Surface</span>
      </PopupSurface>
    </div>
  )
}

export const popupSurfaceDefinition = {
  id: 'popup-surface',
  summary: '统一 Dialog、Command、Tooltip 等抬升浮层主体的边框、背景与阴影',
  status: 'Preview',
  props: [
    { name: 'level', type: "'modal' | 'tooltip'", defaultValue: "'modal'" },
    { name: '...divProps', type: "ComponentPropsWithoutRef<'div'>", defaultValue: '-' },
  ],
  preview: () => <PopupSurfaceDemo />,
} satisfies ComponentDefinition
