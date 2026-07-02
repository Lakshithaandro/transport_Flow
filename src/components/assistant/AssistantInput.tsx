import type { FormEvent, KeyboardEvent } from 'react'

interface AssistantInputProps {
  value: string
  isLoading: boolean
  onChange: (value: string) => void
  onSubmit: () => void
}

export default function AssistantInput({ value, isLoading, onChange, onSubmit }: AssistantInputProps) {
  const trimmedValue = value.trim()

  const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      onSubmit()
    }
  }

  return (
    <section className="assistant-composer" aria-label="Ask AI Operations Assistant">
      <div>
        <p className="eyebrow">Ask Assistant</p>
        <h2>Ask about routes, fuel, fleet health, invoices, or performance</h2>
      </div>
      <form className="assistant-query-form" onSubmit={submitQuestion}>
        <textarea
          className="form-control textarea-control assistant-query-input"
          rows={4}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Example: Which vehicles need maintenance and what should dispatch prioritize this week?"
          disabled={isLoading}
          required
        />
        <div className="assistant-submit-column">
          <button className="button button-primary assistant-submit" type="submit" disabled={isLoading || !trimmedValue}>
            {isLoading ? <><span className="spinner" aria-hidden="true" /> Analyzing</> : 'Ask Assistant'}
          </button>
          <span className="assistant-input-help">Suggestions only fill this box. Press Ask Assistant to run AI.</span>
        </div>
      </form>
    </section>
  )
}
