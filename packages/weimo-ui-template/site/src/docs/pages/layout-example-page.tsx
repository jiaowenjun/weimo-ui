import { MiniSiteTemplateDemo } from '../examples/mini-site-template-demo'
import { SiteTemplateDemo } from '../examples/site-template-demo'
import './layout-example-page.css'

export function LayoutExamplePage() {
  return (
    <div className="layout-example-page__cards">
      <SiteTemplateDemo />
      <MiniSiteTemplateDemo />
    </div>
  )
}
