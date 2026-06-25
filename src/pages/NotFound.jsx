import { Link } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'

export default function NotFound() {
  return (
    <Card className="not-found" eyebrow="404" title="Page not found">
      <p>This static frontend route is not part of the Milestone 1 setup.</p>
      <Link className="button button-primary" to="/">
        Back to overview
      </Link>
    </Card>
  )
}
