import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { ABOUT_PRODUCT_IMAGE } from "@/lib/about-product-image";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Tona Coffee — Rooted in Ethiopian Coffee Culture" },
      {
        name: "description",
        content:
          "Tona Coffee is an African-led specialty roaster rooted in Ethiopia's coffee heartlands — origin, quality, culture and connection in every cup.",
      },
      { property: "og:title", content: "About Tona Coffee — Rooted in Ethiopian Coffee Culture" },
      {
        property: "og:description",
        content:
          "An African-led specialty roaster inspired by the second round of the Ethiopian coffee ceremony.",
      },
    ],
  }),
  component: About,
});

const MOMENTS = [
  { who: "For Friends", text: "Staying for another conversation." },
  { who: "For Colleagues", text: "Taking a discussion beyond the agenda." },
  { who: "For Partners", text: "Creating space for ideas and decisions." },
  { who: "For Families", text: "Sharing time together." },
  { who: "For Yourself", text: "Having a moment to think." },
];

const FLOW = [
  "A conversation develops",
  "An idea takes shape",
  "People become more open",
  "A connection becomes stronger",
];

function About() {
  return (
    <>
      <PageHero
        eyebrow="About Tona"
        title={
          <>
            Some conversations
            <br />
            need <span className="text-primary">more time.</span>
          </>
        }
        intro="Born from Ethiopia's coffee culture and inspired by the second round of the coffee ceremony, Tona Coffee is an African-led specialty roaster rooted in Ethiopia's coffee heartlands."
      />

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <img
            src={ABOUT_PRODUCT_IMAGE}
            alt="Tona Coffee front and back product packaging in an Ethiopian coffee setting"
            loading="eager"
            decoding="async"
            className="block h-auto w-full rounded-[2rem] object-cover"
          />
          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>
              The first cup brings people together. The second round is where the conversation
              changes — formalities fade, ideas become deeper, people listen, question, laugh,
              reflect and connect. Sometimes the conversation reaches a point where everyone wants
              to stay a little longer. This is where Tona belongs.
            </p>
            <p>It is about more than the coffee in the cup. It is about what happens around the cup.</p>
            <p>
              Our work brings together four things: where the coffee begins, how carefully it is
              selected and roasted, the traditions and hospitality that surround it, and the
              conversations that happen around every cup.
            </p>
            <p className="border-l-2 border-primary pl-5 font-display text-2xl font-semibold text-foreground">
              “The coffee creates the pause. The moment creates the meaning.”
            </p>
          </div>
        </div>
      </section>

      <section className="bg-sand py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="font-display text-4xl font-bold sm:text-5xl">A moment for everyone.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {MOMENTS.map((m) => (
              <div key={m.who} className="rounded-2xl border border-border bg-card p-6">
                <p className="label-mono text-primary">{m.who}</p>
                <p className="mt-3 text-sm text-muted-foreground">{m.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((step, i) => (
              <div key={step} className="rounded-2xl bg-card p-6">
                <span className="label-mono text-muted-foreground">0{i + 1}</span>
                <p className="mt-3 font-display text-lg font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-teal py-20 text-teal-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="label-mono text-teal-foreground/60">Vision</p>
            <p className="mt-4 text-xl leading-relaxed">
              To see African coffee recognized globally for excellence, while creating value for
              communities and inspiring cultural pride.
            </p>
          </div>
          <div>
            <p className="label-mono text-teal-foreground/60">Mission</p>
            <p className="mt-4 text-xl leading-relaxed">
              We source responsibly, roast carefully, and create meaningful coffee experiences that
              connect people with Ethiopian coffee, culture and origin.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Taste the origins behind the story.
          </h2>
          <Link
            to="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground"
          >
            Explore our coffee <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
