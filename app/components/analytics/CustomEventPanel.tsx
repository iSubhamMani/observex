/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RiLoader5Line } from "react-icons/ri";
import {
  fetchCustomEvents,
  fetchCustomEventKeys,
  fetchCustomEventMeta,
} from "./data";
import { CiSearch } from "react-icons/ci";

interface CustomEventsPanelProps {
  pid: string;
  start: Date;
  end: Date;
}

export function CustomEventsPanel({ pid, start, end }: CustomEventsPanelProps) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // ──► 1. ADDED: Search state hook for filtering custom event rows ◄──
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch main custom events list
  const { data: eventsList = [], isLoading: isListLoading } = useQuery({
    queryKey: [
      "analytics",
      "custom-events",
      pid,
      start.toISOString(),
      end.toISOString(),
    ],
    queryFn: () => fetchCustomEvents(pid, start, end),
    staleTime: 5 * 60 * 1000,
  });

  // ──► 2. ADDED: Client-side quick filter matching query strings ◄──
  const filteredEvents = eventsList.filter((evt: any) =>
    evt.event_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Auto-resolve active selection based on filtered choices
  const activeEvent = selectedEvent || filteredEvents[0]?.event_name || null;

  // 2. DYNAMIC SCHEMALESS DISCOVERY: Fetch keys sent with this active custom event
  const { data: discoveredKeys = [], isLoading: isKeysLoading } = useQuery({
    queryKey: [
      "analytics",
      "custom-events",
      "keys",
      pid,
      start.toISOString(),
      end.toISOString(),
      activeEvent,
    ],
    queryFn: () => fetchCustomEventKeys(pid, start, end, activeEvent!),
    enabled: !!activeEvent,
    staleTime: 5 * 60 * 1000,
  });

  // Reset or adjust the active property selector sub-tab when the active event cycles
  const activeKey =
    selectedKey && discoveredKeys.includes(selectedKey)
      ? selectedKey
      : (discoveredKeys[0] ?? null);

  // 3. Fetch data breakdowns for the active event + dynamically discovered metadata key
  const { data: metaBreakdown = [], isLoading: isMetaLoading } = useQuery({
    queryKey: [
      "analytics",
      "custom-events",
      "meta",
      pid,
      start.toISOString(),
      end.toISOString(),
      activeEvent,
      activeKey,
    ],
    queryFn: () =>
      fetchCustomEventMeta(pid, start, end, activeEvent!, activeKey!),
    enabled: !!activeEvent && !!activeKey,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate max volume scales to compute accurate horizontal percentage distributions
  const maxEvents =
    filteredEvents.length > 0
      ? Math.max(...filteredEvents.map((e: any) => e.total_events), 1)
      : 1;
  const maxActions =
    metaBreakdown.length > 0
      ? Math.max(...metaBreakdown.map((m: any) => m.total_actions), 1)
      : 1;

  if (!isListLoading && eventsList.length === 0) return null;

  return (
    <div className="mt-8 grid gap-6 shadow-sm lg:grid-cols-5 animate-fade-in">
      {/* LEFT PANEL: Events List */}
      <div className="lg:col-span-2 border border-border bg-card/40 rounded-lg p-4 backdrop-blur-sm flex flex-col">
        {/* Panel Header */}
        <div className="flex justify-between items-center border-b border-border/60 pb-3 mb-3 px-1">
          <span className="text-sm font-semibold text-foreground">Events</span>
          <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
            Actions
          </span>
        </div>

        {/* ──► 3. ADDED: Minimalist Search input element matching your dashboard ◄── */}
        {!isListLoading && eventsList.length > 0 && (
          <div className="mb-3 relative">
            <CiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <input
              type="text"
              placeholder="Search custom events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/20 border border-border rounded-md pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>
        )}

        {isListLoading ? (
          <div className="py-12 flex justify-center my-auto">
            <RiLoader5Line className="animate-spin text-xl text-primary/70" />
          </div>
        ) : (
          <div className="space-y-1 overflow-y-auto max-h-87.5 scrollbar-none flex-1">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground italic">
                No events match your search query.
              </div>
            ) : (
              filteredEvents.map((evt: any) => {
                const eventPercentage = (evt.total_events / maxEvents) * 100;
                return (
                  <button
                    key={evt.event_name}
                    onClick={() => {
                      setSelectedEvent(evt.event_name);
                      setSelectedKey(null); // Reset key view to trigger fresh default loading sequences
                    }}
                    className={`w-full relative flex justify-between items-center px-3 py-2 text-xs rounded-md transition-all font-mono overflow-hidden ${
                      activeEvent === evt.event_name
                        ? "bg-accent font-semibold"
                        : "text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                    }`}
                  >
                    {/* Modern progress bar backdrop track */}
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-primary/30 transition-all duration-500 ease-out pointer-events-none"
                      style={{ width: `${eventPercentage}%` }}
                    />
                    <span
                      className={`relative z-10 truncate max-w-[70%] ${activeEvent === evt.event_name ? "text-secondary-foreground" : "text-muted-foreground"}`}
                    >
                      {evt.event_name}
                    </span>
                    <span
                      className={`relative z-10 font-sans font-medium tabular-nums ${activeEvent === evt.event_name ? "text-secondary-foreground" : "text-muted-foreground"}`}
                    >
                      {evt.total_events.toLocaleString()}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Dynamic Property Breakdown Summary */}
      <div className="lg:col-span-3 border border-border bg-card/40 rounded-lg p-4 backdrop-blur-sm">
        {/* Dynamic Parameter Navigation Selection Bar */}
        <div className="border-b border-border/60 pb-3 mb-4 px-1">
          {isKeysLoading ? (
            <div className="h-6 flex items-center">
              <RiLoader5Line className="animate-spin text-primary/70 size-4" />
            </div>
          ) : discoveredKeys.length === 0 ? (
            <span className="text-xs text-muted-foreground italic">
              No descriptive property metadata tags sent with this event.
            </span>
          ) : (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {discoveredKeys.map((keyName) => (
                <button
                  key={keyName}
                  onClick={() => setSelectedKey(keyName)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
                    activeKey === keyName
                      ? "bg-foreground text-background font-semibold border-foreground"
                      : "bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/60"
                  }`}
                >
                  {keyName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Column Headers */}
        <div className="flex justify-between items-center mb-2 px-3 text-[10px] font-bold text-muted-foreground tracking-wider uppercase select-none">
          <div>Value</div>
          <div className="flex gap-12 text-right">
            <div className="w-20">Visitors</div>
            <div className="w-12">Count</div>
          </div>
        </div>

        {/* Rendered Data Rows */}
        {isMetaLoading ? (
          <div className="py-12 flex justify-center">
            <RiLoader5Line className="animate-spin text-xl text-primary/70" />
          </div>
        ) : metaBreakdown.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground border border-dashed border-border rounded-md bg-muted/5">
            Select a custom parameter key above to load tracking value metrics.
          </div>
        ) : (
          <div className="space-y-0.5 anonymity-grid animate-fade-in">
            {metaBreakdown.map((item: any, idx: number) => {
              const breakdownPercentage =
                (item.total_actions / maxActions) * 100;
              return (
                <div
                  key={idx}
                  className="group relative flex justify-between items-center px-3 py-2.5 text-xs rounded-md hover:bg-muted/30 transition-colors overflow-hidden"
                >
                  {/* Modern progress bar backdrop track */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-primary/30 transition-all duration-500 ease-out pointer-events-none"
                    style={{ width: `${breakdownPercentage}%` }}
                  />
                  <span className="relative z-10 font-mono text-secondary-foreground truncate max-w-[50%] px-1.5 py-0.5">
                    {item.property_value || "unknown"}
                  </span>
                  <div className="relative z-10 flex gap-12 text-right font-medium text-xs">
                    <span className="w-20 text-foreground/90">
                      {item.unique_visitors.toLocaleString()}
                    </span>
                    <span className="w-12 text-muted-foreground group-hover:text-foreground transition-colors">
                      {item.total_actions.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
