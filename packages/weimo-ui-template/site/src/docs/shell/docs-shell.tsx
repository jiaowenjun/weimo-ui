import { Outlet } from 'react-router'
import { ChevronLeft } from 'lucide-react'

import { FrostedIconButton } from 'weimo-ui-core/components/frosted-icon-button'
import { MiniSiteTemplate } from 'weimo-ui-template/components/mini-site-template'

import { GitHubIcon } from '../github-icon'

const homePageUrl = 'https://jiaowenjun.github.io'
const repoUrl = 'https://github.com/jiaowenjun/weimo-ui-template'

export function DocsShell() {
  return (
    <MiniSiteTemplate
      headline="网站模板，开箱即用"
      showThemeToggle={false}
      siteName="weimo-ui-template"
      subheadline="亮暗随行，宽窄自适应，克制极简"
      topBarActions={
        <FrostedIconButton
          aria-label="GitHub 仓库"
          onClick={() => window.open(repoUrl, '_blank', 'noopener,noreferrer')}
          tooltip="GitHub 仓库"
        >
          <GitHubIcon />
        </FrostedIconButton>
      }
      topBarLeading={
        <FrostedIconButton
          aria-label="返回主页"
          onClick={() => window.location.assign(homePageUrl)}
          tooltip="返回主页"
        >
          <ChevronLeft />
        </FrostedIconButton>
      }
    >
      <Outlet />
    </MiniSiteTemplate>
  )
}
