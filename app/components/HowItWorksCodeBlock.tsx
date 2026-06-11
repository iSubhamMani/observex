/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { FiCode, FiPackage } from "react-icons/fi";
import { LuMousePointerClick } from "react-icons/lu";
import { CodeBlock } from "./CodeBlock";

const installSnippet = `npm install @subhamxmani/observex-sdk`;

const wrapSnippet = `import { ReactAnalytics } from "@subhamxmani/observex-sdk";

<ReactAnalytics
  pathname={location.pathname}
  respectSessionConsent={true}
  websiteId="YOUR_PROJECT_ID"
>
  {/* Your app routes */}
</ReactAnalytics>`;

const trackSnippet = `import { useTracker } from "@subhamxmani/observex-sdk";

const { track } = useTracker();

<button onClick={() => track("purchase_click", { product_id: "p_881" })}>
  Buy Now
</button>`;

const steps = [
  {
    n: "01",
    icon: FiPackage,
    title: "Install the SDK",
    body: "Add the official Observex analytics SDK to your React or Next.js project with a single command.",
    code: installSnippet,
    language: "bash",
  },
  {
    n: "02",
    icon: FiCode,
    title: "Wrap your app",
    body: "Drop the ReactAnalytics provider at the root of your app and pass in your project's websiteId.",
    code: wrapSnippet,
    language: "tsx",
  },
  {
    n: "03",
    icon: LuMousePointerClick,
    title: "Track events & impressions",
    body: "Use the useTracker and useImpressionTracker hooks to capture custom events and viewport impressions.",
    code: trackSnippet,
    language: "tsx",
  },
];

const HowItWorksCodeBlock = () => {
  return (
    <>
      {steps.map((s: any) => (
        <div
          key={s.n}
          className="flex flex-col rounded-2xl border border-border bg-card/40 p-6 min-w-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step {s.n}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <s.icon className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-primary">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {s.body}
          </p>
          <div className="mt-4 overflow-hidden text-xs">
            <CodeBlock code={s.code} language={s.language} />
          </div>
        </div>
      ))}
    </>
  );
};

export default HowItWorksCodeBlock;
