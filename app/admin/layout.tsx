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
    // redirect() throws internally — rethrow those, catch real errors
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err
    console.error('[AdminLayout] unexpected error:', err)
    redirect('/')
  }
}
