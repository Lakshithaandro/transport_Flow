import Card from '../../components/ui/Card.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'

export default function AdminAccessDenied({ message }) {
  return (
    <main className="page-container">
      <div className="page-stack">
        <PageHeader
          eyebrow="Restricted Access"
          title="Access denied"
          description="This account does not have permission to open this admin-only area."
        />
        <Card title="Admin role required">
          <p>{message || 'Ask an administrator if you need access to this page.'}</p>
        </Card>
      </div>
    </main>
  )
}
