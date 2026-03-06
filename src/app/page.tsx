import { requireSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await requireSession().catch(() => null);
  if (!session) redirect('/login');
  redirect('/dashboard');
}
