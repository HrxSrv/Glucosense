

// types/health-data.ts

export interface HealthData {
  HeartRate: number;
  SpO2: number;
  acetone: number;
  timestamp: number;
  lastUpdate?: string;
}

export interface GeminiAnalysis {
  glucoseEstimate: string;
  glucoseRange: string;
  glucoseStatus: string;
  diabetesRisk: string;
  recommendations: string[];
}