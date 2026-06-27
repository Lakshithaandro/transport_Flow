import Badge from './Badge.jsx'

const statusToneMap = {
  Active: 'success',
  Assigned: 'info',
  Available: 'success',
  Maintenance: 'warning',
  'Needs Review': 'warning',
}

export default function StatusBadge({ status }) {
  return <Badge tone={statusToneMap[status] || 'neutral'}>{status}</Badge>
}
