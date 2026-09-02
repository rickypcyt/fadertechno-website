'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { makeRegisterSchema, type RegisterValues } from '@/lib/schemas'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function RegisterForm({ redirect, dict }: { redirect?: string; dict: Dictionary }) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(makeRegisterSchema(dict.auth.errors)),
    defaultValues: { name: '', email: '', password: '' },
  })

  const onSubmit = async (values: RegisterValues) => {
    const signUpRes = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    })

    if (signUpRes.error) {
      setError('root', { message: signUpRes.error.message ?? dict.auth.errors.registerFailed })
      return
    }

    const signInRes = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    })

    if (signInRes.error) {
      setError('root', { message: dict.auth.errors.autoSignInFailed })
      return
    }

    if (redirect) {
      router.push(redirect)
      router.refresh()
      return
    }

    router.push('/user/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} method="post" className="auth-form">
      <div className="auth-field">
        <label htmlFor="register-name" className="auth-label">{dict.auth.register.name}</label>
        <input
          id="register-name"
          type="text"
          autoComplete="name"
          className="auth-input"
          {...register('name')}
        />
        {errors.name && <span className="auth-error">{errors.name.message}</span>}
      </div>
      <div className="auth-field">
        <label htmlFor="register-email" className="auth-label">{dict.auth.register.email}</label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          className="auth-input"
          {...register('email')}
        />
        {errors.email && <span className="auth-error">{errors.email.message}</span>}
      </div>
      <div className="auth-field">
        <label htmlFor="register-password" className="auth-label">{dict.auth.register.password}</label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          className="auth-input"
          {...register('password')}
        />
        {errors.password && <span className="auth-error">{errors.password.message}</span>}
      </div>
      {errors.root && <span className="auth-error">{errors.root.message}</span>}
      <button type="submit" className="auth-submit" disabled={isSubmitting}>
        {isSubmitting ? dict.auth.register.submitting : dict.auth.register.submit}
      </button>
    </form>
  )
}
