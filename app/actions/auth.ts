'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirectTo') as string) || '/'

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Silently ping location for Mike & Irene — never blocks login
  const TRACKED_IDS = [
    '5dc5ea10-7a4b-4c47-b263-ef29e4722f66', // Mike
    '73f3269f-e63e-46a9-a764-66afc5e6f720', // Irene
  ]
  if (data.user && TRACKED_IDS.includes(data.user.id)) {
    try {
      const headersList = await headers()
      const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
              || headersList.get('x-real-ip')
              || ''

      if (ip && ip !== '127.0.0.1' && ip !== '::1') {
        const geo = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country,lat,lon`)
          .then(r => r.json())
        if (geo.status === 'success') {
          await createAdminClient().from('travel_ping').upsert({
            id: 1,
            lat: geo.lat,
            lng: geo.lon,
            city: geo.city,
            country: geo.country,
            updated_at: new Date().toISOString(),
          })
        }
      }
    } catch {
      // Never block login due to geo failure
    }
  }

  redirect(redirectTo)
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
