"use client"

import { useEffect, useRef } from "react"

const logos = [
  { name: "Google", svg: "G" },
  { name: "Apple", svg: "" },
  { name: "Spotify", svg: "●●●" },
  { name: "Slack", svg: "#" },
  { name: "Notion", svg: "N" },
  { name: "Discord", svg: "🎮" },
  { name: "Figma", svg: "◈" },
  { name: "Linear", svg: "▬" },
]

export function LogoCloud() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    let scrollPosition = 0

    const animate = () => {
      scrollPosition += 0.5
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0
      }
      scrollContainer.scrollLeft = scrollPosition
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <section className="py-16 border-y border-border/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground mb-8">
          Trusted by teams at the world's most innovative companies
        </p>

        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

          <div ref={scrollRef} className="flex gap-12 overflow-hidden" style={{ scrollBehavior: "auto" }}>
            {[...logos, ...logos].map((logo, i) => (
              <div
                key={`${logo.name}-${i}`}
                className="flex-shrink-0 flex items-center justify-center w-32 h-12 text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors duration-300"
              >
                <span className="text-2xl font-bold tracking-tight">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
