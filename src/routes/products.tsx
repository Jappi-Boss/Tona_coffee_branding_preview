import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { ProductCard } from "@/components/site/ProductCard";
import { waLink } from "@/lib/tona";
import { getPublicCatalog } from "@/lib/public-api";

export const Route = createFileRoute("/products")({
  loader: () => getPublicCatalog(),
  head: () => ({
    meta: [
      { title: "Tona Coffee Products — Yirgacheffe, Sidama, Guji & Gesha" },
      {
        name: "description",
        content:
          "Single-origin Ethiopian coffee from Yirgacheffe, Sidama, Guji and Gesha. Choose size and grind, then order instantly on WhatsApp.",
      },
      {
        property: "og:title",
        content: "Tona Coffee Products — Yirgacheffe, Sidama, Guji & Gesha",
      },
      {
        property: "og:description",
        content:
          "Single-origin Ethiopian coffee. Choose size and grind, order on WhatsApp.",
      },
    ],
  }),
  component: Products,
});

function Products() {
  const { products } = Route.useLoaderData();
  return (
    <>
      <PageHero
        eyebrow="Products"
        title={
          <>
            Pick your bag. We'll take it
            <br />
            from <span className="text-primary">the message.</span>
          </>
        }
        intro="Choose a size, grind and quantity, then send your order directly to Tona's team. Every published coffee and availability update comes from the admin dashboard."
      />

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>

          <p className="mt-12 text-center text-sm text-muted-foreground">
            Prefer not to use WhatsApp?{" "}
            <Link to="/contact" className="font-semibold text-primary">
              Send an order enquiry instead →
            </Link>
          </p>
        </div>
      </section>

      <section className="bg-teal py-20 text-teal-foreground">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            <div>
              <p className="label-mono text-teal-foreground/60">Formats</p>
              <h2 className="mt-4 font-display text-3xl font-bold">
                Whole bean, espresso or filter.
              </h2>
              <p className="mt-4 text-teal-foreground/75">
                Every origin is available in 250g, 500g and 1kg bags, ground to
                your brew method or left whole for maximum freshness.
              </p>
            </div>
            <div className="lg:col-span-2 grid gap-4 sm:grid-cols-3">
              {[
                {
                  t: "Whole Bean",
                  d: "Best for home grinders and cafés dialling in daily.",
                },
                {
                  t: "Espresso Grind",
                  d: "Fine and consistent for pressurised extraction.",
                },
                {
                  t: "Filter Grind",
                  d: "Medium grind for pour-over, batch brew and jebena.",
                },
              ].map((f) => (
                <div
                  key={f.t}
                  className="rounded-2xl border border-teal-foreground/15 p-6"
                >
                  <h3 className="text-lg font-bold">{f.t}</h3>
                  <p className="mt-2 text-sm text-teal-foreground/70">{f.d}</p>
                </div>
              ))}
            </div>
          </div>

          <a
            href={waLink(
              "Hi Tona, I'd like help choosing the right coffee and grind.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground"
          >
            <MessageCircle className="h-4 w-4" /> Ask us what to order
          </a>
        </div>
      </section>
    </>
  );
}
