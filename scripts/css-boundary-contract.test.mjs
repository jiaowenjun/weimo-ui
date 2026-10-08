import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

// 组件库包之间的 CSS 边界:不得选择他包的 `__` 内部结构类名,定制一律经
// 被依赖包的公开 className 钩子(如 FloatBar frameClassName/slotClassName)。
// site 是应用主题层,允许覆写库类名,不在本契约范围。
const libraryPackages = [
  'weimo-ui-card',
  'weimo-ui-core',
  'weimo-ui-image',
  'weimo-ui-markdown',
  'weimo-ui-stats',
  'weimo-ui-tagtree',
]

// 显式豁免的跨包接口:新增条目必须写明治理测试。
const approvedCrossPackageClasses = [
  {
    className: 'md-editor__viewport',
    consumer: 'weimo-ui-card',
    owner: 'weimo-ui-markdown',
    reason:
      'Card 编辑布局与 MdEditor 滚动契约,由 tests/shared-css-interfaces.test.ts 双侧锁定。',
  },
]

function collectFiles(directory, filter) {
  if (!existsSync(directory)) return []

  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = join(directory, entry.name)

      return entry.isDirectory() ? collectFiles(entryPath, filter) : [entryPath]
    })
    .filter((file) => filter.test(file))
}

// 所有权:含 `__` 的 BEM 类名由渲染它的包独占;唯一归属才可判定。
const classOwners = new Map()
for (const packageName of libraryPackages) {
  const source = collectFiles(join(root, 'packages', packageName, 'src'), /\.(ts|tsx)$/)
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n')

  for (const match of source.matchAll(/[a-z][\w-]*__[a-z][\w-]*/g)) {
    const className = match[0]

    if (!classOwners.has(className)) classOwners.set(className, new Set())
    classOwners.get(className).add(packageName)
  }
}

for (const packageName of libraryPackages) {
  const cssFiles = collectFiles(join(root, 'packages', packageName, 'src'), /\.css$/)

  for (const file of cssFiles) {
    const withoutComments = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

    for (const match of withoutComments.matchAll(/\.([a-z][\w-]*__[a-z][\w-]*)/g)) {
      const className = match[1]
      const owners = classOwners.get(className)

      if (!owners) continue
      // 自包在归属集合内(如 md-render 渲染的类被 card 源码字符串共同提及)
      // 视为自有引用,合法。
      if (owners.has(packageName)) continue

      assert.equal(
        owners.size,
        1,
        `${relative(root, file)} selects .${className}, but its ownership is ambiguous (${[...owners].join(', ')}); resolve ownership or register an exemption first.`,
      )

      const [owner] = owners

      const approved = approvedCrossPackageClasses.find(
        (entry) =>
          entry.className === className &&
          entry.consumer === packageName &&
          entry.owner === owner,
      )
      assert.ok(
        approved,
        `${relative(root, file)} selects other package's internal class .${className} (owned by ${owner}); customize via the dependency's public className hooks, or register the approved interface with its governing test.`,
      )
    }
  }
}

// --icon-button-ghost-hover-bg 是 core 公开 theming hook:
// 默认值与文档标记必须常驻;跨包覆写点由各自契约锁定
// (capsule-button-contract / tag-tree-style-contract)。
const iconButtonCss = readFileSync(
  join(root, 'packages/weimo-ui-core/src/components/controls/icon-button/icon-button.css'),
  'utf8',
)

assert.ok(
  iconButtonCss.includes('--icon-button-ghost-hover-bg: var(--color-bg-hover);'),
  'core icon-button must keep the public ghost hover theming hook default.',
)
assert.ok(
  iconButtonCss.includes('公开 theming hook'),
  'core icon-button must document --icon-button-ghost-hover-bg as a public theming hook.',
)

console.log('CSS boundary contract tests passed.')
