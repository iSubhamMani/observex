import { HeroChartCard } from "@/components/HeroChartCard";
import { HowItWorks } from "@/components/HowItWorks";
import { SiteHeader } from "@/components/SiteHeader";
import Link from "next/link";
import { BiCheck, BiLineChart, BiLock } from "react-icons/bi";
import { FiZap } from "react-icons/fi";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6">
        <section className="grid gap-12 py-20 md:grid-cols-2 md:gap-10 md:py-28">
          <div>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              An alternative
              <br />
              to <span className="highlight-pill">bloated</span> analytical
              <br /> tools that&apos;s
              <br /> <span className="underline-wave">simple </span> &amp;
              effective.
            </h1>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={"/signup"}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
              >
                Start for free <FiZap className="h-4 w-4" />
              </Link>
              <Link
                href={"/demo"}
                className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent hover:text-accent-foreground"
              >
                View a live demo <BiLineChart className="h-4 w-4" />
              </Link>
            </div>

            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {["Quick setup", "Intrusive Insights", "No obligation"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <BiCheck className="h-3.5 w-3.5 text-primary" /> {t}
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <HeroChartCard />
            <p className="text-center text-sm text-muted-foreground">
              Get deep insights into how users interact with your website
            </p>
          </div>
        </section>
        <section id="product" className="grid gap-12 py-10 md:grid-cols-3">
          {[
            {
              icon: BiLineChart,
              title: "Ditch Confusing Analytics",
              body: "At Observex, we believe analytics should be insightful, not invasive. We built a privacy-focused, simple software tool that offers valuable insights without the complexity.",
            },
            {
              icon: FiZap,
              title: "Get setup in minutes",
              body: "Install the sdk, wrap your app, and start shipping events. Your dashboard updates automatically, no code changes required. It's that simple.",
            },
            {
              icon: BiLock,
              title: "Privacy first Insights",
              body: "Get the insights you need without compromising your users' privacy. Opt in or out of any user privacy breach with a single line of code, and rest easy knowing your users are in control.",
            },
          ].map((f) => (
            <div key={f.title}>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </div>
          ))}
        </section>

        <HowItWorks />

        <section
          id="pricing"
          className="rounded-2xl border border-border bg-card/50 p-10 text-center"
        >
          <h2 className="text-3xl font-bold">Start observing in minutes</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Create your free account and get your dashboard up and running in
            minutes.
          </p>
          <Link
            href={"/signup"}
            className="mt-6 inline-flex rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Create your free account
          </Link>
        </section>
      </main>

      <footer className="mt-20 border-t border-border py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Observex — Built for the privacy-first web.
      </footer>
    </div>
  );
}
