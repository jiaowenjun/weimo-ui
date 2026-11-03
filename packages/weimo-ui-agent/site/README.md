# weimo-ui-agent site

weimo-ui-agent 的组件演示站(单页直出站)。

- dev: `pnpm --dir site dev` → http://localhost:4184/weimo-ui/agent/
- 构建: `pnpm --dir site build`(经包根 `site:build` 会先构建库再建站)
- 站点消费包公开入口 `weimo-ui-agent/components/*`,不复刻组件实现
  (由 `scripts/site-template-contract.mjs` 断言)
