import { CAMPAIGN_MODE } from "./constants";
import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative isolate h-[585px] overflow-hidden"
    >
      <HeroBackground />
      <HeroContent campaignMode={CAMPAIGN_MODE} />
    </section>
  );
}
