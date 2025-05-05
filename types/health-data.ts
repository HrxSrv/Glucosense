export interface HealthData {
  HeartRate: number
  SpO2: number
  acetone: number
  timestamp: number
}

export interface GeminiAnalysis {
  glucoseRange: string
  recommendations: string[]
}
