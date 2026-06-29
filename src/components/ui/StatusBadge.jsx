import Badge from './Badge.jsx'

const statusToneMap = {
  Active: 'success',
  Assigned: 'info',
  Available: 'success',
  Completed: 'success',
  Delayed: 'warning',
  Draft: 'neutral',
  Inactive: 'neutral',
  'In Transit': 'info',
  Maintenance: 'warning',
  'Needs Review': 'warning',
  Scheduled: 'info',
}

export default function StatusBadge({ status }) {
  return <Badge tone={statusToneMap[status] || 'neutral'}>{status}</Badge>
}
