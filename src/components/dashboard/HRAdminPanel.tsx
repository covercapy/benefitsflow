'use client'

import { useState } from 'react'
import { UserPlus, CheckCircle2, AlertCircle, Copy, Eye, EyeOff } from 'lucide-react'

type Role = 'EMPLOYEE' | 'MANAGER' | 'BENEFITS_PARTNER' | 'HRIS_ANALYST' | 'HR_LEADERSHIP'

interface CreatedEmployee {
  email: string
  display_name: string
  employee_id: string
  role: Role
  temp_password: string
}

const ROLES: { value: Role; label: string }[] = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'BENEFITS_PARTNER', label: 'Benefits Partner' },
  { value: 'HRIS_ANALYST', label: 'HRIS Analyst' },
  { value: 'HR_LEADERSHIP', label: 'HR Leadership' },
]

export function HRAdminPanel() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    employee_id: '',
    role: 'EMPLOYEE' as Role,
    department: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [created, setCreated] = useState<CreatedEmployee | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)

  function updateField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (status !== 'idle') { setStatus('idle'); setCreated(null) }
  }

  // Auto-generate email from name
  function handleNameChange(field: 'first_name' | 'last_name', value: string) {
    const updated = { ...form, [field]: value }
    const autoEmail = updated.first_name && updated.last_name
      ? `${updated.first_name.toLowerCase()}.${updated.last_name.toLowerCase()}@benefitsflow.demo`
      : form.email
    setForm({ ...updated, email: autoEmail })
    if (status !== 'idle') { setStatus('idle'); setCreated(null) }
  }

  // Auto-generate employee ID
  function handleEmployeeIdSuggest() {
    if (!form.employee_id) {
      const id = `ESI-${10020 + Math.floor(Math.random() * 80)}`
      setForm(prev => ({ ...prev, employee_id: id }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/admin/create-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          display_name: `${form.first_name} ${form.last_name}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create employee')
      setCreated(data)
      setStatus('success')
      setForm({ first_name: '', last_name: '', email: '', employee_id: '', role: 'EMPLOYEE', department: '' })
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
  }

  function copyCredentials() {
    if (!created) return
    navigator.clipboard.writeText(
      `Employee: ${created.display_name}\nEmail: ${created.email}\nTemp Password: ${created.temp_password}\nEmployee ID: ${created.employee_id}\nRole: ${created.role}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-violet-500'
  const labelCls = 'text-xs font-medium text-slate-500 block mb-1'

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
          <UserPlus className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Create Employee Login</h3>
          <p className="text-xs text-slate-400">New account saved to Supabase — employee can log in immediately</p>
        </div>
      </div>

      <div className="p-5">
        {/* Success state */}
        {status === 'success' && created && (
          <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-800">Employee account created!</p>
            </div>
            <div className="space-y-1 text-xs">
              <p><span className="text-emerald-600 font-medium">Name:</span> <span className="text-emerald-900">{created.display_name}</span></p>
              <p><span className="text-emerald-600 font-medium">Email:</span> <span className="text-emerald-900 font-mono">{created.email}</span></p>
              <p><span className="text-emerald-600 font-medium">Employee ID:</span> <span className="text-emerald-900 font-mono">{created.employee_id}</span></p>
              <p><span className="text-emerald-600 font-medium">Role:</span> <span className="text-emerald-900">{created.role}</span></p>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-medium">Temp Password:</span>
                <span className="font-mono text-emerald-900">{showPassword ? created.temp_password : '•'.repeat(created.temp_password.length)}</span>
                <button onClick={() => setShowPassword(s => !s)} className="text-emerald-500 hover:text-emerald-700">
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <button onClick={copyCredentials} className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900">
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy credentials'}
            </button>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>First Name</label>
              <input className={inputCls} value={form.first_name} onChange={e => handleNameChange('first_name', e.target.value)} placeholder="Bill" required />
            </div>
            <div>
              <label className={labelCls}>Last Name</label>
              <input className={inputCls} value={form.last_name} onChange={e => handleNameChange('last_name', e.target.value)} placeholder="Rush" required />
            </div>
          </div>

          <div>
            <label className={labelCls}>Email</label>
            <input className={inputCls} type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="bill.rush@benefitsflow.demo" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Employee ID</label>
              <input className={inputCls} value={form.employee_id} onChange={e => updateField('employee_id', e.target.value)} onFocus={handleEmployeeIdSuggest} placeholder="ESI-10010" required />
            </div>
            <div>
              <label className={labelCls}>Role</label>
              <select className={inputCls} value={form.role} onChange={e => updateField('role', e.target.value as Role)}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Department (optional)</label>
            <input className={inputCls} value={form.department} onChange={e => updateField('department', e.target.value)} placeholder="Clinical Care" />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account…</>
            ) : (
              <><UserPlus className="w-4 h-4" /> Create Employee Account</>
            )}
          </button>

          <p className="text-[10px] text-slate-400 text-center">
            Account is saved directly to Supabase · Employee can log in immediately at the login page
          </p>
        </form>
      </div>
    </div>
  )
}
