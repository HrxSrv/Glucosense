"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

export async function analyzeHealthData(heartRate: number, spO2: number, acetone: number) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `
      You are given Spo2 Heart Rate and Acetone Voltage Value from MQ138 sensor so convert this to ppm to judge actual bloo sugar level.
      You are a health analysis expert. Your task is to analyze the provided health metrics and provide an estimated blood glucose range and health recommendations.
      Analyze the following health metrics and provide an estimated blood glucose range and health recommendations:
      - Heart Rate: ${heartRate} bpm
      - SpO2: ${spO2}%
      -  Acetone Mq138 voltage reading: ${acetone}
      - give high preferance to Acetone Value.
      Based on these values, please provide:
      1. An estimated blood glucose range in mg/dL rnge should be tight +-10
      2. 3-5 health recommendations based on these values
      
      Format your response as JSON with the following structure:
      {
        "glucoseRange": "estimated range in mg/dL",
        "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
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
      glucoseRange: "Unable to estimate",
      recommendations: ["Error analyzing data. Please try again."],
    }
  }
}
