"use client";

import { RiLoader5Line } from "react-icons/ri";

interface UtmDataItem {
  name: string;
  views: number;
  visitors: number;
}

interface UtmTabContentProps {
  data: UtmDataItem[];
  loading: boolean;
  activeTab: "campaign" | "source" | "medium" | "content" | "term";
  onTabChange: (
    tab: "campaign" | "source" | "medium" | "content" | "term",
  ) => void;
}

export function UtmTabContent({
  data,
  loading,
  activeTab,
  onTabChange,
}: UtmTabContentProps) {
  const tabs = [
    { id: "campaign", label: "Campaign" },
    { id: "source", label: "Source" },
    { id: "medium", label: "Medium" },
    { id: "content", label: "Content" },
    { id: "term", label: "Term" },
  ] as const;

  // Find max views for the subtle progress background bar scaling
  const maxViews =
    data && data.length > 0
      ? Math.max(...data.map((item) => item.views), 1)
      : 1;

  return (
    <div className="w-full mt-8 animate-fade-in">
      {/* ──► SINGLE INLINE HEADER: Tabs on Left, Metric Labels on Right ◄── */}
      <div className="flex justify-between items-end border-b border-border pb-2 mb-3 px-1">
        {/* Tabs Switcher Buttons (Left) */}
        <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`text-xs sm:text-sm font-medium transition-all relative pb-2 ${
                activeTab === tab.id
                  ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Metric Column Headers (Right) */}
        <div className="flex gap-12 sm:gap-16 text-right text-[11px] font-semibold text-muted-foreground/80 tracking-wider uppercase pb-2 select-none">
          <div className="w-24">Site visitors</div>
          <div className="w-16">Views</div>
        </div>
      </div>

      {/* Table Content Body Data Rows */}
      {loading ? (
        <RiLoader5Line className="animate-spin mx-auto text-2xl text-primary/70" />
      ) : !data || data.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border rounded-lg bg-muted/5">
          No tracking tags captured for this parameter in the selected period.
        </div>
      ) : (
        <div className="space-y-0.5">
          {data.map((item, index) => {
            const percentage = (item.views / maxViews) * 100;
            return (
              <div
                key={index}
                className="animate-fade-in group relative flex justify-between items-center px-3 py-2.5 text-sm rounded-md transition-colors hover:bg-muted/30 overflow-hidden"
              >
                {/* Modern progress backdrop track */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-primary/30 transition-all duration-500 ease-out pointer-events-none"
                  style={{ width: `${percentage}%` }}
                />

                {/* Left Aligned Dynamic UTM Parameter Tag */}
                <span className="font-mono text-xs text-foreground z-10 truncate max-w-[55%] sm:max-w-[70%]">
                  {item.name || "unknown"}
                </span>

                {/* Right Aligned Performance Metrics perfectly matching header alignments */}
                <div className="flex gap-12 sm:gap-16 text-right font-medium z-10 text-xs sm:text-sm">
                  <span className="w-24 text-foreground/90">
                    {item.visitors.toLocaleString()}
                  </span>
                  <span className="w-16 text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.views.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
