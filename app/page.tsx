"use client"

import { useState } from "react"
import { RealTimeHealthData } from "@/components/real-time-health-data"
import { HealthDataForm } from "@/components/health-data-form"
import { AnalysisResults } from "@/components/analysis-results"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Brain } from "lucide-react"
import type { GeminiAnalysis } from "@/types/health-data"

export default function Home() {
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null)

  return (
    <main className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Header with title and quick stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Diabetic Health Monitoring</h1>
            <p className="text-muted-foreground mt-1">Track, analyze, and manage your health metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <Card className="bg-primary/10">
              <CardContent className="p-3 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="font-medium">Real-time monitoring active</span>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Real-time health data section */}
        <div className="w-full">
          <RealTimeHealthData />
        </div>

        {/* Analysis section (static, no tabs) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Analysis</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <HealthDataForm onAnalysisComplete={setAnalysis} />
            </div>
            <div className="md:col-span-2">
              {analysis ? (
                <AnalysisResults analysis={analysis} />
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="py-12 text-center">
                    <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">No Analysis Results</h3>
                    <p className="text-muted-foreground max-w-md">
                      Enter your health metrics in the form to receive AI-powered analysis and recommendations.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
