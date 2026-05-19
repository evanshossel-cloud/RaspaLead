import { EnrichmentSection } from "@/components/marketing/enrichment-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { FeatureCardsSection } from "@/components/marketing/feature-cards-section";
import { FinalCtaSection } from "@/components/marketing/final-cta-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { PricingPreviewSection } from "@/components/marketing/pricing-preview-section";
import { StatsSection } from "@/components/marketing/stats-section";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fff8dc] text-black">
      <MarketingHeader />
      <HeroSection />
      <StatsSection />
      <FeatureCardsSection />
      <HowItWorksSection />
      <EnrichmentSection />
      <PricingPreviewSection />
      <FaqSection />
      <FinalCtaSection />
      <MarketingFooter />
    </main>
  );
}
