import type { ReactNode } from 'react'
import type { AssistantCapability } from '../../types/assistant'
import SuggestionChip from './SuggestionChip'

interface FeatureCardProps {
  capability: AssistantCapability
  icon: ReactNode
  disabled?: boolean
  onSuggestionSelect: (prompt: string) => void
}

export default function FeatureCard({ capability, icon, disabled = false, onSuggestionSelect }: FeatureCardProps) {
  return (
    <article className={`assistant-feature-card assistant-feature-card-${capability.tone || 'neutral'}`}>
      <div className="assistant-feature-topline">
        <div className="assistant-feature-icon" aria-hidden="true">{icon}</div>
        <div>
          <p className="eyebrow">{capability.eyebrow}</p>
          <h3>{capability.title}</h3>
        </div>
      </div>

      <p className="assistant-feature-description">{capability.description}</p>

      <div className="assistant-signal-list" aria-label={`${capability.title} data signals`}>
        {capability.signals.map((signal) => (
          <span className="assistant-signal" key={signal}>{signal}</span>
        ))}
      </div>

      {capability.caveat ? <p className="assistant-feature-caveat">{capability.caveat}</p> : null}

      <div className="suggestion-chip-row compact" aria-label={`${capability.title} suggested prompts`}>
        {capability.suggestions.map((suggestion) => (
          <SuggestionChip
            suggestion={suggestion}
            disabled={disabled}
            onSelect={onSuggestionSelect}
            key={suggestion.id}
          />
        ))}
      </div>
    </article>
  )
}
