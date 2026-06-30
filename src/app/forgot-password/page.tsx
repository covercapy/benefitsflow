'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

type Step = 'form' | 'sent'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [step, setStep] = useState<Step>('form')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )
      if (resetError) throw resetError
      setStep('sent')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a2332] to-slate-900 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        <div>
          <p className="font-bold text-xl text-white leading-tight">BenefitsFlow</p>
          <p className="text-xs text-slate-400">Reset your password</p>
        </div>
      </div>

      <div className="w-full max-w-sm">
        {step === 'sent' ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-slate-400 text-sm mb-1">We sent a password reset link to</p>
            <p className="text-white font-semibold text-sm mb-6">{email}</p>
            <p className="text-slate-500 text-xs mb-6">
              The link expires in 1 hour. If you don&apos;t see the email, check your spam folder.
            </p>
            <Link
              href="/login"
              className="block w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors text-center"
            >
              Back to sign in
            </Link>
            <button
              onClick={() => setStep('form')}
              className="mt-3 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Resend to a different address
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-white">Forgot password?</h1>
              <p className="text-slate-400 text-sm mt-1">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 bg-red-900/40 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Work email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <Link
              href="/login"
              className="flex items-center gap-1.5 justify-center mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
