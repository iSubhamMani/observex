import { HeroChartCard } from "@/components/HeroChartCard";
import { SiteHeader } from "@/components/SiteHeader";
import Link from "next/link";
import { BiCheck, BiLineChart, BiLock } from "react-icons/bi";
import { FiZap } from "react-icons/fi";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6">
        <section className="grid gap-12 py-20 md:grid-cols-2 md:gap-10 md:py-28">
          <div>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              A Google Analytics
              <br /> alternative that&apos;s
              <br /> simple &amp; privacy-first
            </h1>
            <div className="mt-6 flex items-center gap-3">
              <span className="rounded-md border border-border px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                New
              </span>
              <a
                href="#"
                className="text-sm underline underline-offset-4 hover:text-primary"
              >
                ObservEx joins the privacy alliance
              </a>
            </div>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              Ditch complex, intrusive web analytics for ObservEx — a better
              Google Analytics alternative. Experience ease of use, forever data
              retention, and complete, worry-free GDPR compliance — all while
              protecting <span className="highlight-pill">your time</span> and
              your visitors&apos;{" "}
              <span className="underline-wave">digital privacy</span>.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={"/signup"}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
              >
                Start for free <FiZap className="h-4 w-4" />
              </Link>
              <Link
                href={"/analytics/$id"}
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
            <blockquote className="rounded-lg border-l-2 border-primary/60 pl-4 text-sm text-muted-foreground">
              &quot;Analytics for our podcast network are powered by ObservEx.
              It&apos;s a pleasure to use compared to Google Analytics — the
              right number of features, and the platform is incredibly
              intuitive.&quot;
              <footer className="mt-3 flex items-center gap-2 text-foreground">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-chart-2" />
                <span className="text-sm font-medium">
                  Ian Mackey, Field Recordings
                </span>
              </footer>
            </blockquote>
          </div>
        </section>

        <section className="border-y border-border py-8">
          <p className="text-center text-xs uppercase tracking-wider text-muted-foreground">
            Trusted by indie makers, agencies &amp; over a million pageviews /
            month
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-lg font-semibold text-muted-foreground/70">
            {[
              "IBM",
              "Bootstrap",
              "HUBERMAN LAB",
              "GitHub",
              "tailwind",
              "Laravel",
            ].map((b) => (
              <span key={b} className="opacity-70 hover:opacity-100">
                {b}
              </span>
            ))}
          </div>
        </section>

        <section id="product" className="grid gap-12 py-20 md:grid-cols-3">
          {[
            {
              icon: BiLineChart,
              title: "Ditch Google Analytics",
              body: "At ObservEx, we believe analytics should be insightful, not invasive. We built a privacy-focused, simple software tool that offers valuable insights without the complexity.",
            },
            {
              icon: FiZap,
              title: "Get setup in minutes",
              body: "Our script is a single line of code that works with any website, CMS or framework. Set up in minutes and start collecting real-time data without prior technical knowledge.",
            },
            {
              icon: BiLock,
              title: "Comply with privacy laws",
              body: "We hired the best lawyers and legal minds worldwide to ensure our simple analytics software is fully compliant with GDPR, CCPA, ePrivacy, PECR and more.",
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

        <section
          id="pricing"
          className="rounded-2xl border border-border bg-card/50 p-10 text-center"
        >
          <h2 className="text-3xl font-bold">Start observing in minutes</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            One simple price. Unlimited sites. No cookies, no tracking, no
            nonsense.
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
        © {new Date().getFullYear()} ObservEx — Built for the privacy-first web.
      </footer>
    </div>
  );
}
