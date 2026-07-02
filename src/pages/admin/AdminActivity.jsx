import { useEffect, useState } from 'react'
import Card from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Field from '../../components/ui/Field.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import Toolbar from '../../components/ui/Toolbar.jsx'
import useAuth from '../../context/useAuth.js'
import { adminApi } from '../../services/adminApi.js'

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export default function AdminActivity() {
  const { getAuthToken } = useAuth()
  const [activities, setActivities] = useState([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [filters, setFilters] = useState({ search: '', sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 10 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadActivity() {
      setIsLoading(true)
      setError('')

      try {
        const data = await adminApi.getActivity(filters, getAuthToken)
        if (!ignore) {
          setActivities(data.items || [])
          setMeta({ page: data.page, totalPages: data.totalPages, total: data.total })
        }
      } catch (requestError) {
        if (!ignore) setError(requestError.message)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadActivity()

    return () => {
      ignore = true
    }
  }, [filters, getAuthToken])

  const updateFilters = (updates) => {
    setFilters((currentFilters) => ({ ...currentFilters, ...updates, page: updates.page || 1 }))
  }

  const columns = [
    { key: 'createdAt', label: 'Timestamp', render: (activity) => formatDateTime(activity.createdAt) },
    { key: 'action', label: 'Action', render: (activity) => <strong className="cell-primary">{activity.action}</strong> },
    { key: 'adminName', label: 'Admin Name', render: (activity) => activity.adminName || activity.adminEmail || 'Admin' },
    { key: 'targetType', label: 'Target' },
    { key: 'targetId', label: 'Target ID', render: (activity) => activity.targetId || '—' },
  ]

  const filteredActivities = activities.filter((activity) => {
    const searchableText = [activity.action, activity.adminName, activity.adminEmail, activity.targetType, activity.targetId].join(' ').toLowerCase()
    return searchableText.includes(filters.search.toLowerCase())
  })

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Admin" title="Activity Logs" description="Review admin actions including login, role changes, user deletes, and shipment updates." />

      {error ? <p className="auth-error">{error}</p> : null}

      <section className="stat-grid" aria-label="Activity log summary">
        <StatCard label="Total Logs" value={meta.total || 0} helper="Admin activity records" tone="info" />
        <StatCard label="Visible Logs" value={filteredActivities.length} helper="Matching current search" tone="success" />
        <StatCard label="Page" value={meta.page || 1} helper={`${meta.totalPages || 1} total pages`} tone="neutral" />
        <StatCard label="Auditing" value="Enabled" helper="Admin actions are recorded" tone="warning" />
      </section>

      <Card className="table-shell" eyebrow="Audit" title="Admin activities">
        <Toolbar>
          <Field label="Search current page">
            <input className="form-control" type="search" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Action, admin, target..." />
          </Field>
        </Toolbar>

        {isLoading ? <Card title="Loading activity"><p>Fetching admin activity logs.</p></Card> : <DataTable columns={columns} rows={filteredActivities} getRowKey={(activity) => activity._id || activity.id} emptyTitle="No activity logs found" enablePagination={false} />}

        <div className="table-footer">
          <span className="table-meta">Page {meta.page || 1} of {meta.totalPages || 1}</span>
          <div className="table-pagination">
            <button className="button button-secondary button-small" type="button" disabled={(meta.page || 1) <= 1} onClick={() => updateFilters({ page: (meta.page || 1) - 1 })}>Previous</button>
            <button className="button button-secondary button-small" type="button" disabled={(meta.page || 1) >= (meta.totalPages || 1)} onClick={() => updateFilters({ page: (meta.page || 1) + 1 })}>Next</button>
          </div>
        </div>
      </Card>
    </div>
  )
}
