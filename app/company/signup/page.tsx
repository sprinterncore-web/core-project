'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { CompanyAuthLeftPanel } from '@/components/company/CompanyAuthLeftPanel'
import { createClient } from '@/lib/supabase/client'
import { isTestingMode } from '@/lib/testing'
import { TestingBanner } from '@/components/ui/TestingBanner'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

const personalDomains = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
]

export default function CompanySignupPage() {
  const [fullName, setFullName] = useState('')
  const [title, setTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [website, setWebsite] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [testingMode, setTestingMode] = useState(false)
  const [showTesting, setShowTesting] = useState(false)
  const [modifiedEmail, setModifiedEmail] = useState<string | null>(null)

  useEffect(() => {
    setShowTesting(isTestingMode())
  }, [])

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/company/callback`,
      },
    })
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!testingMode) {
      const emailDomain = email.split('@')[1]?.toLowerCase()
      if (personalDomains.includes(emailDomain ?? '')) {
        setError('Please use your company work email.')
        setLoading(false)
        return
      }
    }

    const supabase = createClient()
    const signUpOptions = {
      emailRedirectTo: `${window.location.origin}/company/callback`,
      data: {
        full_name: fullName,
        title,
        company_name: companyName,
        website,
        account_type: 'company',
      },
    }

    async function createCompanyRecords(userId: string, accountEmail: string) {
      const companyInitial = companyName.trim().charAt(0).toUpperCase()

      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          company_name: companyName.trim(),
          company_initial: companyInitial,
          website: website || null,
          contact_name: fullName.trim(),
          contact_email: accountEmail.toLowerCase(),
          contact_title: title.trim(),
          stage: 'Unknown',
          status: 'pending',
          call_booked: false,
          platform_access: false,
        })
        .select('id')
        .single()

      if (companyError || !newCompany) {
        console.error('Company creation error:', companyError?.message)
      }

      const { error: userError } = await supabase.from('company_users').insert({
        id: userId,
        email: accountEmail.toLowerCase(),
        full_name: fullName.trim(),
        title: title.trim(),
        company_id: newCompany?.id ?? null,
      })

      if (userError) {
        console.error('Company user creation error:', userError.message)
      }

      await supabase.from('notifications').insert({
        type: 'new_company_signup',
        title: 'New company signed up',
        body: `${fullName} from ${companyName} created an account.`,
        metadata: {
          company_id: newCompany?.id,
          company_name: companyName,
          contact_email: accountEmail,
          website: website || null,
        },
      })
    }

    let signupEmail = email
    let { data, error: signUpError } = await supabase.auth.signUp({
      email: signupEmail,
      password,
      options: signUpOptions,
    })

    if (
      signUpError?.message?.toLowerCase().includes('already registered') &&
      testingMode
    ) {
      const timestamp = Date.now().toString().slice(-4)
      signupEmail = email.replace('@', `+test${timestamp}@`)
      const retry = await supabase.auth.signUp({
        email: signupEmail,
        password,
        options: signUpOptions,
      })
      data = retry.data
      signUpError = retry.error
      if (!retry.error && retry.data.user) {
        await createCompanyRecords(retry.data.user.id, signupEmail)
        setModifiedEmail(signupEmail)
        setSuccess(true)
        setLoading(false)
        return
      }
    }

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await createCompanyRecords(data.user.id, signupEmail)
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-canvas">
      <CompanyAuthLeftPanel />
      <div className="lg:ml-[50%]">
        <div className="mx-auto max-w-sm px-6 py-16">
          {showTesting ? (
            <TestingBanner enabled={testingMode} onChange={setTestingMode} />
          ) : null}
          <h1 className="text-2xl font-bold text-navy">
            Create your company account
          </h1>
          <p className="mt-2 text-sm text-slate">
            Already have an account?{' '}
            <Link href="/company/login" className="font-semibold text-blue">
              Log in
            </Link>
          </p>

          {success ? (
            <div className="mt-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue/10">
                <Building2 size={48} className="text-blue" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-navy">
                Account created — check your email
              </h3>
              <p className="mt-2 text-sm text-slate">
                We sent a confirmation link to{' '}
                <span className="font-semibold text-navy">{email}</span>. Once
                verified, our team will be in touch to schedule your 20-minute
                intro call.
              </p>
              <div className="mt-5 rounded-xl bg-canvas p-5 text-left">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate/70">
                  What happens next
                </p>
                {[
                  'Confirm your email',
                  'We schedule your 20-min intro call',
                  'Our team sets up your company profile',
                  'Receive matched student shortlist',
                ].map((step, i) => (
                  <div key={step} className="mt-2 flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm text-navy">{step}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/book"
                className="mt-5 inline-block rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white hover:bg-blue/90"
              >
                Don&apos;t want to wait? Book your intro call now →
              </Link>
              {modifiedEmail ? (
                <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-600">
                  Testing mode: account created as {modifiedEmail}
                </p>
              ) : null}
            </div>
          ) : (
            <form onSubmit={handleSignup} className="mt-8 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Your full name *"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                />
                <input
                  required
                  placeholder='Title (e.g. "CTO") *'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                />
              </div>
              <input
                required
                placeholder="Company name *"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
              />
              <div>
                <input
                  required
                  type="email"
                  placeholder="Work email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                />
                <p className="mt-1 text-xs text-slate/60">
                  Use your company email address
                </p>
                {testingMode ? (
                  <p className="mt-1 text-xs text-amber-600">
                    Testing: personal emails accepted
                  </p>
                ) : null}
              </div>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  minLength={8}
                  placeholder="Password (min 8 characters) *"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input
                type="url"
                placeholder="https://yourcompany.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
              />
              <div className="flex items-start gap-2">
                <input required type="checkbox" id="terms-co" className="mt-1" />
                <label htmlFor="terms-co" className="text-sm text-slate">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-blue py-3.5 font-bold text-white hover:bg-blue/90 disabled:opacity-70"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : null}
                Create Company Account →
              </motion.button>
            </form>
          )}

          {!success ? (
            <>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-line" />
                <span className="text-xs text-slate">or continue with</span>
                <div className="h-px flex-1 bg-line" />
              </div>
              <button
                type="button"
                onClick={handleGoogle}
                className="mt-3 flex w-full items-center justify-center gap-3 rounded-full border border-line bg-white py-3 text-sm font-semibold text-navy hover:shadow-md"
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
