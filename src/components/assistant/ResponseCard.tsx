import Badge from '../ui/Badge.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import type { AssistantApiResponse, AssistantGrounding } from '../../types/assistant'

type ParsedBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet-list'; items: string[] }
  | { type: 'number-list'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'callout'; text: string }

interface ResponseCardProps {
  response: AssistantApiResponse | null
  error: string
  isLoading: boolean
  hasAsked: boolean
}

function normalizeGrounding(grounding?: AssistantGrounding) {
  if (!grounding) return []

  return [
    ['Invoices', grounding.invoices ?? grounding.invoiceCount],
    ['Fuel logs', grounding.fuelLogs ?? grounding.fuelLogCount],
    ['Maintenance', grounding.maintenanceRecords ?? grounding.maintenanceRecordCount],
    ['Routes', grounding.routes ?? grounding.routeCount],
    ['Trips', grounding.trips ?? grounding.tripCount],
    ['Vehicles', grounding.vehicles ?? grounding.vehicleCount],
    ['Drivers', grounding.drivers ?? grounding.driverCount],
    ['Customers', grounding.customers ?? grounding.customerCount],
  ].filter((item): item is [string, number] => typeof item[1] === 'number')
}

function cleanMarkdownText(text: string) {
  return text.replace(/^#{1,6}\s*/, '').replace(/\*\*/g, '').trim()
}

function isTableLine(line: string) {
  return line.includes('|') && line.split('|').filter(Boolean).length >= 2
}

function parseTable(lines: string[]) {
  const rows = lines
    .map((line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cleanMarkdownText(cell)))
    .filter((row) => row.some(Boolean))

  const [headers = [], ...bodyRows] = rows.filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)))
  return { headers, rows: bodyRows }
}

function parseResponse(text: string): ParsedBlock[] {
  const lines = text.split(/\r?\n/)
  const blocks: ParsedBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index].trim()

    if (!line) {
      index += 1
      continue
    }

    if (isTableLine(line)) {
      const tableLines: string[] = []
      while (index < lines.length && isTableLine(lines[index].trim())) {
        tableLines.push(lines[index])
        index += 1
      }
      const table = parseTable(tableLines)
      if (table.headers.length && table.rows.length) {
        blocks.push({ type: 'table', headers: table.headers, rows: table.rows })
      }
      continue
    }

    if (/^#{1,4}\s/.test(line) || /^[A-Z][A-Z\s/&-]{3,}:?$/.test(line)) {
      blocks.push({ type: 'heading', text: cleanMarkdownText(line).replace(/:$/, '') })
      index += 1
      continue
    }

    if (/^(-|\*|•)\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^(-|\*|•)\s+/.test(lines[index].trim())) {
        items.push(cleanMarkdownText(lines[index].trim().replace(/^(-|\*|•)\s+/, '')))
        index += 1
      }
      blocks.push({ type: 'bullet-list', items })
      continue
    }

    if (/^\d+[.)]\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\d+[.)]\s+/.test(lines[index].trim())) {
        items.push(cleanMarkdownText(lines[index].trim().replace(/^\d+[.)]\s+/, '')))
        index += 1
      }
      blocks.push({ type: 'number-list', items })
      continue
    }

    if (/^(warning|caveat|limitation|data gap|note):/i.test(line)) {
      blocks.push({ type: 'callout', text: cleanMarkdownText(line) })
      index += 1
      continue
    }

    const paragraph: string[] = []
    while (index < lines.length) {
      const current = lines[index].trim()
      if (!current || isTableLine(current) || /^#{1,4}\s/.test(current) || /^(-|\*|•)\s+/.test(current) || /^\d+[.)]\s+/.test(current)) break
      paragraph.push(cleanMarkdownText(current))
      index += 1
    }
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') })
  }

  return blocks
}

function renderBlock(block: ParsedBlock, index: number) {
  if (block.type === 'heading') return <h3 key={index}>{block.text}</h3>
  if (block.type === 'paragraph') return <p key={index}>{block.text}</p>
  if (block.type === 'callout') return <div className="assistant-warning" key={index}>{block.text}</div>
  if (block.type === 'bullet-list') {
    return <ul key={index}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>
  }
  if (block.type === 'number-list') {
    return <ol key={index}>{block.items.map((item) => <li key={item}>{item}</li>)}</ol>
  }

  return (
    <div className="table-scroll assistant-response-table" key={index}>
      <table className="data-table">
        <thead>
          <tr>{block.headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={`${row.join('-')}-${rowIndex}`}>
              {block.headers.map((header, cellIndex) => <td key={`${header}-${cellIndex}`}>{row[cellIndex] || '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ResponseCard({ response, error, isLoading, hasAsked }: ResponseCardProps) {
  const answer = response?.answer?.trim() || ''
  const groundingRows = normalizeGrounding(response?.grounding)

  return (
    <section className="assistant-response-card" aria-live="polite">
      <div className="assistant-response-header">
        <div>
          <p className="eyebrow">AI Response</p>
          <h2>Operations answer</h2>
        </div>
        <div className="assistant-response-meta">
          {response?.available === false ? <Badge tone="warning">AI fallback</Badge> : null}
          {response?.model ? <Badge tone="info">{response.model}</Badge> : null}
        </div>
      </div>

      {isLoading ? <p className="loading-row"><span className="spinner" aria-hidden="true" /> Analyzing authenticated TransportFlow data...</p> : null}
      {error ? <p className="auth-error">{error}</p> : null}

      {!hasAsked && !isLoading && !error ? (
        <EmptyState title="Ask the assistant to begin" message="Use a suggestion or ask a natural-language question about operations, route efficiency, fuel usage, maintenance, invoices, or driver performance." />
      ) : null}

      {answer ? <div className="assistant-response-body">{parseResponse(answer).map(renderBlock)}</div> : null}

      {groundingRows.length ? (
        <div className="assistant-grounding" aria-label="Data used by assistant">
          {groundingRows.map(([label, value]) => (
            <span key={label}><strong>{value}</strong> {label}</span>
          ))}
        </div>
      ) : null}

      {response?.dataNotes?.length ? (
        <div className="assistant-data-notes">
          {response.dataNotes.slice(0, 3).map((note) => <span key={note}>{note}</span>)}
        </div>
      ) : null}
    </section>
  )
}
