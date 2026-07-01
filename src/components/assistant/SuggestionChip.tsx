import type { AssistantSuggestion } from '../../types/assistant'

interface SuggestionChipProps {
  suggestion: AssistantSuggestion
  disabled?: boolean
  onSelect: (prompt: string) => void
}

export default function SuggestionChip({ suggestion, disabled = false, onSelect }: SuggestionChipProps) {
  return (
    <button
      className="suggestion-chip"
      type="button"
      disabled={disabled}
      onClick={() => onSelect(suggestion.prompt)}
      aria-label={`Use suggested prompt: ${suggestion.label}`}
    >
      {suggestion.label}
    </button>
  )
}
