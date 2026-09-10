import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/tona";

export function WhatsAppFab() {
  return (
    <a
      href={waLink("Hi Tona, I'd like to place an order.")}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Order on WhatsApp</span>
    </a>
  );
}
