import { FiArrowRight } from "react-icons/fi";
import dashboardPreview from "@/public/dasboard-preview.png";
import Link from "next/link";
import Image from "next/image";
import HowItWorksCodeBlock from "./HowItWorksCodeBlock";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          From install to insights in{" "}
          <span className="text-primary">three steps</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
          Observex ships a tiny SDK for React and Next.js. Install, wrap, and
          start shipping events — your live dashboard updates in real time.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        <HowItWorksCodeBlock />
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Read the full docs <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-14">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            See it in action
          </p>

          <p className="mx-auto mt-3 text-balance max-w-xl text-sm text-muted-foreground">
            Pageviews, visitors, top pages, referrers, and devices — all in one
            elegant, privacy-first dashboard.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card/40 p-2 shadow-2xl">
          <div className="flex items-center gap-1.5 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
            <span className="ml-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              analytics
            </span>
          </div>
          <Image
            src={dashboardPreview}
            alt="Observex analytics dashboard preview"
            loading="lazy"
            width={1920}
            height={1080}
            className="w-full rounded-xl border border-border"
          />
        </div>
      </div>
    </section>
  );
}
