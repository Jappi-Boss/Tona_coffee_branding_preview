import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/tona";

export function WhatsAppFab() {
  return (
    <a
      href={waLink("Hi Tona, I'd like to place an order.")}
      target="_blank"
      rel="noopener noreferrer"
      className="public-whatsapp fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 border border-primary bg-black px-5 py-3.5 text-xs font-semibold uppercase tracking-[.08em] text-white shadow-lg transition-colors hover:bg-primary hover:text-black"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Order on WhatsApp</span>
    </a>
  );
}
