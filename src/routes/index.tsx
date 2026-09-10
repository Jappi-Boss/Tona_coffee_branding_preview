import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  MessageCircle,
  Leaf,
  Coffee,
  Users,
  Mountain,
  Clock,
  MapPin,
} from "lucide-react";
import {
  beansImage as beansImg,
  heroCeremonyImage as heroImg,
} from "@/lib/site-images";
import { waLink } from "@/lib/tona";
import { PRODUCT_IMAGES } from "@/lib/product-images";
import { EventRegistrationDialog } from "@/components/site/EventRegistrationForm";
import { getPublicCatalog } from "@/lib/public-api";

export const Route = createFileRoute("/")({
  loader: () => getPublicCatalog(),
  head: () => ({
    meta: [
      { title: "Tona Coffee — Stay for Tona, Stay for the Moment" },
      {
        name: "description",
        content:
          "African-led Ethiopian specialty coffee roaster. Yirgacheffe, Sidama, Guji and Gesha — order retail bags or wholesale supply on WhatsApp.",
      },
      {
        property: "og:title",
        content: "Tona Coffee — Stay for Tona, Stay for the Moment",
      },
      {
        property: "og:description",
        content:
          "African-led Ethiopian specialty coffee roaster. Yirgacheffe, Sidama, Guji and Gesha — order on WhatsApp.",
      },
    ],
  }),
  component: Home,
});

const PILLARS = [
  {
    icon: Mountain,
    title: "Origin",
    text: "Ethiopian coffee, and the places where it begins.",
  },
  {
    icon: Coffee,
    title: "Quality",
    text: "Careful selection and roasting for a distinctive cup.",
  },
  {
    icon: Leaf,
    title: "Culture",
    text: "The traditions and hospitality of Ethiopian coffee.",
  },
  {
    icon: Users,
    title: "Connection",
    text: "The conversations that happen around every cup.",
  },
];

function Home() {
  const { products, events } = Route.useLoaderData();
  const upcomingEvent = events[0];
  return (
    <>
      {/* HERO */}
      <section className="relative isolate min-h-[620px] overflow-hidden bg-black text-white sm:min-h-[680px] lg:min-h-[760px]">
        <img
          src={heroImg}
          alt="Tona Coffee specialty coffee packaging with roasted coffee beans"
          width={1536}
          height={864}
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-right"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/80 via-[42%] to-black/5" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

        <div className="mx-auto flex min-h-[620px] max-w-7xl items-center px-5 py-16 sm:min-h-[680px] lg:min-h-[760px] lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl font-black uppercase leading-[.9] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              Stay for Tona.
              <br />
              <span className="text-primary">Stay for the moment.</span>
            </h1>
            <div className="mt-7 h-1 w-14 bg-primary" />
            <p className="mt-7 max-w-xl text-base leading-8 text-white/85 sm:text-lg">
              Ethiopian coffee is more than a drink—it&apos;s culture,
              connection, and centuries of tradition in every cup. From our
              farms to your table, we bring you specialty coffee that tells a
              story worth sharing.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="brand-button inline-flex items-center gap-2 bg-primary px-7 py-4 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Explore Our Coffee <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={waLink("Hi Tona, I'd like to place an order.")}
                target="_blank"
                rel="noopener noreferrer"
                className="brand-button inline-flex items-center gap-2 border border-primary px-7 py-4 text-sm font-bold text-white transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <MessageCircle className="h-4 w-4" /> Order on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="bg-sand py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="label-mono text-primary">Upcoming events</p>
              <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold text-foreground sm:text-5xl">
                Coffee tastes better when the moment is shared.
              </h2>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              View all events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {upcomingEvent ? (
            <article className="grid overflow-hidden rounded-3xl border border-border bg-card md:grid-cols-[220px_1fr]">
              <div className="leaf-field flex min-h-56 flex-col justify-between bg-teal p-6 text-teal-foreground">
                <div>
                  <p className="label-mono text-teal-foreground/60">
                    {new Date(upcomingEvent.eventDate).toLocaleDateString(
                      "en-ET",
                      {
                        month: "long",
                        timeZone: "Africa/Addis_Ababa",
                      },
                    )}
                  </p>
                  <p className="font-display text-6xl font-bold">
                    {new Date(upcomingEvent.eventDate).toLocaleDateString(
                      "en-ET",
                      {
                        day: "2-digit",
                        timeZone: "Africa/Addis_Ababa",
                      },
                    )}
                  </p>
                </div>
                <p className="flex items-center gap-2 text-sm text-teal-foreground/80">
                  <MapPin className="h-4 w-4 text-primary" />{" "}
                  {upcomingEvent.location}
                </p>
              </div>

              <div className="p-6 sm:p-8">
                <h3 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                  {upcomingEvent.title}
                </h3>
                <p className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />{" "}
                    {new Date(upcomingEvent.eventDate).toLocaleTimeString(
                      "en-ET",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone: "Africa/Addis_Ababa",
                      },
                    )}
                  </span>
                  <span>Open to the public</span>
                </p>
                <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                  {upcomingEvent.summary || upcomingEvent.description}
                </p>
                {upcomingEvent.registrationOpen && (
                  <div className="mt-6">
                    <EventRegistrationDialog
                      event={upcomingEvent}
                      events={events.filter((event) => event.registrationOpen)}
                    />
                  </div>
                )}
              </div>
            </article>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
              New events will appear here as soon as Tona publishes them.
            </div>
          )}
        </div>
      </section>

      {/* PILLARS */}
      <section className="bg-sand py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label-mono text-primary">What we build on</p>
              <h2 className="mt-3 max-w-xl font-display text-4xl font-bold sm:text-5xl">
                An African-led roaster, rooted in origin.
              </h2>
            </div>
            <p className="max-w-md text-muted-foreground">
              Tona Coffee sources, roasts and builds coffee experiences inspired
              by Ethiopian coffee culture — from the coffee heartlands to the
              cup in front of you.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p, i) => (
              <div
                key={p.title}
                className="border border-border bg-card p-6 transition-transform hover:-translate-y-1 hover:border-primary"
              >
                <p className="label-mono text-muted-foreground">0{i + 1}</p>
                <p.icon className="mt-5 h-7 w-7 text-primary" />
                <h3 className="mt-4 text-xl font-bold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS TEASER */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-xl font-display text-4xl font-bold sm:text-5xl">
              Four origins, one standard.
            </h2>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 font-semibold text-primary"
            >
              See all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <Link
                key={p.slug}
                to="/products"
                className="group overflow-hidden border border-border bg-card p-3 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
              >
                <div className="overflow-hidden rounded-xl bg-muted">
                  <img
                    src={
                      p.imageUrl ??
                      PRODUCT_IMAGES[p.slug as keyof typeof PRODUCT_IMAGES]
                    }
                    alt={`${p.name} black coffee with roasted coffee beans`}
                    width={720}
                    height={360}
                    loading="lazy"
                    className="aspect-[2/1] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="px-3 pb-3">
                  <h3 className="mt-5 text-2xl font-bold group-hover:text-primary">
                    {p.name}
                  </h3>
                  <p className="label-mono mt-2 text-muted-foreground">
                    {p.process}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {p.tastingNotes.join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TEAL TRUST BAND */}
      <section className="bg-teal py-20 text-teal-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <img
            src={beansImg}
            alt="Freshly roasted Ethiopian coffee beans with a green coffee leaf"
            width={1400}
            height={900}
            loading="lazy"
            className="rounded-3xl object-cover"
          />
          <div>
            <p className="label-mono text-teal-foreground/60">
              Why partners choose Tona
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
              Long-term partnerships, not one-time orders.
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Traceable Ethiopian origins",
                "Consistent roast profiles",
                "Samples before you commit",
                "Brewing & barista guidance",
                "Retail-ready packaging",
                "Origin storytelling support",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-teal-foreground/85"
                >
                  <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/for-business"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground"
              >
                Request a sample <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={waLink(
                  "Hi Tona, I'd like to discuss a wholesale partnership.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-teal-foreground/35 px-6 py-3.5 text-sm font-semibold"
              >
                <MessageCircle className="h-4 w-4" /> Business WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <p className="label-mono text-primary">The Tona moment</p>
          <p className="mt-5 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            “The coffee creates the pause. The moment creates the meaning.”
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold text-background"
            >
              Read our story
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-semibold"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
