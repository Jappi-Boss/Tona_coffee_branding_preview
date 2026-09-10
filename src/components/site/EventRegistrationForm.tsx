import { type FormEvent, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarCheck, Users, X } from "lucide-react";
import { toast } from "sonner";
import { submitEventRegistration, type PublicEvent } from "@/lib/public-api";

type EventRegistrationFormProps = {
  events: PublicEvent[];
  defaultEvent: PublicEvent;
  onSubmitted?: () => void;
};

export function EventRegistrationForm({
  events,
  defaultEvent,
  onSubmitted,
}: EventRegistrationFormProps) {
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await submitEventRegistration({
        data: {
          eventId: String(form.get("event")),
          fullName: String(form.get("name")),
          phone: String(form.get("phone")),
          email: nullable(form.get("email")),
          guestCount: Number(form.get("guests")),
          notes: nullable(form.get("note")),
        },
      });
      toast.success("Registration received. Tona will confirm your place.");
      onSubmitted?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to register right now.",
      );
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-2 w-full border border-[#e4d4ba]/45 bg-[#fff9ef] px-4 py-3 text-sm text-[#151411] outline-none transition placeholder:text-[#151411]/45 focus:border-[#ffb000] focus:ring-1 focus:ring-[#ffb000]";

  return (
    <form
      onSubmit={handleSubmit}
      className="event-registration-form text-[#fffdf8]"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold sm:col-span-2">
          Choose an event
          <select
            name="event"
            required
            className={inputClass}
            defaultValue={defaultEvent.id}
          >
            {events.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title} — {formatEventDate(option.eventDate)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Full name
          <input
            name="name"
            required
            autoComplete="name"
            className={inputClass}
            placeholder="Your name"
          />
        </label>
        <label className="text-sm font-semibold">
          Phone / WhatsApp
          <input
            name="phone"
            required
            type="tel"
            autoComplete="tel"
            className={inputClass}
            placeholder="+251 ..."
          />
        </label>
        <label className="text-sm font-semibold">
          Email{" "}
          <span className="font-normal text-[#fffdf8]/55">(optional)</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            placeholder="you@example.com"
          />
        </label>
        <label className="text-sm font-semibold">
          Number of guests
          <input
            name="guests"
            required
            type="number"
            min="1"
            max="10"
            defaultValue="1"
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Note{" "}
          <span className="font-normal text-[#fffdf8]/55">(optional)</span>
          <textarea
            name="note"
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Accessibility, group, or event questions"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="brand-button mt-5 inline-flex w-full items-center justify-center gap-2 bg-[#ef4a28] px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-[#ffb000] hover:text-[#151411] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Submitting…" : "Register to attend"}
        <CalendarCheck className="h-4 w-4" />
      </button>
      <p className="mt-3 text-center text-xs text-[#fffdf8]/55">
        Registration is confirmed by the Tona team.
      </p>
    </form>
  );
}

export function EventRegistrationDialog({
  event,
  events,
  className,
}: {
  event: PublicEvent;
  events: PublicEvent[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={
            className ??
            "inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          }
        >
          <CalendarCheck className="h-4 w-4" /> Register to attend
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-[#090908]/80 backdrop-blur-md data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="event-dialog order-dialog fixed left-1/2 top-1/2 z-[110] max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-[#e4d4ba]/35 bg-[#061b18] p-6 text-[#fffdf8] shadow-2xl focus:outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 sm:p-8">
          <div className="flex items-start justify-between gap-5 pr-8">
            <div>
              <p className="label-mono text-primary">Reserve your place</p>
              <Dialog.Title className="mt-3 font-display text-3xl font-black uppercase leading-none text-[#fffdf8] sm:text-4xl">
                Event registration
              </Dialog.Title>
              <Dialog.Description className="mt-3 max-w-lg text-sm leading-relaxed text-[#fffdf8]/65">
                Enter your details below. Your selected event is already filled
                in, and your registration will appear in Tona's dashboard.
              </Dialog.Description>
            </div>
            <span className="hidden border border-[#e4d4ba]/35 bg-[#e4d4ba] p-3 text-[#151411] sm:block">
              <Users className="h-5 w-5" />
            </span>
          </div>

          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close registration form"
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center border border-[#e4d4ba]/35 bg-[#e4d4ba] text-[#151411] transition-colors hover:border-[#ffb000] hover:bg-[#ffb000]"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>

          <div className="mt-7">
            <EventRegistrationForm
              events={events}
              defaultEvent={event}
              onSubmitted={() => setOpen(false)}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function nullable(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function formatEventDate(value: string) {
  return new Date(value).toLocaleDateString("en-ET", {
    month: "short",
    day: "numeric",
    timeZone: "Africa/Addis_Ababa",
  });
}
