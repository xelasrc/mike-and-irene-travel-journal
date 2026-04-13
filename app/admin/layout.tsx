import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login?redirect=/admin')

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('[AdminLayout] profile query error:', error.message)
      redirect('/')
    }

    if (profile?.role !== 'admin') redirect('/')

    return <>{children}</>
  } catch (err: unknown) {
    // Next.js uses thrown errors internally for redirects and dynamic rendering signals — always rethrow those
    const digest = (err as { digest?: string })?.digest
    if (typeof digest === 'string') throw err
    console.error('[AdminLayout] unexpected error:', err)
    redirect('/')
  }
}
