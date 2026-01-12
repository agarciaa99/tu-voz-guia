import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowRight, Home } from "lucide-react"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="animate-fade-up">
      <div className="glass rounded-3xl p-8 glow-border text-center">
        {/* Error Icon */}
        <div className="mb-6 inline-flex">
          <div className="relative">
            <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-destructive to-destructive/70 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive-foreground" />
            </div>
          </div>
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold text-foreground mb-2">Authentication Error</h1>
        <p className="text-muted-foreground mb-4">Something went wrong during authentication.</p>

        {/* Error Details */}
        {params?.error && (
          <div className="mb-8 glass rounded-xl p-4 text-left">
            <p className="text-xs text-muted-foreground mb-1">Error code:</p>
            <p className="text-sm text-destructive font-mono">{params.error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            asChild
            className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 group relative overflow-hidden"
          >
            <Link href="/auth/login">
              <span className="relative z-10 flex items-center">
                Try again
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-glow-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full h-12 rounded-xl border-border/50 bg-white/5 hover:bg-white/10"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
