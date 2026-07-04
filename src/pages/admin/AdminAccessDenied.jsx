import Card from '../../components/ui/Card.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'

export default function AdminAccessDenied({ message }) {
  return (
    <main className="page-container">
      <div className="page-stack">
        <PageHeader
          eyebrow="Admin Access"
          title="Access denied"
          description="This account does not have permission to open the TransportFlow AI admin panel."
        />
        <Card title="Admin role required">
          <p>{message || 'Ask an administrator to assign the admin role to your account.'}</p>
        </Card>
      </div>
    </main>
  )
}
