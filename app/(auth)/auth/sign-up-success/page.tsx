import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail, ArrowRight, CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="animate-fade-up">
      <div className="glass rounded-3xl p-8 glow-border text-center">
        {/* Success Icon */}
        <div className="mb-6 inline-flex">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-accent to-glow-secondary flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-accent-foreground" />
            </div>
          </div>
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold text-foreground mb-2">Check your email</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          We've sent you a confirmation link. Please check your email to verify your account.
        </p>

        {/* Email Icon */}
        <div className="mb-8 flex justify-center">
          <div className="glass rounded-2xl p-6 inline-flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-accent" />
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Confirmation email sent</p>
              <p className="text-foreground font-medium">Check your inbox</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button
            asChild
            className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 group relative overflow-hidden"
          >
            <Link href="/auth/login">
              <span className="relative z-10 flex items-center">
                Go to login
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-glow-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          </Button>

          <p className="text-xs text-muted-foreground">
            Didn't receive the email?{" "}
            <Link href="/auth/sign-up" className="text-accent hover:text-accent/80 transition-colors">
              Try again
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
