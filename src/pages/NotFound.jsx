import { Link } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'

export default function NotFound() {
  return (
    <Card className="not-found" eyebrow="404" title="Page not found">
      <p>The page you requested is not available.</p>
      <Link className="button button-primary" to="/vehicles-drivers">
        Return to dashboard
      </Link>
    </Card>
  )
}
