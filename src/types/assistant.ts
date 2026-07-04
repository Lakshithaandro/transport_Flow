export interface AssistantSuggestion {
  id: string
  label: string
  prompt: string
}

export interface AssistantCapability {
  id: string
  eyebrow: string
  title: string
  description: string
  signals: string[]
  caveat?: string
  suggestions: AssistantSuggestion[]
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral'
}

export interface AssistantGrounding {
  customers?: number
  routes?: number
  trips?: number
  vehicles?: number
  drivers?: number
  fuelLogs?: number
  invoices?: number
  maintenanceRecords?: number
  customerCount?: number
  vehicleCount?: number
  driverCount?: number
  invoiceCount?: number
  fuelLogCount?: number
  routeCount?: number
  tripCount?: number
  maintenanceRecordCount?: number
}

export interface AssistantApiResponse {
  answer?: string
  available?: boolean
  model?: string | null
  generatedAt?: string
  grounding?: AssistantGrounding
  dataNotes?: string[]
}
