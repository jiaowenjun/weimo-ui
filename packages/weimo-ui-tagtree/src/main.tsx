import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { TagTreePage } from './page/tag-page'

import './page/tag-page.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TagTreePage />
  </StrictMode>,
)
