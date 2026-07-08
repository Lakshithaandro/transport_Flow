import Card from '../../components/ui/Card.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'

export default function AdminSettings() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Admin"
        title="Settings"
        description="Admin-only system settings for TransportFlow AI."
      />
      <Card title="Settings access">
        <p>Settings are restricted to administrator accounts. Additional configuration controls can be added here without changing manager access.</p>
      </Card>
    </div>
  )
}
