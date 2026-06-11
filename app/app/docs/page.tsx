"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { FiBookOpen, FiEye, FiInfo } from "react-icons/fi";
import { LuMousePointerClick } from "react-icons/lu";
import { FaRegLightbulb } from "react-icons/fa";
import { IoWarning } from "react-icons/io5";
import { SiteHeader } from "@/components/SiteHeader";

const reactInstall = `npm install @subhamxmani/observex-sdk`;

const reactIntegration = `import { ReactAnalytics } from "@subhamxmani/observex-sdk";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <ReactAnalytics
      pathname={location.pathname}
      respectSessionConsent={true} // Set to true after user gives legal consent
      websiteId="your-wesbite-id"
    >
      {/* Your App Routes Go Here */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </ReactAnalytics>
  );
}`;

const nextjsIntegration = `import { NextAnalytics } from "@subhamxmani/observex-sdk";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NextAnalytics
          respectSessionConsent={true} // Set to true after user gives legal consent
          websiteId="your-wesbite-id"
        >
          {children}
        </NextAnalytics>
      </body>
    </html>
  );
}`;

const trackerHook = `import { useTracker } from "@subhamxmani/observex-sdk";

function BuyButton() {
  const { track } = useTracker();

  return (
    <button
      onClick={() =>
        track("purchase_click", { product_id: "p_881", price: 29.99 })
      }
    >
      Buy Now
    </button>
  );
}`;

const impressionHook = `import { useImpressionTracker } from "@subhamxmani/observex-sdk";

function PromoBanner() {
  const bannerRef = useImpressionTracker<HTMLDivElement>("banner_view", {
    campaign: "summer_sale",
  });

  return (
    <div ref={bannerRef} className="promo-banner">
      Summer Sale — 50% off!
    </div>
  );
}`;

type Tab = "react" | "nextjs";

export default function DocsPage() {
  const [tab, setTab] = useState<Tab>("react");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <FiBookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Integration Guide
            </h1>
            <p className="text-sm text-muted-foreground">
              Add ObserveX to your app in minutes.
            </p>
          </div>
        </div>

        {/* Step 1 — Install */}
        <section className="mt-10">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </div>
            <h2 className="text-lg font-semibold">Install the SDK</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Add the official ObserveX analytics SDK to your project.
          </p>
          <div className="mt-4">
            <CodeBlock code={reactInstall} language="bash" />
          </div>
        </section>

        {/* Step 2 — Framework Tabs */}
        <section className="mt-10">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </div>
            <h2 className="text-lg font-semibold">Wrap your app</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose your framework and wrap your application with the provider
            component.
          </p>

          {/* Tabs */}
          <div className="mt-4 inline-flex rounded-lg border border-border bg-muted p-1">
            <button
              onClick={() => setTab("react")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === "react"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              React
            </button>
            <button
              onClick={() => setTab("nextjs")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === "nextjs"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Next.js
            </button>
          </div>

          <div className="mt-4">
            {tab === "react" ? (
              <CodeBlock code={reactIntegration} language="tsx" />
            ) : (
              <CodeBlock code={nextjsIntegration} language="tsx" />
            )}
          </div>

          {/* Expanded Privacy Callout Section */}
          <div className="mt-6 rounded-xl border border-border bg-muted/40 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <FiInfo className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="space-y-2">
                <h4 className="text-sm font-bold tracking-wide uppercase text-foreground/90">
                  Important: Session Tracking & Privacy Compliance
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-mono text-xs">
                    respectSessionConsent
                  </code>{" "}
                  parameter controls how ObserveX segregates multi-page journeys
                  into isolated visitor sessions using temporary client-side tab
                  identifiers.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 pl-8 text-xs sm:text-sm">
              <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-1">
                  <FaRegLightbulb /> When set to true:
                </p>
                <p className="text-muted-foreground leading-normal">
                  The SDK provisions a transient token inside{" "}
                  <code className="font-mono">sessionStorage</code>. This
                  unlocks highly accurate calculations for{" "}
                  <strong>Unique Visitors</strong>, bounce rates, and user
                  session durations. Data self-destructs instantly when the
                  browser tab closes.
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                <p className="flex items-center font-bold text-rose-600 dark:text-rose-400 mb-1 gap-2">
                  <IoWarning /> When set to false (or omitted):
                </p>
                <p className="text-muted-foreground leading-normal">
                  The script executes in an entirely stateless environment.
                  Because page events cannot be linked together chronologically,{" "}
                  <strong>
                    Unique Visitors will not be safely isolated and metric
                    groupings will default to degraded counts.
                  </strong>
                </p>
              </div>
            </div>

            {/* Strict Legal Disclaimer Warning Alert Box */}
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3.5 text-xs sm:text-sm text-red-900 dark:text-red-200/90 ml-8">
              <div className="flex gap-2">
                <IoWarning className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block text-red-700 dark:text-red-400">
                    Regulatory Compliance Warning & Legal Disclaimer
                  </span>
                  <p className="leading-relaxed text-muted-foreground dark:text-red-200/70">
                    To satisfy global mandates (such as GDPR, ePrivacy, and
                    CCPA/CPRA), you{" "}
                    <strong>
                      MUST obtain affirmative, explicit consent from the
                      end-user
                    </strong>{" "}
                    before configuring this flag to{" "}
                    <code className="font-mono bg-red-500/10 px-1 py-0.5 rounded">
                      true
                    </code>
                    . By using this SDK, you explicitly agree that{" "}
                    <strong>
                      ObserveX accepts zero liability, legal responsibility, or
                      accountability
                    </strong>{" "}
                    for unconsented tracking deployments or configuration errors
                    within your host application environment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3 — Hooks */}
        <section className="mt-10">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              3
            </div>
            <h2 className="text-lg font-semibold">
              Track events & impressions
            </h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Use our hooks to send custom events and track element impressions.
          </p>

          <div className="mt-6 space-y-8">
            {/* useTracker */}
            <div>
              <div className="flex items-center gap-2">
                <LuMousePointerClick className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold">useTracker</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Send custom events programmatically — button clicks, form
                submissions, purchases, etc.
              </p>
              <div className="mt-3">
                <CodeBlock code={trackerHook} language="tsx" />
              </div>
            </div>

            {/* useImpressionTracker */}
            <div>
              <div className="flex items-center gap-2">
                <FiEye className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold">
                  useImpressionTracker
                </h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Track when elements enter the viewport — banners, modals, hero
                sections.
              </p>
              <div className="mt-3">
                <CodeBlock code={impressionHook} language="tsx" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
