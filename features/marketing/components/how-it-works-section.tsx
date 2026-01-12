"use client"

import { useRef, useState, useEffect } from "react"
import { Mic, Cpu, Search, CheckCircle2, ArrowRight } from "lucide-react"

const steps = [
  {
    icon: Mic,
    number: "01",
    title: "Speak Naturally",
    description: "Just tap and talk. Ask anything the way you naturally would — no keywords, no special syntax needed.",
    detail: "Our advanced speech recognition handles accents, dialects, and natural pauses effortlessly.",
  },
  {
    icon: Cpu,
    number: "02",
    title: "AI Processes",
    description: "Our neural engine analyzes your voice in real-time, understanding context, intent, and nuance.",
    detail: "Multi-layer transformer models process your query in under 50ms with 99.2% accuracy.",
  },
  {
    icon: Search,
    number: "03",
    title: "Instant Results",
    description: "Receive precise, relevant answers instantly. Continue the conversation to refine your search.",
    detail: "Results are ranked by relevance, personalization, and real-time context awareness.",
  },
]

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)
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

  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden" ref={sectionRef}>
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div
            className={`inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">Simple by design</span>
          </div>

          <h2
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <span className="text-foreground">Three steps to </span>
            <span className="gradient-text">instant answers</span>
          </h2>
        </div>

        {/* Steps visualization */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-32 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-border/50 to-transparent hidden lg:block" />

          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`relative transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${200 + index * 150}ms` }}
                onMouseEnter={() => setActiveStep(index)}
              >
                {/* Card */}
                <div
                  className={`relative p-8 rounded-3xl transition-all duration-500 cursor-pointer ${
                    activeStep === index ? "glass glow-border bg-white/[0.05]" : "bg-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Step icon with animated ring */}
                  <div className="relative mb-8 flex justify-center">
                    {/* Outer ring */}
                    <div
                      className={`absolute w-24 h-24 rounded-full border transition-all duration-500 ${
                        activeStep === index ? "border-accent/30 scale-110" : "border-border/20 scale-100"
                      }`}
                    />

                    {/* Inner circle */}
                    <div
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                        activeStep === index
                          ? "bg-gradient-to-br from-accent to-glow-secondary shadow-lg shadow-accent/20"
                          : "bg-secondary/50"
                      }`}
                    >
                      <step.icon
                        className={`w-8 h-8 transition-colors duration-300 ${
                          activeStep === index ? "text-accent-foreground" : "text-foreground"
                        }`}
                      />
                    </div>

                    {/* Step number badge */}
                    <div
                      className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        activeStep === index ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{step.description}</p>

                    {/* Detail - shown on active */}
                    <div
                      className={`overflow-hidden transition-all duration-500 ${
                        activeStep === index ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="text-xs text-accent/80 glass rounded-lg px-4 py-2 inline-block">{step.detail}</p>
                    </div>
                  </div>

                  {/* Arrow to next step */}
                  {index < steps.length - 1 && (
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 hidden lg:block z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          activeStep === index
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary/50 text-muted-foreground"
                        }`}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom animation preview */}
        <div
          className={`mt-20 transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="relative max-w-2xl mx-auto">
            <div className="glass rounded-2xl p-6 overflow-hidden">
              {/* Animated flow visualization */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-sm">
                    <p className="text-foreground font-medium">Voice Input</p>
                    <p className="text-muted-foreground text-xs">Recording...</p>
                  </div>
                </div>

                {/* Animated dots */}
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-accent animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-right">
                    <p className="text-foreground font-medium">Processing</p>
                    <p className="text-muted-foreground text-xs">~50ms</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-glow-secondary/20 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-glow-secondary animate-pulse" />
                  </div>
                </div>

                {/* Animated dots */}
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-accent animate-bounce"
                      style={{ animationDelay: `${i * 150 + 300}ms` }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-right">
                    <p className="text-foreground font-medium">Results</p>
                    <p className="text-muted-foreground text-xs">Delivered</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
