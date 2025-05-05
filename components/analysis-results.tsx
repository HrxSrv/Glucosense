"use client"

import { useState, useEffect } from "react"
import type { GeminiAnalysis } from "@/types/health-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, CheckCircle, AlertTriangle, Info, Loader2 } from "lucide-react"

interface AnalysisResultsProps {
  analysis: GeminiAnalysis | null
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const [loading, setLoading] = useState(true)
  const [loadingText, setLoadingText] = useState("Running analysis on Cloud model")

  useEffect(() => {
    if (!analysis) return

    // Change loading text every ~1.5 seconds
    const textTimer1 = setTimeout(() => {
      setLoadingText("Sending the sugar levels to LLMs")
    }, 1500)

    const textTimer2 = setTimeout(() => {
      setLoadingText("Hold Tight")
    }, 3000)

    // Show loading state for 5 seconds
    const loadingTimer = setTimeout(() => {
      setLoading(false)
    }, 5000)

    return () => {
      clearTimeout(textTimer1)
      clearTimeout(textTimer2)
      clearTimeout(loadingTimer)
    }
  }, [analysis])

  if (!analysis) {
    return null
  }

  // Helper function to determine glucose range status
  const getGlucoseStatus = (range: string) => {
    const lowerValue = parseFloat(range.split('-')[0])
    if (lowerValue < 70) return "warning"
    if (lowerValue > 180) return "danger"
    return "normal"
  }

  const glucoseStatus = getGlucoseStatus(analysis.glucoseRange)

  const statusMap = {
    normal: {
      color: "bg-green-100 text-green-800",
      icon: <Info className="h-5 w-5" />,
      label: "Normal Range"
    },
    warning: {
      color: "bg-yellow-100 text-yellow-800",
      icon: <AlertTriangle className="h-5 w-5" />,
      label: "Low - Monitor Closely"
    },
    danger: {
      color: "bg-red-100 text-red-800",
      icon: <AlertTriangle className="h-5 w-5" />,
      label: "High - Take Action"
    }
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-center">{loadingText}</p>
          {/* <Progress value={loading ? 100 : 0} className="w-full max-w-md" /> */}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Analysis Results
          </CardTitle>
          <Badge className={statusMap[glucoseStatus].color}>
            <div className="flex items-center gap-1">
              {statusMap[glucoseStatus].icon}
              <span>{statusMap[glucoseStatus].label}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg bg-muted/30">
          <h3 className="font-semibold text-lg mb-2">Estimated Glucose Range</h3>
          <div className="space-y-3">
            <p className="text-3xl font-bold">{analysis.glucoseRange} mg/dL</p>
            <Progress 
              value={glucoseStatus === "normal" ? 50 : glucoseStatus === "warning" ? 25 : 85} 
              className={
                glucoseStatus === "normal" 
                  ? "bg-green-100" 
                  : glucoseStatus === "warning" 
                    ? "bg-yellow-100" 
                    : "bg-red-100"
              }
            />
            <div className="grid grid-cols-3 text-xs text-muted-foreground">
              <div>Low (&lt;70)</div>
              <div className="text-center">Normal (70-180)</div>
              <div className="text-right">High (&gt;180)</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Recommendations</h3>
          <div className="grid gap-2">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}