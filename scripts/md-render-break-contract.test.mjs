import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))
const server = await createServer({
  appType: 'custom',
  configFile: fileURLToPath(new URL('../vite.config.ts', import.meta.url)),
  logLevel: 'error',
  root,
  server: { middlewareMode: true },
})

try {
  const { MdRender } = await server.ssrLoadModule('/src/components/md-render.tsx')
  const html = renderToStaticMarkup(
    createElement(MdRender, {
      content: '>= First  line\n>= Second line',
    }),
  )

  assert.match(
    html,
    /class="weimo-card-markdown__blockquote weimo-card-markdown__blockquote--centered"/,
    'MdRender must preserve centered quote rendering.',
  )
  assert.ok(
    html.includes(
      '<p class="weimo-card-markdown__p">First  line<br/>Second line</p>',
    ),
    `MdRender must preserve authored spaces while rendering one DOM break per Markdown newline. Received: ${html}`,
  )
} finally {
  await server.close()
}
