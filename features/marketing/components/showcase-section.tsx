"use client"

import { useRef, useState, useEffect } from "react"
import { Play, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const showcaseItems = [
  {
    category: "Search",
    title: "Find anything instantly",
    description: "Just speak and watch results appear in real-time as you talk.",
    query: '"Show me Italian restaurants with outdoor seating"',
    image: "/modern-search-interface-dark-ui.jpg",
  },
  {
    category: "Navigate",
    title: "Hands-free navigation",
    description: "Control your entire device with natural voice commands.",
    query: '"Open my calendar and schedule a meeting for tomorrow"',
    image: "/voice-navigation-dark-interface.jpg",
  },
  {
    category: "Create",
    title: "Voice-to-action",
    description: "Compose emails, set reminders, and create documents by speaking.",
    query: '"Draft an email to the team about the project update"',
    image: "/voice-assistant-creating-document-dark.jpg",
  },
]

export function ShowcaseSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % showcaseItems.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="showcase" className="relative py-32 overflow-hidden" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div
              className={`inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <Play className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">See it in action</span>
            </div>

            <h2
              className={`text-4xl sm:text-5xl font-bold tracking-tight transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <span className="text-foreground">Experience </span>
              <span className="gradient-text">seamless</span>
              <br />
              <span className="text-foreground">voice interactions</span>
            </h2>
          </div>

          <div
            className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Button
              variant="outline"
              className="group rounded-full border-border/50 hover:border-accent/50 bg-transparent"
            >
              View all demos
              <ArrowUpRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          </div>
        </div>

        {/* Showcase content */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Tabs */}
          <div
            className={`space-y-4 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
          >
            {showcaseItems.map((item, index) => (
              <button
                key={item.title}
                onClick={() => setActiveIndex(index)}
                className={`w-full text-left p-6 rounded-2xl transition-all duration-500 ${
                  activeIndex === index
                    ? "glass border-accent/30 bg-white/[0.05]"
                    : "bg-transparent hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Progress indicator */}
                  <div className="relative w-1 h-16 rounded-full bg-border/30 overflow-hidden">
                    {activeIndex === index && (
                      <div
                        className="absolute top-0 left-0 w-full bg-gradient-to-b from-accent to-glow-secondary animate-[grow_5s_linear]"
                        style={{ height: "100%" }}
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <span
                      className={`text-xs uppercase tracking-wider ${activeIndex === index ? "text-accent" : "text-muted-foreground"}`}
                    >
                      {item.category}
                    </span>
                    <h3
                      className={`text-xl font-semibold mt-1 ${activeIndex === index ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">{item.description}</p>

                    {activeIndex === index && (
                      <div className="mt-4 glass rounded-lg px-4 py-2 inline-block">
                        <code className="text-sm text-accent">{item.query}</code>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Visual */}
          <div
            className={`relative transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden glass glow-border">
              {/* Glow behind */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-glow-secondary/10" />

              {/* Image */}
              <div className="absolute inset-4 rounded-2xl overflow-hidden bg-secondary/50">
                {showcaseItems.map((item, index) => (
                  <img
                    key={item.title}
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                      activeIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-105"
                    }`}
                  />
                ))}
              </div>

              {/* Floating UI elements */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm text-foreground">Listening...</span>
                  <div className="flex-1 flex items-center justify-center gap-1">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-0.5 bg-accent/60 rounded-full animate-wave-bar"
                        style={{
                          height: `${8 + Math.random() * 16}px`,
                          animationDelay: `${i * 50}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-glow-secondary/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes grow {
          from {
            height: 0%;
          }
          to {
            height: 100%;
          }
        }
      `}</style>
    </section>
  )
}
