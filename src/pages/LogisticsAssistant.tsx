import { useState } from 'react'
import AssistantInput from '../components/assistant/AssistantInput'
import FeatureCard from '../components/assistant/FeatureCard'
import ResponseCard from '../components/assistant/ResponseCard'
import PageHeader from '../components/ui/PageHeader.jsx'
import useAuth from '../context/useAuth.js'
import { aiApi } from '../services/aiApi.js'
import type { AssistantApiResponse, AssistantCapability } from '../types/assistant'

interface IconProps {
  className?: string
}

const capabilities: AssistantCapability[] = [
  {
    id: 'route-optimization',
    eyebrow: 'Route intelligence',
    title: 'AI Route Optimization',
    description: 'Analyze route performance, estimated cost, trip coverage, dispatch priority, and efficiency risk.',
    signals: ['Routes', 'Trips', 'Fuel assumptions'],
    tone: 'info',
    suggestions: [
      { id: 'routes-today', label: "Optimize today's routes", prompt: "Optimize today's routes using current trips, stored route distance, estimated hours, and fuel cost assumptions." },
      { id: 'routes-inefficient', label: 'Find inefficient routes', prompt: 'Which routes look inefficient or risky based on stored distance, estimated hours, trip status, and fuel assumptions?' },
      { id: 'routes-compare', label: 'Compare route options', prompt: 'Compare the available route options by speed, estimated fuel cost, dispatch priority, and operational risk.' },
    ],
  },
  {
    id: 'fuel-intelligence',
    eyebrow: 'Fuel intelligence',
    title: 'AI Fuel Intelligence',
    description: 'Review fuel spend, vehicle consumption, driver patterns, cost anomalies, and savings opportunities.',
    signals: ['Fuel logs', 'Vehicle spend', 'Driver spend'],
    tone: 'warning',
    suggestions: [
      { id: 'fuel-abnormal', label: 'Detect abnormal fuel usage', prompt: 'Detect abnormal fuel usage and identify vehicles, drivers, or logs that need review for leakage, theft risk, or data-entry issues.' },
      { id: 'fuel-most', label: 'Highest consumption', prompt: 'Which truck or vehicle has the highest fuel consumption or fuel cost, and what should operations review?' },
      { id: 'fuel-reduce', label: 'Reduce fuel costs', prompt: 'Suggest practical ways to reduce fuel costs using current fuel logs, vehicle usage, route data, and maintenance context.' },
    ],
  },
  {
    id: 'fleet-health',
    eyebrow: 'Fleet health',
    title: 'AI Fleet Health Prediction',
    description: 'Prioritize service risk, overdue work, recurring issues, high-mileage vehicles, and preventive maintenance actions.',
    signals: ['Maintenance', 'Mileage', 'Vehicle status'],
    tone: 'success',
    suggestions: [
      { id: 'fleet-maintenance', label: 'Predict maintenance', prompt: 'Predict upcoming maintenance workload and list vehicles that need attention before dispatch.' },
      { id: 'fleet-overdue', label: 'Overdue vehicles', prompt: 'Which vehicles have overdue or high-risk maintenance, and what preventive actions should we take?' },
      { id: 'fleet-cost', label: 'Operating cost risk', prompt: 'Which vehicle appears to have the highest operating cost or maintenance risk based on current records?' },
    ],
  },
  {
    id: 'operations-assistant',
    eyebrow: 'Operations copilot',
    title: 'AI Logistics Assistant',
    description: 'Ask natural-language questions across revenue, invoices, customers, routes, drivers, vehicles, fuel, and maintenance.',
    signals: ['Revenue', 'Invoices', 'Utilization'],
    tone: 'neutral',
    suggestions: [
      { id: 'ops-revenue', label: 'Revenue summary', prompt: 'Summarize revenue, paid invoices, pending invoices, outstanding balances, and collection risks.' },
      { id: 'ops-drivers', label: 'Compare drivers', prompt: 'Compare driver performance using trips, assignment status, fuel spend, and operational risk indicators.' },
      { id: 'ops-payments', label: 'Pending invoices', prompt: 'Show pending invoices and identify customers with overdue or outstanding payment risk.' },
    ],
  },
]

function RouteIcon({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 17a3 3 0 1 0 3-3H5a3 3 0 0 1 0-6h6" />
      <path d="M17 6h2a3 3 0 0 1 0 6h-6" />
      <path d="M14 3l-3 3 3 3" />
      <path d="M10 15l3 3-3 3" />
    </svg>
  )
}

function FuelIcon({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 3h7a2 2 0 0 1 2 2v16H4V5a2 2 0 0 1 2-2Z" />
      <path d="M8 7h4" />
      <path d="M15 8h2.5L20 10.5V18a2 2 0 0 0 4 0v-5" />
      <path d="M7 13h5" />
    </svg>
  )
}

function FleetIcon({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 15V8a2 2 0 0 1 2-2h8l4 4h2a2 2 0 0 1 2 2v3" />
      <path d="M3 15h18" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
      <path d="M14 6v4h4" />
    </svg>
  )
}

function AssistantIcon({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l1.4 4.2L18 9l-4.6 1.8L12 15l-1.4-4.2L6 9l4.6-1.8L12 3Z" />
      <path d="M5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z" />
      <path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" />
    </svg>
  )
}

const icons = {
  'route-optimization': <RouteIcon className="lucide-icon" />,
  'fuel-intelligence': <FuelIcon className="lucide-icon" />,
  'fleet-health': <FleetIcon className="lucide-icon" />,
  'operations-assistant': <AssistantIcon className="lucide-icon" />,
}

function normalizeAssistantResponse(response: AssistantApiResponse): AssistantApiResponse {
  return {
    ...response,
    answer: response.answer || 'The assistant did not return a text response. Try rephrasing your logistics question.',
  }
}

export default function LogisticsAssistant() {
  const { getAuthToken } = useAuth()
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState<AssistantApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasAsked, setHasAsked] = useState(false)

  const askAssistant = async () => {
    const trimmedQuestion = question.trim()

    if (!trimmedQuestion || isLoading) {
      if (!trimmedQuestion) {
        setError('Enter a question before asking the assistant.')
        setHasAsked(true)
      }
      return
    }

    setResponse(null)
    setError('')
    setHasAsked(true)
    setIsLoading(true)

    try {
      const assistantResponse = await aiApi.askAssistant(trimmedQuestion, getAuthToken)
      setResponse(normalizeAssistantResponse(assistantResponse))
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'The assistant could not complete the request. Try again in a moment.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-stack assistant-page">
      <PageHeader
        eyebrow="AI Copilot"
        title="AI Operations Assistant"
        description="Ask grounded questions about route efficiency, fuel usage, fleet health, revenue, invoices, drivers, vehicles, customers, and operational performance."
        actions={<span className="assistant-status-pill">Runs only when you click Ask Assistant</span>}
      />

      <section className="assistant-feature-grid" aria-label="AI capabilities">
        {capabilities.map((capability) => (
          <FeatureCard
            capability={capability}
            icon={icons[capability.id]}
            disabled={isLoading}
            onSuggestionSelect={setQuestion}
            key={capability.id}
          />
        ))}
      </section>

      <AssistantInput value={question} isLoading={isLoading} onChange={setQuestion} onSubmit={askAssistant} />

      <ResponseCard response={response} error={error} isLoading={isLoading} hasAsked={hasAsked} />
    </div>
  )
}
