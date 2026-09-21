import { LoginForm } from './_components/login-form'
import { AuthLayout } from '@/components/layouts/auth-layout'

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" description="Sign in to the SIS writing environment">
      <LoginForm />
    </AuthLayout>
  )
}
