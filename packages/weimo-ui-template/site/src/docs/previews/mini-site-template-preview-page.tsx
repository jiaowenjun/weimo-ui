import { useSearchParams } from 'react-router'

import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { FrostedIconButton } from 'weimo-ui-core/components/frosted-icon-button'
import { MiniSiteTemplate } from 'weimo-ui-template/components/mini-site-template'

import { GitHubIcon } from '../github-icon'
import { parseThemeMode } from './preview-theme'
import './mini-site-template-preview-page.css'

const repoUrl = 'https://github.com/jiaowenjun/weimo-ui-template'

/** MiniSiteTemplate iframe 预览源页面:不加包装地直出生产组件,
    由外层演示卡片的缩放壳提供独立 viewport 与文档环境。 */
export function MiniSiteTemplatePreviewPage() {
  const [searchParams] = useSearchParams()
  const defaultTheme = parseThemeMode(searchParams.get('theme')) ?? 'system'

  return (
    <MiniSiteTemplate
      defaultTheme={defaultTheme}
      headline="单页站壳"
      pageTitle="MiniSiteTemplate"
      siteName="weimo-ui-template"
      subheadline="顶栏插槽与三态主题开箱即用。"
      topBarActions={
        <FrostedIconButton
          aria-label="GitHub 仓库"
          onClick={() => window.open(repoUrl, '_blank', 'noopener,noreferrer')}
          tooltip="GitHub 仓库"
        >
          <GitHubIcon />
        </FrostedIconButton>
      }
    >
      <div className="mini-site-template-preview-page__cards">
        <ComponentPreviewCard label="顶栏与主题">
          <p className="mini-site-template-preview-page__description">
            右上角主题按钮按 light → dark → system 循环,只作用于本文档;
            topBarActions 插槽放仓库链接,showThemeToggle={'{'}false{'}'}
            可隐藏主题按钮、把位置让给站点操作。
          </p>
        </ComponentPreviewCard>

        <ComponentPreviewCard label="阅读宽度内容区">
          <p className="mini-site-template-preview-page__description">
            headline 提供时,标题区与内容一起收进限宽的 hero
            阅读宽度;不提供时内容区全宽展开,只保留页边留白。
          </p>
        </ComponentPreviewCard>
      </div>
    </MiniSiteTemplate>
  )
}
