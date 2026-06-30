'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, ArrowLeft, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Roles employees may self-assign. Manager and above require HR provisioning.
const ALLOWED_SELF_ROLES = [
  { value: 'EMPLOYEE', label: 'Employee', description: 'Standard employee — access to your own benefits, time clock, and self-service.' },
  { value: 'MANAGER', label: 'Manager (requires HR approval)', description: 'Team manager — pending approval from HR before access is granted.' },
]

type Step = 'form' | 'success'

export default function RegisterPage() {
  const supabase = createClient()
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    role: 'EMPLOYEE',
    password: '',
    confirmPassword: '',
  })

  function set(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const passwordStrength = (() => {
    const p = form.password
    if (!p) return null
    const checks = [p.length >= 8, /[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)]
    const score = checks.filter(Boolean).length
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' }
    if (score === 2) return { label: 'Fair', color: 'bg-yellow-500', width: 'w-2/4' }
    if (score === 3) return { label: 'Good', color: 'bg-blue-500', width: 'w-3/4' }
    return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' }
  })()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    // Block self-assignment of HR/admin roles
    if (['HRIS_ANALYST', 'HR_LEADERSHIP', 'BENEFITS_PARTNER'].includes(form.role)) {
      setError('That role requires HR provisioning. Contact your HR administrator.')
      return
    }

    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: {
            display_name: `${form.firstName.trim()} ${form.lastName.trim()}`,
            // Role stored in metadata for reference; authoritative role comes from user_profiles
            intended_role: form.role,
            employee_id: form.employeeId.trim().toUpperCase() || null,
          },
        },
      })

      if (signUpError) throw signUpError

      // If email confirmation is disabled (dev mode), create the user_profiles row
      // immediately so the app can identify the user on first login.
      if (data.user && data.session) {
        await supabase.from('user_profiles').upsert({
          id: data.user.id,
          worker_id: form.employeeId.trim().toUpperCase() || `REG-${Date.now()}`,
          display_name: `${form.firstName.trim()} ${form.lastName.trim()}`,
          // Managers start as EMPLOYEE until HR promotes them
          primary_role: form.role === 'MANAGER' ? 'EMPLOYEE' : form.role,
        })
      }

      setRegisteredEmail(form.email.trim().toLowerCase())
      setStep('success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a2332] to-slate-900 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Account Created</h1>
          <p className="text-slate-400 text-sm mb-1">
            We&apos;ve sent a confirmation link to
          </p>
          <p className="text-white font-semibold text-sm mb-6">{registeredEmail}</p>
          <p className="text-slate-500 text-xs mb-6">
            Click the link in the email to activate your account, then sign in.
            If you don&apos;t see it, check your spam folder.
          </p>
          <Link
            href="/login"
            className="block w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors text-center"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a2332] to-slate-900 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        <div>
          <p className="font-bold text-xl text-white leading-tight">BenefitsFlow</p>
          <p className="text-xs text-slate-400">Create your account</p>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-white">Sign up</h1>
          <p className="text-slate-400 text-sm mt-1">Already have an account?{' '}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign in</Link>
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 bg-red-900/40 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">First name *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={e => set('firstName', e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Last name *</label>
              <input
                type="text"
                value={form.lastName}
                onChange={e => set('lastName', e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Work email *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
              placeholder="you@company.com"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Employee ID (optional) */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Employee ID <span className="text-slate-600">(optional — e.g. ESI-10001)</span></label>
            <input
              type="text"
              value={form.employeeId}
              onChange={e => set('employeeId', e.target.value)}
              placeholder="ESI-XXXXX"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-violet-500"
            />
            <p className="text-[10px] text-slate-600 mt-0.5">Enter your ID to link this account to your worker record.</p>
          </div>

          {/* Role */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Role</label>
            <div className="space-y-2">
              {ALLOWED_SELF_ROLES.map(r => (
                <label
                  key={r.value}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all',
                    form.role === r.value
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-white/10 hover:border-white/20'
                  )}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={form.role === r.value}
                    onChange={() => set('role', r.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{r.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-1.5">
              HR Analyst, HR Leadership, and Benefits Partner roles require administrator provisioning.
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
                minLength={8}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 pr-10 text-sm text-white outline-none focus:ring-1 focus:ring-violet-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Strength indicator */}
            {passwordStrength && (
              <div className="mt-1.5">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', passwordStrength.color, passwordStrength.width)} />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{passwordStrength.label} · min 8 chars, uppercase, number, symbol</p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Confirm password *</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)}
                required
                className={cn(
                  'w-full bg-white/10 border rounded-lg px-3 py-2 pr-10 text-sm text-white outline-none focus:ring-1',
                  form.confirmPassword && form.password !== form.confirmPassword
                    ? 'border-red-500/60 focus:ring-red-500'
                    : 'border-white/20 focus:ring-violet-500'
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-[10px] text-red-400 mt-0.5">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        {/* Back link */}
        <Link
          href="/login"
          className="flex items-center gap-1.5 justify-center mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>

        <p className="text-center text-xs text-slate-700 mt-4">
          BenefitsFlow HRIS Lab · All data is fictional
        </p>
      </div>
    </div>
  )
}
