import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, MapPin, Clock, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { EventRegistrationDialog } from "@/components/site/EventRegistrationForm";
import { EVENTS_PRODUCT_IMAGE } from "@/lib/events-product-image";
import { waLink } from "@/lib/tona";
import { getPublicCatalog } from "@/lib/public-api";

export const Route = createFileRoute("/events")({
  loader: () => getPublicCatalog(),
  head: () => ({
    meta: [
      { title: "Events — Tona Coffee Tastings & Ceremony Experiences" },
      {
        name: "description",
        content:
          "Join Tona Coffee for Ethiopian coffee ceremony tastings, pop-ups and cuppings in Addis Ababa — or host a Tona coffee experience at your own event.",
      },
      {
        property: "og:title",
        content: "Events — Tona Coffee Tastings & Ceremony Experiences",
      },
      {
        property: "og:description",
        content:
          "Coffee ceremony tastings, pop-ups and cuppings — plus Tona coffee experiences hosted at your event.",
      },
    ],
  }),
  component: Events,
});

const HOSTED = [
  {
    t: "Coffee ceremony experience",
    d: "A trained host, jebena service and origin storytelling for your guests.",
  },
  {
    t: "Brew bar & sampling",
    d: "Filter and espresso service for launches, conferences and markets.",
  },
  {
    t: "Co-branded activation",
    d: "Custom bags, signage and tasting flights built around your brand.",
  },
];

function Events() {
  const { events } = Route.useLoaderData();
  return (
    <>
      <PageHero
        eyebrow="Events"
        title={
          <>
            Meet us <span className="text-primary">in person.</span>
          </>
        }
        intro="Tastings, pop-ups and coffee-ceremony demonstrations across Addis Ababa — plus Tona experiences hosted at your own event."
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-6">
            {events.map((event) => {
              const date = new Date(event.eventDate);
              const isFull =
                event.capacity != null &&
                event.registrationCount >= event.capacity;
              return (
                <article
                  key={event.id}
                  className="grid overflow-hidden rounded-3xl border border-border md:grid-cols-[220px_1fr]"
                >
                  <div className="leaf-field flex flex-col justify-between bg-teal p-6 text-teal-foreground">
                    <div>
                      <p className="label-mono text-teal-foreground/60">
                        {date.toLocaleDateString("en-ET", {
                          month: "long",
                          timeZone: "Africa/Addis_Ababa",
                        })}
                      </p>
                      <p className="font-display text-6xl font-bold">
                        {date.toLocaleDateString("en-ET", {
                          day: "2-digit",
                          timeZone: "Africa/Addis_Ababa",
                        })}
                      </p>
                    </div>
                    <p className="mt-6 flex items-center gap-2 text-sm text-teal-foreground/80">
                      <MapPin className="h-4 w-4 text-primary" />{" "}
                      {event.location}
                    </p>
                  </div>
                  <div className="p-6 sm:p-8">
                    <h2 className="font-display text-2xl font-bold sm:text-3xl">
                      {event.title}
                    </h2>
                    <p className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary" />{" "}
                        {date.toLocaleTimeString("en-ET", {
                          hour: "numeric",
                          minute: "2-digit",
                          timeZone: "Africa/Addis_Ababa",
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-primary" /> Open
                        to the public
                      </span>
                    </p>
                    <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                      {event.summary || event.description}
                    </p>
                    {event.registrationOpen && !isFull ? (
                      <EventRegistrationDialog
                        event={event}
                        events={events.filter((item) => item.registrationOpen)}
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                      />
                    ) : (
                      <span className="mt-6 inline-flex rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-muted-foreground">
                        {isFull ? "Event full" : "Registration closed"}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-sand py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <img
            src={EVENTS_PRODUCT_IMAGE}
            alt="Tona Coffee product display with coffee packs, branded cups, roasted beans and traditional coffee service"
            width={500}
            height={333}
            loading="lazy"
            decoding="async"
            className="w-full rounded-3xl object-cover"
          />
          <div>
            <p className="label-mono text-primary">Host Tona</p>
            <h2 className="mt-3 font-display text-4xl font-bold">
              Bring the second round to your event.
            </h2>
            <div className="mt-8 space-y-4">
              {HOSTED.map((h) => (
                <div
                  key={h.t}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <h3 className="text-lg font-bold">{h.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{h.d}</p>
                </div>
              ))}
            </div>
            <a
              href={waLink(
                "Hi Tona, I'd like to host a Tona coffee experience at our event.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4" /> Enquire about hosting
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
