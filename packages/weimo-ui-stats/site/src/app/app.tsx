import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import './app.css'
import { DocsShell } from '../docs/shell/docs-shell'
import { ComponentDetailPage } from '../docs/pages/component-detail-page'
import { routerBasename } from '../docs/routes'

function App() {
  return (
    <BrowserRouter basename={routerBasename || undefined}>
      <Routes>
        {/* 单组件站:唯一演示页直出首页,未知路径回首页 */}
        <Route element={<DocsShell />} path="/">
          <Route index element={<ComponentDetailPage />} />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
