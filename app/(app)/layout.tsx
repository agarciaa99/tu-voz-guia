import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/features/app/components/app-header"
import { SettingsProvider } from "@/lib/settings-context"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-background relative">
        {/* Background effects */}
        <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" aria-hidden="true" />
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/3 blur-[150px] rounded-full pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-glow-secondary/3 blur-[120px] rounded-full pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <AppHeader user={user} />
          <main className="pt-20" id="main-content">
            {children}
          </main>
        </div>
      </div>
    </SettingsProvider>
  )
}
