import { BUSINESS } from "@/lib/constants";

export default function AnnouncementBar() {
  const href = BUSINESS.whatsappWithMessage(BUSINESS.messages.whatsappDefault);

  return (
    <div className="flex h-10 items-center justify-center bg-(--color-primary) px-4 text-center">
      <p className="truncate font-body text-xs tracking-[0.01em] text-(--color-cream) sm:text-sm">
        <span className="hidden sm:inline">Flores frescas para cada ocasión. </span>
        <span className="sm:hidden">Flores frescas. </span>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer font-semibold underline underline-offset-2"
        >
          Pedir por WhatsApp
        </a>
      </p>
    </div>
  );
}
