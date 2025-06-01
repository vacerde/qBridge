import { Button } from "@/components/ui/button";
import { LandingHero } from "@/components/landing/hero";
import { LandingInstallation } from "@/components/landing/installation";
import { LandingFeatures } from "@/components/landing/features";
import { LandingDemo } from "@/components/landing/demo";
import { LandingPricing } from "@/components/landing/pricing";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHeader } from "@/components/landing/header";

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-hidden">
      <LandingHeader />
      <main className="">
        <LandingHero />
        <LandingInstallation />
        <LandingFeatures />
        <LandingDemo />
        <LandingPricing />
      </main>
      <LandingFooter />
    </div>
  );
}