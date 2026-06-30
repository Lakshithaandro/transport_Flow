import Badge from './Badge.jsx'

const statusToneMap = {
  Active: 'success',
  Assigned: 'info',
  Available: 'success',
  Completed: 'success',
  Delayed: 'warning',
  Draft: 'neutral',
  Flagged: 'danger',
  High: 'warning',
  Inactive: 'neutral',
  'In Progress': 'warning',
  'In Transit': 'info',
  Low: 'neutral',
  Maintenance: 'warning',
  Medium: 'info',
  'Needs Review': 'warning',
  Overdue: 'danger',
  Paid: 'success',
  Partial: 'info',
  Pending: 'warning',
  Reconciled: 'success',
  Scheduled: 'info',
}

export default function StatusBadge({ status }) {
  return <Badge tone={statusToneMap[status] || 'neutral'}>{status}</Badge>
}
