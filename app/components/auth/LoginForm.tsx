'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { makeLoginSchema, type LoginValues } from '@/lib/schemas'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function LoginForm({ redirect, dict }: { redirect?: string; dict: Dictionary }) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(makeLoginSchema(dict.auth.errors)),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginValues) => {
    const res = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    })

    if (res.error || !res.data) {
      console.log('[login response]', JSON.stringify(res))
      const err = res.error as { code?: string; message?: string } | null
      const code = err?.code ?? ''
      const msg = err?.message ?? ''
      let message = dict.auth.errors.loginFailed

      if (code === 'INVALID_PASSWORD' || code === 'INVALID_EMAIL' || /password|credential|invalid/i.test(msg)) {
        message = dict.auth.errors.invalidCredentials
      } else if (code === 'USER_NOT_FOUND' || /not found|no user/i.test(msg)) {
        message = dict.auth.errors.userNotFound
      }

      setError('root', { message })
      return
    }

    if (redirect) {
      router.replace(redirect)
      router.refresh()
      return
    }

    try {
      const meRes = await fetch('/api/me', { credentials: 'include' })
      if (meRes.ok) {
        const me = await meRes.json()
        if (me.role === 'SUPER_ADMIN') router.replace('/admin/superadmin')
        else if (me.role === 'ADMIN') router.replace('/admin/dashboard')
        else if (me.role === 'STAFF') router.replace('/staff/dashboard')
        else if (me.role === 'PROMOTER') router.replace('/promoter')
        else router.replace('/user/dashboard')
        router.refresh()
        return
      }
    } catch {
      setError('root', { message: dict.auth.errors.connectionError })
      return
    }

    router.replace('/user/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} method="post" className="auth-form">
      <div className="auth-field">
        <label htmlFor="login-email" className="auth-label">{dict.auth.login.email}</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          className="auth-input"
          {...register('email')}
        />
        {errors.email && <span className="auth-error">{errors.email.message}</span>}
      </div>
      <div className="auth-field">
        <label htmlFor="login-password" className="auth-label">{dict.auth.login.password}</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          className="auth-input"
          {...register('password')}
        />
        {errors.password && <span className="auth-error">{errors.password.message}</span>}
      </div>
      {errors.root && <span className="auth-error">{errors.root.message}</span>}
      <button type="submit" className="auth-submit" disabled={isSubmitting}>
        {isSubmitting ? dict.auth.login.submitting : dict.auth.login.submit}
      </button>
    </form>
  )
}
