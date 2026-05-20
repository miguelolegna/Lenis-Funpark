import { StickyHeader } from '@/components/organisms/StickyHeader';
import { Footer } from '@/components/organisms/Footer';
import { HeroSection } from '@/features/reservas/HeroSection';
import { StatsSection } from '@/features/home/StatsSection';
import { FeaturesSection } from '@/features/home/FeaturesSection';
import { DigitalInviteSection } from '@/features/home/DigitalInviteSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <StickyHeader />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <DigitalInviteSection />
      </main>
      <Footer />
    </div>
  );
}
