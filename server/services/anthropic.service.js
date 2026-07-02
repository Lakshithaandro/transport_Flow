import Anthropic from '@anthropic-ai/sdk'

const MODEL_ID = 'claude-opus-4-8'
const API_KEY_PLACEHOLDERS = new Set([
  'your-backend-only-anthropic-api-key',
  'your-anthropic-api-key',
  'your_api_key_here',
])

function getConfiguredApiKey() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim() || ''
  if (!apiKey || API_KEY_PLACEHOLDERS.has(apiKey.toLowerCase()) || apiKey.toLowerCase().startsWith('your-')) return ''
  return apiKey
}

function hasAuthTokenCredential() {
  return Boolean(process.env.ANTHROPIC_AUTH_TOKEN?.trim())
}

function getClient() {
  const apiKey = getConfiguredApiKey()
  if (apiKey) return new Anthropic({ apiKey })
  if (hasAuthTokenCredential()) return new Anthropic({ authToken: process.env.ANTHROPIC_AUTH_TOKEN.trim() })
  return null
}

export function isAnthropicConfigured() {
  return Boolean(getConfiguredApiKey() || hasAuthTokenCredential())
}

function extractText(response) {
  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim()
}

function buildAssistantPayload(analytics) {
  return {
    generatedAt: analytics.generatedAt,
    revenue: analytics.revenue,
    fuel: {
      totalFuelCost: analytics.fuel.totalFuelCost,
      totalGallons: analytics.fuel.totalGallons,
      averageCostPerGallon: analytics.fuel.averageCostPerGallon,
      averageFuelLogCost: analytics.fuel.averageFuelLogCost,
      abnormalUsageAlerts: analytics.fuel.abnormalUsageAlerts,
      poorEfficiencyVehicles: analytics.fuel.poorEfficiencyVehicles,
      highConsumptionVehicles: analytics.fuel.highConsumptionVehicles,
      vehicleEfficiency: analytics.fuel.vehicleEfficiency,
      fuelCostByDriver: analytics.fuel.fuelCostByDriver,
      costByVehicle: analytics.fuel.costByVehicle,
      gallonsByVehicle: analytics.fuel.gallonsByVehicle,
    },
    fleet: analytics.fleet,
    drivers: analytics.drivers,
    operations: analytics.operations,
    financial: analytics.financial,
    routeOptimization: analytics.routeOptimization,
    capabilities: analytics.capabilities,
    dataNotes: analytics.dataNotes,
  }
}

function buildFallbackAnswer(analytics, reason = 'AI model access is not configured on the backend') {
  const routeCount = analytics.routeOptimization?.scoredRoutes?.length || 0
  const fuelAlerts = analytics.fuel?.abnormalUsageAlerts?.length || 0
  const vehiclesDue = analytics.fleet?.vehiclesDueForService || 0
  const pendingInvoices = analytics.revenue?.pendingCount || 0

  return [
    '## Summary',
    `${reason}, so this response is using TransportFlow rule-based analytics only.`,
    '',
    '## Current operational signals',
    `- ${routeCount} stored routes are available for route comparison using distance, estimated hours, and fuel assumptions.`,
    `- ${fuelAlerts} fuel log entries currently show anomaly indicators for human review.`,
    `- ${vehiclesDue} vehicles have scheduled or overdue maintenance items.`,
    `- ${pendingInvoices} invoices are pending payment.`,
    '',
    '## Recommendation',
    '- Set a valid backend-only Anthropic credential in server/.env or the deployment environment.',
    '- Use ANTHROPIC_API_KEY for an API key, or ANTHROPIC_AUTH_TOKEN for an OAuth/auth token. Do not leave the example placeholder value in place.',
    '- Restart the backend after changing environment variables.',
    '- You can still use Reports and rule-based analytics for route, fuel, fleet, invoice, and operational summaries.',
    '',
    'Caveat: Route, toll, fuel theft, leakage, GPS, traffic, and telematics conclusions require data sources that may not exist in the current TransportFlow dataset.',
  ].join('\n')
}

function isAuthenticationError(error) {
  return error instanceof Anthropic.AuthenticationError || error?.status === 401 || error?.type === 'authentication_error'
}

export async function askLogisticsAssistant({ question, analytics }) {
  const client = getClient()

  if (!client) {
    return {
      available: false,
      answer: buildFallbackAnswer(analytics),
      model: null,
      generatedAt: new Date().toISOString(),
    }
  }

  let response

  try {
    response = await client.messages.create({
      model: MODEL_ID,
      max_tokens: 3000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'high' },
      system: [
        {
          type: 'text',
          text: [
            'You are TransportFlow AI, a senior logistics operations copilot for a fleet management SaaS dashboard.',
            'Answer only from the provided analytics JSON payload. Do not use outside knowledge or invent records.',
            'If data is unavailable, say "not available in current TransportFlow data" and explain what data would be needed.',
            'Use a professional operations format with concise sections: Summary, Key insights, Recommended actions, and Warnings/Data gaps when relevant.',
            'Use compact Markdown tables when comparing routes, vehicles, drivers, invoices, costs, or risks.',
            'Label estimates clearly. Route cost and efficiency recommendations are estimates from stored distance, estimated hours, MPG assumptions, and fuel cost.',
            'Never claim live traffic, GPS, toll, weather, map, ELD, sensor, diagnostic-code, fuel-card, or telematics data is available unless it appears in the payload.',
            'Never state that fuel theft, fuel leakage, fraud, or driver misconduct occurred. You may identify anomaly indicators that require human review.',
            'Never identify a lowest-toll route unless actual toll data appears in the payload. If toll data is missing, compare available route factors and list the data gap.',
            'Lead with the operational answer. Mention unavailable live data only when it affects the requested analysis.',
            'Use the provided TransportFlow analytics context to answer questions and recommend next actions. Do not claim to create, update, delete, dispatch, charge, route, or track live assets unless the provided context/tools explicitly support that action.',
          ].join('\n'),
        },
      ],
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            question,
            analytics: buildAssistantPayload(analytics),
          }),
        },
      ],
    })
  } catch (error) {
    if (isAuthenticationError(error)) {
      console.error('Anthropic authentication failed. Check the backend ANTHROPIC_API_KEY or ANTHROPIC_AUTH_TOKEN value.')
      return {
        available: false,
        answer: buildFallbackAnswer(analytics, 'The backend Anthropic credential is invalid'),
        model: null,
        generatedAt: new Date().toISOString(),
      }
    }

    throw error
  }

  if (response.stop_reason === 'refusal') {
    return {
      available: true,
      answer: '## Summary\nThe assistant could not answer that request.\n\n## Recommended action\n- Try asking a logistics, revenue, fuel, maintenance, route, driver, vehicle, customer, or operational analytics question grounded in TransportFlow data.',
      model: response.model || MODEL_ID,
      generatedAt: new Date().toISOString(),
    }
  }

  const answer = extractText(response)
  const stopNote = response.stop_reason === 'max_tokens'
    ? '\n\nWarning: The response reached the output limit. Ask a narrower question for a more complete answer.'
    : ''

  return {
    available: true,
    answer: answer ? `${answer}${stopNote}` : 'The assistant did not return a text response. Try rephrasing your logistics question.',
    model: response.model || MODEL_ID,
    generatedAt: new Date().toISOString(),
  }
}
