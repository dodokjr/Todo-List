import { notFound } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
export default function Page({ params, searchParams }: { params: { mode: string }; searchParams: { token?: string; email?: string } }) {
  if (!['login', 'register', 'forgot-password', 'reset-password'].includes(params.mode)) notFound();
  return <AuthForm mode={params.mode} token={searchParams.token} email={searchParams.email} />;
}
