import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import Card from '../../components/ui/Card.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Field from '../../components/ui/Field.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import Toolbar from '../../components/ui/Toolbar.jsx'
import useAuth from '../../context/useAuth.js'
import { adminApi } from '../../services/adminApi.js'

const emptyManagerForm = {
  displayName: '',
  email: '',
  phone: '',
  password: '',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

function getManagerId(manager) {
  return manager.id || manager._id
}

function getManagerFormValues(manager) {
  return { displayName: manager.displayName || '', phone: manager.phone || '', status: manager.status }
}

export default function AdminUsers() {
  const { getAuthToken } = useAuth()
  const [managers, setManagers] = useState([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [filters, setFilters] = useState({ search: '', status: 'All', sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 10 })
  const [selectedManager, setSelectedManager] = useState(null)
  const [createForm, setCreateForm] = useState(emptyManagerForm)
  const [editForm, setEditForm] = useState({ displayName: '', phone: '', status: 'active' })
  const [resetPassword, setResetPassword] = useState('')
  const [confirmAction, setConfirmAction] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingManager, setIsCreatingManager] = useState(false)
  const [isSavingManager, setIsSavingManager] = useState(false)
  const [savingManagerId, setSavingManagerId] = useState(null)
  const [error, setError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadManagers() {
      setIsLoading(true)
      setError('')

      try {
        const data = await adminApi.getManagers(filters, getAuthToken)
        if (!ignore) {
          setManagers(data.items || [])
          setMeta({ page: data.page, totalPages: data.totalPages, total: data.total })
        }
      } catch (requestError) {
        if (!ignore) setError(requestError.message)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadManagers()

    return () => {
      ignore = true
    }
  }, [filters, getAuthToken])

  const reloadManagers = async () => {
    const data = await adminApi.getManagers(filters, getAuthToken)
    setManagers(data.items || [])
    setMeta({ page: data.page, totalPages: data.totalPages, total: data.total })
  }

  const updateFilters = (updates) => {
    setFilters((currentFilters) => ({ ...currentFilters, ...updates, page: updates.page || 1 }))
  }

  const selectManager = (manager) => {
    setSelectedManager(manager)
    setEditForm(getManagerFormValues(manager))
    setResetPassword('')
  }

  const createManager = async (event) => {
    event.preventDefault()
    setError('')
    setSaveMessage('')
    setIsCreatingManager(true)

    try {
      await adminApi.createManager(createForm, getAuthToken)
      setCreateForm(emptyManagerForm)
      setSaveMessage('Manager account created successfully.')
      await reloadManagers()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsCreatingManager(false)
    }
  }

  const submitManagerUpdate = async (event) => {
    event.preventDefault()
    if (!selectedManager) return

    setError('')
    setSaveMessage('')
    setIsSavingManager(true)

    try {
      const updatedManager = await adminApi.updateManager(getManagerId(selectedManager), editForm, getAuthToken)
      setManagers((currentManagers) => currentManagers.map((manager) => (getManagerId(manager) === getManagerId(updatedManager) ? updatedManager : manager)))
      setSelectedManager(updatedManager)
      setEditForm(getManagerFormValues(updatedManager))
      setSaveMessage('Manager updated successfully.')
      await reloadManagers()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSavingManager(false)
    }
  }

  const updateManagerStatus = async (manager, status) => {
    setError('')
    setSaveMessage('')
    setSavingManagerId(getManagerId(manager))

    try {
      const updatedManager = await adminApi.updateManager(getManagerId(manager), { status }, getAuthToken)
      setManagers((currentManagers) => currentManagers.map((currentManager) => (getManagerId(currentManager) === getManagerId(updatedManager) ? updatedManager : currentManager)))
      if (selectedManager && getManagerId(selectedManager) === getManagerId(manager)) {
        setSelectedManager(updatedManager)
        setEditForm(getManagerFormValues(updatedManager))
      }
      setSaveMessage(status === 'disabled' ? 'Manager disabled successfully.' : 'Manager enabled successfully.')
      await reloadManagers()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingManagerId(null)
    }
  }

  const deleteManager = async (manager) => {
    const managerId = getManagerId(manager)
    const shouldMoveToPreviousPage = managers.length === 1 && (meta.page || filters.page || 1) > 1

    setConfirmAction(null)
    setError('')
    setSaveMessage('')
    setSavingManagerId(managerId)

    try {
      await adminApi.deleteManager(managerId, getAuthToken)
      setManagers((currentManagers) => currentManagers.filter((currentManager) => getManagerId(currentManager) !== managerId))
      setMeta((currentMeta) => {
        const nextTotal = Math.max((currentMeta.total || 0) - 1, 0)
        return {
          ...currentMeta,
          total: nextTotal,
          totalPages: Math.max(Math.ceil(nextTotal / (filters.limit || 10)), 1),
        }
      })
      if (selectedManager && getManagerId(selectedManager) === managerId) setSelectedManager(null)
      setSaveMessage('Manager deleted successfully.')

      if (shouldMoveToPreviousPage) {
        setFilters((currentFilters) => ({ ...currentFilters, page: Math.max((currentFilters.page || 1) - 1, 1) }))
      } else {
        await reloadManagers()
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingManagerId(null)
    }
  }

  const submitPasswordReset = async (event) => {
    event.preventDefault()
    if (!selectedManager) return

    setError('')
    setSaveMessage('')
    setIsSavingManager(true)

    try {
      const result = await adminApi.resetManagerPassword(getManagerId(selectedManager), { password: resetPassword }, getAuthToken)
      if (result.manager) {
        setManagers((currentManagers) => currentManagers.map((manager) => (getManagerId(manager) === getManagerId(result.manager) ? result.manager : manager)))
        setSelectedManager(result.manager)
        setEditForm(getManagerFormValues(result.manager))
      }
      setResetPassword('')
      setSaveMessage('Manager password reset successfully.')
      await reloadManagers()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSavingManager(false)
    }
  }

  const columns = [
    { key: 'displayName', label: 'Name', render: (manager) => <strong className="cell-primary">{manager.displayName || 'Unnamed manager'}</strong> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (manager) => manager.phone || '—' },
    { key: 'status', label: 'Status', render: (manager) => <StatusBadge status={manager.status === 'active' ? 'Active' : 'Inactive'} /> },
    { key: 'createdAt', label: 'Created Date', render: (manager) => formatDate(manager.createdAt) },
    { key: 'lastLoginAt', label: 'Last Login', render: (manager) => formatDate(manager.lastLoginAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: (manager) => {
        const isRowSaving = savingManagerId === getManagerId(manager)

        return (
          <div className="inline-group">
            <button className="button button-secondary button-small" type="button" onClick={() => selectManager(manager)}>
              <Pencil className="lucide-icon" aria-hidden="true" />
              Edit
            </button>
            <button className="button button-secondary button-small" type="button" disabled={isRowSaving} onClick={() => updateManagerStatus(manager, manager.status === 'active' ? 'disabled' : 'active')}>
              {manager.status === 'active' ? 'Disable' : 'Enable'}
            </button>
            <button className="button button-secondary button-small" type="button" disabled={isRowSaving} onClick={() => { selectManager(manager); setResetPassword('') }}>
              Reset Password
            </button>
            <button className="button button-secondary button-small" type="button" disabled={isRowSaving} onClick={() => setConfirmAction({ manager })}>Delete</button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Admin" title="Manager Management" description="Create, edit, disable, enable, delete, and reset manager accounts." />

      {error ? <p className="auth-error">{error}</p> : null}
      {saveMessage ? <p className="save-message">{saveMessage}</p> : null}

      <section className="stat-grid" aria-label="Manager management summary">
        <StatCard label="Managers Found" value={meta.total || 0} helper="Matching current filters" tone="info" />
        <StatCard label="Page" value={meta.page || 1} helper={`${meta.totalPages || 1} total pages`} tone="neutral" />
        <StatCard label="Visible Rows" value={managers.length} helper="Loaded from admin API" tone="success" />
        <StatCard label="Admin Only" value="Protected" helper="Manager accounts are admin-created" tone="warning" />
      </section>

      <section className="split-layout split-layout-wide">
        <Card className="table-shell" eyebrow="Directory" title="Managers">
          <Toolbar>
            <Field label="Search">
              <input className="form-control" type="search" value={filters.search} onChange={(event) => updateFilters({ search: event.target.value })} placeholder="Name, email, or phone" />
            </Field>
            <Field label="Status">
              <select className="form-control" value={filters.status} onChange={(event) => updateFilters({ status: event.target.value })}>
                <option>All</option>
                <option>active</option>
                <option>disabled</option>
              </select>
            </Field>
            <Field label="Sort by">
              <select className="form-control" value={filters.sortBy} onChange={(event) => updateFilters({ sortBy: event.target.value })}>
                <option value="createdAt">Created Date</option>
                <option value="displayName">Name</option>
                <option value="email">Email</option>
              </select>
            </Field>
          </Toolbar>

          {isLoading ? <Card title="Loading managers"><p>Fetching manager accounts from the admin API.</p></Card> : <DataTable columns={columns} rows={managers} getRowKey={getManagerId} emptyTitle="No managers found" enablePagination={false} />}

          <div className="table-footer">
            <span className="table-meta">Page {meta.page || 1} of {meta.totalPages || 1}</span>
            <div className="table-pagination">
              <button className="button button-secondary button-small" type="button" disabled={(meta.page || 1) <= 1} onClick={() => updateFilters({ page: (meta.page || 1) - 1 })}>Previous</button>
              <button className="button button-secondary button-small" type="button" disabled={(meta.page || 1) >= (meta.totalPages || 1)} onClick={() => updateFilters({ page: (meta.page || 1) + 1 })}>Next</button>
            </div>
          </div>
        </Card>

        <div className="page-stack">
          <Card eyebrow="Create Manager" title="Create Manager Account">
            <form className="form-grid form-grid-single" onSubmit={createManager}>
              <Field label="Name">
                <input className="form-control" value={createForm.displayName} onChange={(event) => setCreateForm({ ...createForm, displayName: event.target.value })} required />
              </Field>
              <Field label="Email">
                <input className="form-control" type="email" value={createForm.email} onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })} required />
              </Field>
              <Field label="Phone">
                <input className="form-control" value={createForm.phone} onChange={(event) => setCreateForm({ ...createForm, phone: event.target.value })} />
              </Field>
              <Field label="Temporary Password">
                <input className="form-control" type="password" minLength="6" value={createForm.password} onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })} required />
              </Field>
              <button className="button button-primary" type="submit" disabled={isCreatingManager}>{isCreatingManager ? 'Creating...' : 'Create Manager'}</button>
            </form>
          </Card>

          <Card eyebrow="Profile" title={selectedManager ? selectedManager.email : 'Select a manager'}>
            {selectedManager ? (
              <div className="page-stack">
                <form className="page-stack" onSubmit={submitManagerUpdate}>
                  <div className="detail-grid">
                    <span>Email</span><strong>{selectedManager.email}</strong>
                    <span>Manager ID</span><strong>{selectedManager.uid || selectedManager.id}</strong>
                    <span>Created</span><strong>{formatDate(selectedManager.createdAt)}</strong>
                  </div>
                  <Field label="Name">
                    <input className="form-control" value={editForm.displayName} onChange={(event) => setEditForm({ ...editForm, displayName: event.target.value })} />
                  </Field>
                  <Field label="Phone">
                    <input className="form-control" value={editForm.phone} onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })} />
                  </Field>
                  <Field label="Status">
                    <select className="form-control" value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}>
                      <option value="active">active</option>
                      <option value="disabled">disabled</option>
                    </select>
                  </Field>
                  <button className="button button-primary" type="submit" disabled={isSavingManager}>{isSavingManager ? 'Saving...' : 'Save Manager'}</button>
                </form>

                <form className="page-stack" onSubmit={submitPasswordReset}>
                  <Field label="Reset Password">
                    <input className="form-control" type="password" minLength="6" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} placeholder="New temporary password" required />
                  </Field>
                  <button className="button button-secondary" type="submit" disabled={isSavingManager}>{isSavingManager ? 'Resetting...' : 'Reset Password'}</button>
                </form>
              </div>
            ) : <p>Select a manager to view profile details and make permitted edits.</p>}
          </Card>
        </div>
      </section>

      {confirmAction ? (
        <ConfirmModal
          title="Delete manager?"
          message={`This will permanently delete ${confirmAction.manager.email} and record the action in admin activity logs.`}
          confirmLabel="Delete manager"
          onConfirm={() => deleteManager(confirmAction.manager)}
          onCancel={() => setConfirmAction(null)}
        />
      ) : null}
    </div>
  )
}
