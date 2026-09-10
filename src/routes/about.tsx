import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Oravia" },
      {
        name: "description",
        content:
          "A daily place where prayer, Scripture, learning, reflection, and lived experience become meaningful woven threads of how I am trying to live my faith, discern God’s will, and live my purpose.",
      },
      { property: "og:title", content: "About — Oravia" },
      {
        property: "og:description",
        content:
          "A daily place where prayer, Scripture, learning, reflection, and lived experience become meaningful woven threads of how I am trying to live my faith, discern God’s will, and live my purpose.",
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
            Prayer takes more than one shape — some days your own words, some days a devotion
            you were taught and have prayed the same way for years. Oravia honors both. Today
            those prayers are scattered across paper and apps; digitized here, they live in one
            place, so you can customize a devotion the way you, your family, or your parish
            pray it: your prayers, in your order, with your intentions.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Build it once and it&rsquo;s there every time — no flipping, nothing to lose. Each
            devotion compiles into a guided flow — the right day, the right mysteries and
            readings, reflection as a first-class step, and a way to sing — so the tool
            disappears and the prayer stays.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            And it can be shared, so others pray it right alongside you: anyone still learning
            has the words in front of them, in order, free to stay in the prayer instead of
            wondering what comes next.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg text-foreground">One place for your journey</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A faith journey is shaped not only by prayer, but by what you read, watch, hear,
            experience, question, and reflect on. Oravia gathers that learning alongside your
            prayer and lived experience — the books and podcasts, the apps you already use, the
            voices that inspire you — so that over time you can make connections and carry
            forward what supports discernment and action.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            It&rsquo;s a hub, not a walled garden: link out to how you already pray — Hallow,
            Bible in a Year, a catechism program — and gather what shapes your learning,
            whether digital or on paper. Having it in one place is not only for you. When
            someone asks what you&rsquo;re reading, or praying, or working through, it&rsquo;s
            right there to hand on — and the people walking with you are part of your journey
            too.
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
            there&rsquo;s no account and no email, and nothing leaves this device unless you
            send it: a share link, an export, or feedback. That also
            means they don&rsquo;t sync across devices yet, and clearing your browser data (or{" "}
            <Link to="/settings" className="text-primary hover:underline">
              Settings → Start over
            </Link>
            ) will erase them.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg text-foreground">A note on the name</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Oravia comes from the Latin <span className="italic">ora</span> — &ldquo;pray&rdquo; —
            and <span className="italic">via</span> — &ldquo;the way&rdquo;: prayer, accompanying
            us along the way. It also opens with an <span className="text-foreground">O</span> and
            closes with an <span className="text-foreground">A</span> — Omega and Alpha, the End
            and the Beginning, an ancient name for Christ. We so often meet God at the end
            first — in the questions, in the place we actually are — and find He was the beginning
            all along. He holds both ends of your thread.
          </p>
        </section>

        <p className="pt-2 text-center font-display text-lg italic text-primary">
          Keep your seeking for God.
        </p>
      </div>
    </AppShell>
  );
}
