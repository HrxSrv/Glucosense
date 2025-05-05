"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import type { HealthData } from "@/types/health-data"
import type { GeminiAnalysis } from "@/types/health-data"
import { analyzeHealthData } from "@/app/actions/gemini-actions"
import { Download, ArrowRight, Plus, Minus } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface HealthDataFormProps {
  onAnalysisComplete: (analysis: GeminiAnalysis) => void
}

export function HealthDataForm({ onAnalysisComplete }: HealthDataFormProps) {
  const [heartRate, setHeartRate] = useState("")
  const [spO2, setSpO2] = useState("")
  const [acetone, setAcetone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [realtimeData, setRealtimeData] = useState<HealthData | null>(null)
  const [pullDataSuccess, setPullDataSuccess] = useState(false)
  
  // New states for additional features
  const [isPrediabetic, setIsPrediabetic] = useState(false)
  const [testType, setTestType] = useState("random")
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false)
  const [additionalInfo, setAdditionalInfo] = useState("")

  // Listen for realtime data
  useEffect(() => {
    const healthDataRef = ref(database, "health_data")
    
    const unsubscribe = onValue(healthDataRef, (snapshot) => {
      if (snapshot.exists()) {
        setRealtimeData(snapshot.val() as HealthData)
      }
    })
    
    return () => unsubscribe()
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Divide acetone by 100 as per requirement
      const acetoneValue = Number.parseFloat(acetone) / 100
      
      const analysis = await analyzeHealthData(
        Number.parseFloat(heartRate),
        Number.parseFloat(spO2),
        acetoneValue,
        isPrediabetic,
        testType,
        additionalInfo
      )
      onAnalysisComplete(analysis)
    } catch (error) {
      console.error("Error analyzing data:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const pullRealtimeData = () => {
    if (realtimeData) {
      setHeartRate(realtimeData.HeartRate.toFixed(1))
      setSpO2(realtimeData.SpO2.toFixed(1))
      // Multiply by 100 for display but will be divided before sending
      setAcetone((realtimeData.acetone * 100).toFixed(2))
      
      // Show success feedback
      setPullDataSuccess(true)
      setTimeout(() => setPullDataSuccess(false), 2000)
    }
  }
  
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Enter Health Data</CardTitle>
            <CardDescription className="mt-1">
              Enter your health metrics to get analysis
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={pullRealtimeData}
                  disabled={!realtimeData}
                  className={`${pullDataSuccess ? 'bg-green-100 border-green-300 text-green-700' : ''}`}
                >
                  {pullDataSuccess ? (
                    "Data Pulled!"
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-1" />
                      <span>Use Current</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pull data from real-time readings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
            <Input
              id="heartRate"
              type="number"
              step="0.1"
              placeholder="e.g., 72.5"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spO2">SpO2 (%)</Label>
            <Input
              id="spO2"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="e.g., 98.5"
              value={spO2}
              onChange={(e) => setSpO2(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acetone">Acetone (ppm × 100)</Label>
            <Input
              id="acetone"
              type="number"
              placeholder="e.g., 50"
              value={acetone}
              onChange={(e) => setAcetone(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              This is displayed as 100× the actual value. The system will automatically convert before analysis.
            </p>
          </div>
          
          {/* Health Status Toggle */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="prediabetic" className="text-sm font-medium">
                Pre-diabetic Condition
              </Label>
              <Switch
                id="prediabetic"
                checked={isPrediabetic}
                onCheckedChange={setIsPrediabetic}
              />
            </div>
          </div>
          
          {/* Test Type Selection */}
          <div className="space-y-2 pt-2">
            <Label className="text-sm font-medium">Test Type</Label>
            <RadioGroup value={testType} onValueChange={setTestType} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fasting" id="fasting" />
                <Label htmlFor="fasting">Fasting</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="random" id="random" />
                <Label htmlFor="random">Random</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="postprandial" id="postprandial" />
                <Label htmlFor="postprandial">Post-meal</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Additional Information Collapsible */}
          <Collapsible 
            open={showAdditionalInfo} 
            onOpenChange={setShowAdditionalInfo}
            className="w-full border rounded-md p-2"
          >
            <div className="flex items-center justify-between">
              <Label htmlFor="additionalInfo" className="text-sm font-medium">
                Additional Patient Information
              </Label>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  {showAdditionalInfo ? (
                    <Minus className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-2">
              <Textarea
                id="additionalInfo"
                placeholder="Enter any additional information about the patient (medical history, symptoms, etc.)"
                className="resize-none"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full flex items-center justify-center"
          >
            {isLoading ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center">
                Analyze On Cloud
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}