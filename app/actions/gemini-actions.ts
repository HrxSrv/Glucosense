"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

export async function analyzeHealthData(
  heartRate: number, 
  spO2: number, 
  acetone: number,
  isPrediabetic: boolean = false,
  testType: string = "random",
  additionalInfo: string = ""
) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    
    // Build the test type context
    let testContext = "The reading was taken during a"
    switch(testType) {
      case "fasting":
        testContext += " fasting state (no food for at least 8 hours)."
        break
      case "postprandial":
        testContext += " post-meal state (within 2 hours after eating)."
        break
      default:
        testContext += " random state (unknown time since last meal)."
    }
    
    // Add prediabetic status context if applicable
    const healthContext = isPrediabetic 
      ? "Patient has a known pre-diabetic condition." 
      : "Patient has no known diabetic condition."
    
    // Additional information section
    const patientInfo = additionalInfo.trim() !== "" 
      ? `\nAdditional patient information: ${additionalInfo}` 
      : ""
    
    const prompt = `
      You are a medical analysis AI specialized in diabetes screening and monitoring. Your task is to analyze biometric data and provide precise blood glucose estimations.
      
      # CONTEXT
      Research has established correlations between breath acetone levels and blood glucose in diabetic patients. Higher acetone levels (measured in ppm) often indicate ketosis, which can suggest elevated blood glucose or insufficient insulin.
      - Normal breath acetone: 0.5-2.0 ppm
      - Elevated breath acetone: 2.0-5.0 ppm (mild ketosis)
      - High breath acetone: >5.0 ppm (significant ketosis, often seen in uncontrolled diabetes)
      
      Heart rate and oxygen saturation provide supporting context about overall cardiovascular health.
      
      # PATIENT INFORMATION
      ${healthContext}
      ${testContext}${patientInfo}
      
      # INPUT DATA
      - Heart Rate: ${heartRate} bpm (normal range: 60-100 bpm)
      - SpO2: ${spO2}% (normal range: 95-100%)
      - Breath Acetone: ${acetone} ppm (measured via MQ-138 sensor)
      
      # ANALYSIS REQUIREMENTS
      1. Estimate blood glucose range in mg/dL with a narrow margin (±10 mg/dL)
      2. Consider the test type (${testType}) when interpreting glucose values
      3. ${isPrediabetic ? "Account for the pre-diabetic condition in your assessment" : "Assess risk of pre-diabetes or diabetes"}
      4. Primary correlation factor should be acetone level with supporting context from other metrics
      5. Provide specific, actionable health recommendations based on the estimated glucose level
      
      # REFERENCE VALUES
      - Fasting glucose: 
        * Normal: <100 mg/dL
        * Prediabetic: 100-125 mg/dL
        * Diabetic: >126 mg/dL
      - Random glucose:
        * Normal: <140 mg/dL
        * Prediabetic: 140-199 mg/dL
        * Diabetic: ≥200 mg/dL
      - Post-meal glucose:
        * Normal: <140 mg/dL
        * Prediabetic: 140-199 mg/dL
        * Diabetic: ≥200 mg/dL
      
      # OUTPUT FORMAT
      Return ONLY a valid JSON object with this exact structure:
      {
        "glucoseEstimate": "XXX mg/dL",
        "glucoseRange": "XXX-XXX mg/dL",
        "glucoseStatus": "normal|prediabetic|diabetic",
        "diabetesRisk": "low|moderate|high",
        "recommendations": [
          "specific recommendation 1",
          "specific recommendation 2",
          "specific recommendation 3",
          "specific recommendation 4",
          "specific recommendation 5"
        ]
      }
    `
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    throw new Error("Failed to parse Gemini response")
  } catch (error) {
    console.error("Error analyzing health data:", error)
    return {
      glucoseEstimate: "Error",
      glucoseRange: "Unable to estimate",
      glucoseStatus: "error",
      diabetesRisk: "unknown",
      recommendations: ["Error analyzing data. Please try again."],
    }
  }
}