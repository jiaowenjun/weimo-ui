# npm 发版与消费方依赖更新流程

以 2026-10-25 发布 `weimo-ui-template@0.1.2`(MiniSiteTemplate)并让 `weimo-ui-editor` site 消费为例整理,适用于本仓库及 weimo 系其他 npm 包。发布方与消费方在同机(weimo-repos)时,按「先发版、后切换」的顺序走,避免中间态。

## 一、发布新版本(发布方仓库)

1. **前置**:`pnpm verify` 全绿;确认版本号策略——0.1.x 线内向后兼容的新增(如新组件/新导出)递增 patch(0.1.1 → 0.1.2),保持消费方 `~0.1.0` 区间不变即可解析到新版本。
2. **升版本**:改 `package.json` 的 `version`。
3. **先提交再发布**:`pnpm publish` 要求工作区干净,未跟踪文件(尤其是临时 `pnpm pack` 产物 `*.tgz`)也算不干净,先删掉再提交推送。
4. **发布**:`pnpm publish`(`prepack` 自动 clean+build+copy-css,`publishConfig.access: public` 已配置)。失败按症状排查:
   - `npm whoami` E401 / publish 404 `{"error":"Not found"}`:`~/.npmrc` 的 token 失效。npm 对无权限发布统一回 404,别误判为包名问题。更新 `//registry.npmjs.org/:_authToken=` 后重试。
   - granular token 可能 `whoami` 不通但能正常发布——以实际 publish 结果为准。
   - 403 `E_STAGE_REQUIRED`(token 限制为暂存区发布):改走两段式——
     1. `npm stage publish`(暂存,输出 stage id;`prepack` 同样会跑)
     2. 批准:npmjs.com 网页 → 包页 → 暂存版本 → Approve(要求 2FA)。CLI `npm stage approve <id>` 在非交互终端常见 404,不要反复重试。
     3. `npm stage list` 可查状态(validating → staged → 发布成功)
5. **确认落地**:`npm view <pkg>@<version> version`,能取到即发布成功。

## 二、消费方更新依赖

### 2.1 版本尚未发布时的临时消费(禁用 `link:`)

**禁止** `pnpm link` / `"dep": "link:../repo"` 消费本地未发布包:pnpm 的 `link:` 让被链包从**它自己仓库的 node_modules** 解析依赖——包括它的 peer 依赖(`react`/`react-dom`/`weimo-ui-core`)——页面里出现两份 React,运行时爆 `Invalid hook call`(症状常出现在 `FrostedLabel` 等 core 组件内部 hook)。

**正解 = 打 tarball 以 `file:` 安装**(peer 依赖正确解析到消费方副本):

```bash
# 发布方
pnpm pack                          # 生成 weimo-xxx-x.y.z.tgz(prepack 自动构建)
# 消费方(site/package.json)
"weimo-ui-template": "file:../../weimo-ui-template/weimo-ui-template-0.1.2.tgz"
pnpm install
```

注意:tarball 是**快照**,发布方源码再改动需重新 `pnpm pack` + `pnpm install`;发布完成后删除 tgz(发布方工作区不干净会阻断 publish)。

依赖身份变更(npm ↔ file: ↔ link:)后必须:**杀 dev server 进程 + `rm -rf site/node_modules/.vite` + 重启**。旧的 vite 依赖优化缓存会继续服务上一个身份的模块图,掩盖双 React 等问题,让冒烟「假通过」。

### 2.2 新版本发布后切换回 registry 依赖

1. **恢复区间依赖**:`"weimo-ui-template": "~0.1.0"`。
2. **强制解析到新版本**:pnpm 的 registry 元数据缓存短时间内看不到刚发的版本,`pnpm update <pkg>` 会一直 "Already up to date" 沿用旧解析。用两步法:

   ```bash
   pnpm add <pkg>@0.1.2        # 精确 pin,强制拉取,package.json 被写成精确版本
   # 手动把 package.json 改回 "~0.1.0"
   pnpm install                # 锁文件已满足区间,保留 0.1.2
   ```

   验证:`node -e "console.log(require('./site/node_modules/<pkg>/package.json').version)"`。
3. **供应链最小年龄放行**:workspace 配了 `minimumReleaseAge` 时,刚发布的版本会被拦截。在消费方 `pnpm-workspace.yaml` 的 `minimumReleaseAgeExclude` 加上该版本(如 `weimo-ui-template@0.1.0 || 0.1.2`)。
4. **契约脚本**:若断言了依赖写法(如 `dependencies['weimo-ui-template'] === '~0.1.0'`),过渡期临时放宽接受 `file:` tarball 路径,切回 registry 后收紧回原断言,并在放宽时注明原因与期限。
5. **验证与提交**:杀进程 + 清 `.vite` 缓存 + 重启 dev server → 浏览器冒烟(结构 + 视觉)→ 真机过目 → `pnpm verify` → 提交推送。提交前核对 `git status`:暂存区可能混有并行工作(曾出现 rename 预暂存被 `git add <files> && git commit` 误裹挟),按文件分组分开提交。

## 三、故障速查

| 症状 | 根因 | 处置 |
| --- | --- | --- |
| publish 404 Not Found / whoami E401 | token 失效或无权限 | 更新 `~/.npmrc` token |
| publish 403 `E_STAGE_REQUIRED` | token 仅允许暂存区发布 | `npm stage publish` + 网页 2FA 批准 |
| `npm stage approve` 404 | 非交互终端 / 状态未就绪 | 走 npmjs.com 网页批准 |
| 页面 `Invalid hook call`(core 组件内部 hook) | `link:` 依赖导致双 React | 改 `file:` tarball,清 `.vite` 缓存重启 |
| 冒烟通过但用户报错 | vite 旧优化缓存掩盖新依赖图 | 杀进程 + 删 `.vite` + 重启再验 |
| `pnpm update` "Already up to date" 拿不到新版本 | registry 元数据缓存滞后 | 精确 pin 安装 → 改回区间 → install |
| install 报新版本被策略拦截 | `minimumReleaseAge` 供应链策略 | `minimumReleaseAgeExclude` 加该版本 |

## 附:`npm stage` 子命令

`publish <spec>`(暂存)/ `list`(列暂存及状态)/ `view <id>` / `approve <id>` / `reject <id>` / `download <id>`。暂存状态流转:validating → staged(待批准)→ 发布成功。
