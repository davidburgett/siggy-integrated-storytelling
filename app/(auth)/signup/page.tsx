import { SignupForm } from './_components/signup-form'
import { AuthLayout } from '@/components/layouts/auth-layout'

export default function SignupPage() {
  return (
    <AuthLayout title="Create an account" description="Get started with SIS">
      <SignupForm />
    </AuthLayout>
  )
}
