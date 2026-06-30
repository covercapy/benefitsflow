'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Step = 'loading' | 'form' | 'success' | 'invalid'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [step, setStep] = useState<Step>('loading')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Supabase processes the reset token from the URL fragment automatically.
    // Listen for the PASSWORD_RECOVERY event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStep('form')
      } else if (event === 'SIGNED_IN') {
        // User already has a session — let them set password
        setStep('form')
      }
    })

    // Fallback: check for error in the URL hash
    const hash = window.location.hash
    if (hash.includes('error=')) {
      setStep('invalid')
    } else if (!hash.includes('access_token') && !hash.includes('type=recovery')) {
      // No token in URL — show invalid after a brief delay
      setTimeout(() => {
        setStep(prev => prev === 'loading' ? 'invalid' : prev)
      }, 2000)
    }

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const passwordStrength = (() => {
    const p = password
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

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setStep('success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  const Logo = () => (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
        <Heart className="w-5 h-5 text-white fill-white" />
      </div>
      <div>
        <p className="font-bold text-xl text-white leading-tight">BenefitsFlow</p>
        <p className="text-xs text-slate-400">Set new password</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a2332] to-slate-900 flex flex-col items-center justify-center p-6">
      <Logo />

      <div className="w-full max-w-sm">
        {step === 'loading' && (
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Verifying reset link…</p>
          </div>
        )}

        {step === 'invalid' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Link expired or invalid</h1>
            <p className="text-slate-400 text-sm mb-6">
              Password reset links expire after 1 hour and can only be used once.
              Request a new one below.
            </p>
            <Link
              href="/forgot-password"
              className="block w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors text-center"
            >
              Request new reset link
            </Link>
            <Link href="/login" className="block mt-3 text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Back to sign in
            </Link>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Password updated</h1>
            <p className="text-slate-400 text-sm mb-6">
              Your password has been changed. Sign in with your new credentials.
            </p>
            <Link
              href="/login"
              className="block w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors text-center"
            >
              Sign in
            </Link>
          </div>
        )}

        {step === 'form' && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-white">Set new password</h1>
              <p className="text-slate-400 text-sm mt-1">Choose a strong password for your account.</p>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 bg-red-900/40 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">New password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
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
                {passwordStrength && (
                  <div className="mt-1.5">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', passwordStrength.color, passwordStrength.width)} />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{passwordStrength.label} · min 8 chars, uppercase, number, symbol</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Confirm new password *</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className={cn(
                      'w-full bg-white/10 border rounded-lg px-3 py-2 pr-10 text-sm text-white outline-none focus:ring-1',
                      confirmPassword && password !== confirmPassword
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
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[10px] text-red-400 mt-0.5">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
