"use client";

import { useRef, useState, useEffect } from "react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    quote:
      "Antes tardaba horas en comprar online porque los lectores de pantalla se trababan. Con esta app, encuentro y compro en minutos.",
    author: "Laura Gómez",
    role: "Programadora (Discapacidad visual)",
    avatar: "LG",
    rating: 5,
  },
  {
    quote:
      "Lo mejor es la función de 'Resumir'. Ya no tengo que escuchar menús interminables para llegar a la noticia que quiero.",
    author: "Miguel Ángel",
    role: "Usuario de lector de pantalla",
    avatar: "MA",
    rating: 5,
  },
  {
    quote:
      "Por fin puedo entender los memes y fotos en redes sociales. La descripción de imágenes por IA es un cambio radical.",
    author: "Sofía Ruiz",
    role: "Estudiante de Periodismo",
    avatar: "SR",
    rating: 5,
  },
  {
    quote:
      "La navegación por voz es tan fluida que a veces olvido que estoy navegando en una web compleja. Es pura accesibilidad.",
    author: "Dr. Jorge P.",
    role: "Consultor de Accesibilidad Digital",
    avatar: "JP",
    rating: 5,
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section className="relative py-32 overflow-hidden" ref={sectionRef}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-glow-secondary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className={`inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm mb-6 transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="text-muted-foreground">Amado por miles</span>
          </div>

          <h2
            className={`text-4xl sm:text-5xl font-bold tracking-tight transition-all duration-700 delay-100 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <span className="text-foreground">Lo que la gente </span>
            <span className="gradient-text">está diciendo</span>
          </h2>
        </div>

        {/* Testimonial carousel */}
        <div
          className={`relative max-w-4xl mx-auto transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Main testimonial */}
          <div className="relative glass rounded-3xl p-8 sm:p-12 glow-border">
            {/* Quote icon */}
            <div className="absolute top-8 left-8 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Quote className="w-6 h-6 text-accent" />
            </div>

            {/* Content */}
            <div className="pt-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.author}
                  className={`transition-all duration-500 ${
                    activeIndex === index
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-8 absolute inset-0 pointer-events-none"
                  }`}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-2xl sm:text-3xl font-medium text-foreground leading-relaxed mb-8">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-glow-secondary flex items-center justify-center text-accent-foreground font-semibold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="absolute bottom-8 right-8 flex gap-2">
              <button
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? "w-8 bg-accent"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Company logos */}
        <div
          className={`mt-20 transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by teams at world-class companies
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
            {["Figma", "Spotify", "Notion", "Linear", "Vercel", "Stripe"].map(
              (company) => (
                <span
                  key={company}
                  className="text-xl font-bold text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors"
                >
                  {company}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
