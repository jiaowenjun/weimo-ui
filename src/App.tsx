import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import './App.css'
import { componentDocs } from './docs/component-docs'
import { DocsShell } from './docs/docs-shell'
import { ComponentDetailPage } from './docs/pages/component-detail-page'
import { componentPath, routerBasename } from './docs/routes'
import { TokenPreviewCardWidthPage } from './dev/token-preview-card-width-page'

const defaultComponentPath = componentPath(componentDocs[0].id)

function App() {
  return (
    <BrowserRouter basename={routerBasename || undefined}>
      <Routes>
        <Route element={<DocsShell />} path="/">
          <Route index element={<Navigate replace to={defaultComponentPath} />} />
          <Route element={<ComponentDetailPage />} path="components/:componentId" />
          <Route element={<Navigate replace to={defaultComponentPath} />} path="*" />
        </Route>
        <Route element={<TokenPreviewCardWidthPage />} path="dev/token-preview-card" />
      </Routes>
    </BrowserRouter>
  )
}

export default App
