"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Analysis } from "@/lib/types";

export function AnalysisResults({ analysis }: { analysis: Analysis }) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="text-green-600">&#9650;</span> Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {analysis.strengths.map((s, i) => (
                <li key={i}>
                  <p className="font-medium">{s.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                </li>
              ))}
              {analysis.strengths.length === 0 && (
                <p className="text-sm text-muted-foreground">No strengths identified yet.</p>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Improvements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="text-orange-500">&#9660;</span> Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {analysis.improvements.map((imp, i) => (
                <li key={i}>
                  <p className="font-medium">{imp.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{imp.description}</p>
                  {imp.drill && (
                    <p className="mt-1 text-sm">
                      <Badge variant="secondary" className="mr-1">Drill</Badge>
                      {imp.drill}
                    </p>
                  )}
                </li>
              ))}
              {analysis.improvements.length === 0 && (
                <p className="text-sm text-muted-foreground">No improvements identified yet.</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
