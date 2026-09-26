import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { TagTreePage } from './tag-page'

import './tag-page.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TagTreePage />
  </StrictMode>,
)
