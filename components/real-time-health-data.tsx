"use client"

import { useEffect, useState } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import type { HealthData } from "@/types/health-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Droplets, Wind, Clock, ArrowUp, ArrowDown, Minus } from "lucide-react"

export function RealTimeHealthData() {
  const [latestData, setLatestData] = useState<HealthData | null>(null)
  const [previousData, setPreviousData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const healthDataRef = ref(database, "health_data")

    const unsubscribe = onValue(healthDataRef, (snapshot) => {
      setLoading(true)
      if (snapshot.exists()) {
        const newData = snapshot.val() as HealthData
        setPreviousData(prevState => {
          // Only update previous data if we had latest data before
          return latestData ? latestData : prevState
        })
        setLatestData(newData)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Helper function to calculate and display trend indicator
  const getTrendIndicator = (current: number, previous: number | undefined) => {
    if (!previous) return <Minus className="h-4 w-4 text-gray-400" />
    
    const diff = current - previous
    const threshold = current * 0.02 // 2% change threshold

    if (Math.abs(diff) < threshold) {
      return <Minus className="h-4 w-4 text-gray-400" />
    } else if (diff > 0) {
      return <ArrowUp className="h-4 w-4 text-red-500" />
    } else {
      return <ArrowDown className="h-4 w-4 text-blue-500" />
    }
  }

  // Function to determine color based on value ranges
  const getHeartRateColor = (rate: number) => {
    if (rate < 60 || rate > 100) return "text-yellow-500"
    return "text-red-500"
  }

  const getSpO2Color = (level: number) => {
    if (level < 95) return "text-yellow-500"
    if (level < 90) return "text-red-500"
    return "text-blue-500"
  }

  const getAcetoneColor = (level: number) => {
    if (level > 2 && level < 5) return "text-yellow-500"
    if (level >= 5) return "text-red-500"
    return "text-green-500"
  }

  if (loading && !latestData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Health Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-pulse flex space-x-2 items-center">
              <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]"></div>
              <span className="ml-2">Loading latest data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Health Data
          </CardTitle>
          {latestData && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last updated: {new Date(latestData.timestamp * 1000).toLocaleString()}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {latestData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <Activity className={`h-8 w-8 ${getHeartRateColor(latestData.HeartRate)}`} />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Heart Rate</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{latestData.HeartRate.toFixed(1)}</p>
                      <span className="text-sm text-muted-foreground">bpm</span>
                      {previousData && getTrendIndicator(latestData.HeartRate, previousData.HeartRate)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Normal range: 60-100 bpm</div>
            </div>

            <div className="flex flex-col p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <Droplets className={`h-8 w-8 ${getSpO2Color(latestData.SpO2)}`} />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">SpO2</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{latestData.SpO2.toFixed(1)}</p>
                      <span className="text-sm text-muted-foreground">%</span>
                      {previousData && getTrendIndicator(latestData.SpO2, previousData.SpO2)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Normal range: 95-100%</div>
            </div>

            <div className="flex flex-col p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <Wind className={`h-8 w-8 ${getAcetoneColor(latestData.acetone)}`} />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Acetone</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{latestData.acetone}</p>
                      <span className="text-sm text-muted-foreground">ppm</span>
                      {previousData && getTrendIndicator(latestData.acetone, previousData.acetone)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Normal range: 0-2 ppm</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground p-8">No data available</div>
        )}
      </CardContent>
    </Card>
  )
}