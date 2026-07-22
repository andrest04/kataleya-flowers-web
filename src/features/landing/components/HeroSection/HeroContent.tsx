import { BUSINESS } from "@/lib/constants";

import HeroButtons from "../HeroButtons";
import type { CampaignMode } from "./types";

interface HeroContentProps {
  readonly campaignMode: CampaignMode;
}

export default function HeroContent({ campaignMode }: HeroContentProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-end pb-10 sm:items-center sm:pb-0">
      <div className="w-full px-4 sm:px-10 lg:px-40">
        <div className="mx-auto max-w-xs space-y-3 text-center sm:mx-0 sm:max-w-md sm:space-y-5">
          <p className="flex items-center justify-center gap-3 font-heading text-base text-(--color-cream) italic sm:text-lg">
            <span
              className="h-px w-6 bg-(--color-cream)/70 sm:w-8"
              aria-hidden="true"
            />
            Florería premium en {BUSINESS.location}
            <span
              className="h-px w-6 bg-(--color-cream)/70 sm:w-8"
              aria-hidden="true"
            />
          </p>
          <h1 className="font-heading text-3xl leading-[1.05] text-balance text-(--color-cream) uppercase sm:text-5xl lg:text-6xl">
            Flores que emocionan
          </h1>
          <div className="pointer-events-auto flex justify-center pt-2">
            <HeroButtons campaignMode={campaignMode} />
          </div>
        </div>
      </div>
    </div>
  );
}
