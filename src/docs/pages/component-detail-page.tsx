import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'

import {
  Card as CossCard,
  CardFrame as CossCardFrame,
  CardPanel as CossCardPanel,
} from '../../components/coss/card'
import { Table, TableBody, TableCell, TableRow } from '../../components/coss/table'
import { useDocsOutletContext } from '../docs-outlet-context'

export function ComponentDetailPage() {
  const { componentId } = useParams()
  const navigate = useNavigate()
  const { docs, onOpenSidebar } = useDocsOutletContext()
  const selected = docs.find((doc) => doc.id === componentId)
  const previewContext = { onOpenSidebar }

  useEffect(() => {
    if (!selected) {
      navigate('/', { replace: true })
    }
  }, [navigate, selected])

  if (!selected) {
    return null
  }

  return (
    <CossCardFrame className="doc-page">
      <header className="doc-page__header">
        <h1 className="doc-page__title">{selected.name}</h1>
        <p className="doc-page__summary">{selected.summary}</p>
      </header>

      <div className="demo-block">
        <CossCardPanel className="demo-block__panel preview-stage" data-component-id={selected.id} variant="stage">
          {selected.preview(previewContext)}
        </CossCardPanel>
      </div>

      <section className="doc-section" aria-labelledby="api-heading" id="api">
        <h2 className="doc-section__title" id="api-heading">
          API 参考
        </h2>
        <CossCard className="docs-panel">
          <CossCardPanel className="docs-props" variant="code">
            <Table variant="card">
              <TableBody>
                {selected.props.map((prop) => (
                  <TableRow key={prop.name}>
                    <TableCell>
                      <strong>{prop.name}</strong>
                    </TableCell>
                    <TableCell>
                      <code>{prop.type}</code>
                    </TableCell>
                    <TableCell>{prop.defaultValue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CossCardPanel>
        </CossCard>
      </section>
    </CossCardFrame>
  )
}
