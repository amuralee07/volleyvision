"use client";

import { Badge } from "@/components/ui/badge";
import type { Analysis } from "@/lib/types";

export function AnalysisResults({ analysis }: { analysis: Analysis }) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold">AI Coach Summary</h3>
        </div>
        <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-lg font-bold">Strengths</h3>
          </div>
          {analysis.strengths.length === 0 ? (
            <p className="text-sm text-muted-foreground">No strengths identified yet.</p>
          ) : (
            <ul className="space-y-4">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-4">
                  <p className="font-semibold text-sm">{s.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Improvements */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold">Areas to Improve</h3>
          </div>
          {analysis.improvements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No improvements identified yet.</p>
          ) : (
            <ul className="space-y-4">
              {analysis.improvements.map((imp, i) => (
                <li key={i} className="rounded-xl bg-amber-50/50 border border-amber-100 p-4">
                  <p className="font-semibold text-sm">{imp.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{imp.description}</p>
                  {imp.drill && (
                    <div className="mt-2 flex items-start gap-1.5">
                      <Badge variant="secondary" className="shrink-0 text-xs bg-amber-100 text-amber-700 border-0">Drill</Badge>
                      <p className="text-sm text-muted-foreground">{imp.drill}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
