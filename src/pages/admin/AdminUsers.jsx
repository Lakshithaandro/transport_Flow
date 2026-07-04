import { useEffect, useState } from 'react'
import Badge from '../../components/ui/Badge.jsx'
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

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

function getUserId(user) {
  return user.id || user._id
}

export default function AdminUsers() {
  const { getAuthToken, appUser, refreshAppUser } = useAuth()
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 })
  const [filters, setFilters] = useState({ search: '', role: 'All', status: 'All', sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 10 })
  const [selectedUser, setSelectedUser] = useState(null)
  const [editForm, setEditForm] = useState({ displayName: '', role: 'user', status: 'active' })
  const [confirmAction, setConfirmAction] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadUsers() {
      setIsLoading(true)
      setError('')

      try {
        const data = await adminApi.getUsers(filters, getAuthToken)
        if (!ignore) {
          setUsers(data.items || [])
          setMeta({ page: data.page, totalPages: data.totalPages, total: data.total })
        }
      } catch (requestError) {
        if (!ignore) setError(requestError.message)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadUsers()

    return () => {
      ignore = true
    }
  }, [filters, getAuthToken])

  const reloadUsers = async () => {
    const data = await adminApi.getUsers(filters, getAuthToken)
    setUsers(data.items || [])
    setMeta({ page: data.page, totalPages: data.totalPages, total: data.total })
  }

  const updateFilters = (updates) => {
    setFilters((currentFilters) => ({ ...currentFilters, ...updates, page: updates.page || 1 }))
  }

  const selectUser = (user) => {
    setSelectedUser(user)
    setEditForm({ displayName: user.displayName || '', role: user.role, status: user.status })
  }

  const submitUserUpdate = async (event) => {
    event.preventDefault()
    if (!selectedUser) return

    setError('')
    setSaveMessage('')

    try {
      const updatedUser = await adminApi.updateUser(getUserId(selectedUser), editForm, getAuthToken)
      setSelectedUser(updatedUser)
      setSaveMessage('User updated successfully.')
      if (getUserId(selectedUser) === appUser?.id) await refreshAppUser()
      await reloadUsers()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const updateUser = async (user, payload) => {
    setError('')
    setSaveMessage('')

    try {
      const updatedUser = await adminApi.updateUser(getUserId(user), payload, getAuthToken)
      if (selectedUser && getUserId(selectedUser) === getUserId(user)) setSelectedUser(updatedUser)
      if (getUserId(user) === appUser?.id) await refreshAppUser()
      setSaveMessage('User action completed successfully.')
      await reloadUsers()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const deleteUser = async (user) => {
    setConfirmAction(null)
    setError('')
    setSaveMessage('')

    try {
      await adminApi.deleteUser(getUserId(user), getAuthToken)
      if (selectedUser && getUserId(selectedUser) === getUserId(user)) setSelectedUser(null)
      setSaveMessage('User deleted successfully.')
      await reloadUsers()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const columns = [
    { key: 'displayName', label: 'Name', render: (user) => <strong className="cell-primary">{user.displayName || 'Unnamed user'}</strong> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (user) => <Badge tone={user.role === 'admin' ? 'success' : 'neutral'}>{user.role}</Badge> },
    { key: 'status', label: 'Status', render: (user) => <StatusBadge status={user.status === 'active' ? 'Active' : 'Inactive'} /> },
    { key: 'lastLoginAt', label: 'Last Login', render: (user) => formatDate(user.lastLoginAt) },
    { key: 'createdAt', label: 'Created', render: (user) => formatDate(user.createdAt) },
    {
      key: 'actions',
      label: 'Actions',
      render: (user) => (
        <div className="inline-group">
          <button className="button button-secondary button-small" type="button" onClick={() => selectUser(user)}>View</button>
          <button className="button button-secondary button-small" type="button" onClick={() => updateUser(user, { role: user.role === 'admin' ? 'user' : 'admin' })}>{user.role === 'admin' ? 'Make user' : 'Make admin'}</button>
          <button className="button button-secondary button-small" type="button" onClick={() => updateUser(user, { status: user.status === 'active' ? 'disabled' : 'active' })}>{user.status === 'active' ? 'Disable' : 'Enable'}</button>
          <button className="button button-secondary button-small" type="button" onClick={() => setConfirmAction({ user })}>Delete</button>
        </div>
      ),
    },
  ]

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Admin" title="User Management" description="Search, sort, view, edit, disable, enable, delete, and update roles for platform users." />

      {error ? <p className="auth-error">{error}</p> : null}
      {saveMessage ? <p className="save-message">{saveMessage}</p> : null}

      <section className="stat-grid" aria-label="User management summary">
        <StatCard label="Users Found" value={meta.total || 0} helper="Matching current filters" tone="info" />
        <StatCard label="Page" value={meta.page || 1} helper={`${meta.totalPages || 1} total pages`} tone="neutral" />
        <StatCard label="Visible Rows" value={users.length} helper="Loaded from admin API" tone="success" />
        <StatCard label="Admin Role" value="Protected" helper="Server-side authorization" tone="warning" />
      </section>

      <section className="split-layout split-layout-wide">
        <Card className="table-shell" eyebrow="Directory" title="Users">
          <Toolbar>
            <Field label="Search">
              <input className="form-control" type="search" value={filters.search} onChange={(event) => updateFilters({ search: event.target.value })} placeholder="Name or email" />
            </Field>
            <Field label="Role">
              <select className="form-control" value={filters.role} onChange={(event) => updateFilters({ role: event.target.value })}>
                <option>All</option>
                <option>admin</option>
                <option>user</option>
              </select>
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

          {isLoading ? <Card title="Loading users"><p>Fetching user records from the admin API.</p></Card> : <DataTable columns={columns} rows={users} getRowKey={getUserId} emptyTitle="No users found" enablePagination={false} />}

          <div className="table-footer">
            <span className="table-meta">Page {meta.page || 1} of {meta.totalPages || 1}</span>
            <div className="table-pagination">
              <button className="button button-secondary button-small" type="button" disabled={(meta.page || 1) <= 1} onClick={() => updateFilters({ page: (meta.page || 1) - 1 })}>Previous</button>
              <button className="button button-secondary button-small" type="button" disabled={(meta.page || 1) >= (meta.totalPages || 1)} onClick={() => updateFilters({ page: (meta.page || 1) + 1 })}>Next</button>
            </div>
          </div>
        </Card>

        <Card eyebrow="Profile" title={selectedUser ? selectedUser.email : 'Select a user'}>
          {selectedUser ? (
            <form className="page-stack" onSubmit={submitUserUpdate}>
              <div className="detail-grid">
                <span>Email</span><strong>{selectedUser.email}</strong>
                <span>User ID</span><strong>{selectedUser.uid || selectedUser.id}</strong>
                <span>Created</span><strong>{formatDate(selectedUser.createdAt)}</strong>
              </div>
              <Field label="Display name">
                <input className="form-control" value={editForm.displayName} onChange={(event) => setEditForm({ ...editForm, displayName: event.target.value })} />
              </Field>
              <Field label="Role">
                <select className="form-control" value={editForm.role} onChange={(event) => setEditForm({ ...editForm, role: event.target.value })}>
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </Field>
              <Field label="Status">
                <select className="form-control" value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}>
                  <option value="active">active</option>
                  <option value="disabled">disabled</option>
                </select>
              </Field>
              <button className="button button-primary" type="submit">Save user</button>
            </form>
          ) : <p>Select a user to view profile details and make permitted edits.</p>}
        </Card>
      </section>

      {confirmAction ? (
        <ConfirmModal
          title="Delete user?"
          message={`This will disable ${confirmAction.user.email} and record the action in admin activity logs.`}
          confirmLabel="Delete user"
          onConfirm={() => deleteUser(confirmAction.user)}
          onCancel={() => setConfirmAction(null)}
        />
      ) : null}
    </div>
  )
}
