import { Header } from "@/features/marketing/components/header";
import { HeroSection } from "@/features/marketing/components/hero-section";
import { LogoCloud } from "@/features/marketing/components/logo-cloud";
import { FeaturesSection } from "@/features/marketing/components/features-section";
import { ShowcaseSection } from "@/features/marketing/components/showcase-section";
import { HowItWorksSection } from "@/features/marketing/components/how-it-works-section";
import { TestimonialsSection } from "@/features/marketing/components/testimonials-section";
import { CtaSection } from "@/features/marketing/components/cta-section";
import { Footer } from "@/features/marketing/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-glow-secondary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        <Header />
        <HeroSection />
        {/* <LogoCloud /> */}
        <FeaturesSection />
        <ShowcaseSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CtaSection />
        <Footer />
      </div>
    </main>
  );
}
