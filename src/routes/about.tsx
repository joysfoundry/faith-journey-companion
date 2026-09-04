import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Oravia" },
      {
        name: "description",
        content:
          "What Oravia is, the vision behind it, why it's a beta, and how your data stays on your device.",
      },
      { property: "og:title", content: "About — Oravia" },
      {
        property: "og:description",
        content:
          "A personal faith companion — prayer, Scripture, learning, reflection, and lived experience, brought into everyday life.",
      },
    ],
  }),
  component: AboutPage,
});

/**
 * About — a short, warm description of the app for beta testers: the vision (the
 * whole faith journey, not just prayer), why it's more than a prayer app, why
 * it's a beta, and the local-only data model. Copy drawn from the vision PRD
 * (`docs/ACTS-PRD.md`). The app name is "Oravia" (ACTS-144 rebrand).
 */
function AboutPage() {
  return (
    <AppShell title="About" subtitle="What this is, and why it's here">
      <div className="mx-auto max-w-prose space-y-8 pb-4">
        <p className="text-center font-display text-xl italic leading-snug text-foreground">
          God is weaving something beautiful through your life.
        </p>
        <p className="border-l-2 border-primary/40 pl-4 font-display text-base italic leading-relaxed text-foreground">
          A daily place where prayer, Scripture, learning, reflection, and lived experience
          become meaningful woven threads of how I am trying to live my faith, discern
          God&rsquo;s will, and live my purpose.
        </p>

        <section className="space-y-2">
          <h2 className="font-display text-lg text-foreground">The vision</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Oravia is a personal faith companion for the whole of your faith journey — helping
            you bring prayer, Scripture, learning, reflection, and lived experience into the
            rhythms and needs of everyday life. The heart of it is a question:{" "}
            <span className="italic text-foreground">
              How am I becoming the person God is calling me to be, and how am I living my
              purpose in alignment with God&rsquo;s will?
            </span>{" "}
            It&rsquo;s meant to help you deepen your relationship with God — drawing on
            Scripture and the tradition of the Church — in a way that feels deeply personal
            and honors how you were formed. It may support discernment, but it never claims to
            know God&rsquo;s will for you; you discern the meaning.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg text-foreground">More than a prayer app</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A person&rsquo;s faith journey is shaped not only by prayer, but by what they
            read, watch, hear, experience, question, and reflect on. Oravia captures that faith
            learning alongside prayer and lived experience so that, over time, you can make
            connections — turning what you encounter into reflection, and eventually
            recognizing insights and carrying forward wisdom that can support discernment and
            action.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg text-foreground">One place for your journey</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Today the pieces of a faith life live in a dozen scattered places, on paper and
            across apps — a Rosary pamphlet, a hymnal, a Bible, a saint-of-the-day site, a
            family novena someone texted you. Oravia gathers them into one companion, compiling
            a devotion into a guided flow — the right day, the right mysteries and readings,
            reflection as a first-class step, a way to sing, and a follow link so others can
            pray along — so the tool disappears and the prayer stays.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            It&rsquo;s a hub, not a walled garden. Link out to how you already pray — Hallow,
            Bible in a Year, a catechism program — keep your journaling right alongside your
            prayer, and gather the resources that inspire you and shape your learning, whether
            they&rsquo;re digital or on paper.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg text-foreground">Why a beta</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This is an early, private beta. It&rsquo;s still taking shape — things will
            change, and some may break. Your feedback is what shapes it. Thank you for praying
            with it while it grows.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg text-foreground">Everything stays with you</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your prayers, reflections, and settings live on this device, in this browser —
            there&rsquo;s no account, no email, and nothing is sent to a server. That also
            means they don&rsquo;t sync across devices yet, and clearing your browser data (or{" "}
            <Link to="/settings" className="text-primary hover:underline">
              Settings → Start over
            </Link>
            ) will erase them.
          </p>
        </section>

        <p className="pt-2 text-center font-display text-lg italic text-primary">
          Keep your seeking for God.
        </p>
      </div>
    </AppShell>
  );
}
