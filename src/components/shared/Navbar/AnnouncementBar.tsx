import { BUSINESS } from "@/lib/constants";

interface AnnouncementBarProps {
  isHidden: boolean;
}

export default function AnnouncementBar({ isHidden }: AnnouncementBarProps) {
  const href = BUSINESS.whatsappWithMessage(BUSINESS.messages.whatsappDefault);

  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-(--color-primary) px-4 text-center transition-[height] duration-300 ease-out motion-reduce:transition-none ${
        isHidden ? "h-0" : "h-10"
      }`}
    >
      <p className="font-body text-sm tracking-[0.01em] text-(--color-cream)">
        Flores frescas para cada ocasión.{" "}
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
