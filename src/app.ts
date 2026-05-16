import express, { Request, Response } from "express"
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv"
import cors from "cors";



dotenv.config();
const app = express()
const port = process.env.PORT;
app.use(express.json())
app.use(cors())

const ai = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY!,
});

app.get("/", () => {
    console.log("hellllo subIn")
})

app.post("/api/generate-questions", async (req: Request , res: Response) => {
    try {
			const { jobTitle } = req.body;
			if (!jobTitle || typeof jobTitle !== "string") {
				return res
					.status(400)
					.json({ error: "job title is required and must be a string" });
			}

			//clean jobtitle
			const cleanJobTitle = jobTitle.trim();

			const prompt = `Generate 3 thoughtful, challenging interview questions for a ${cleanJobTitle} position. 
        The questions should:
        - Test both technical skills and soft skills
        - Be role-specific and practical
        - Include behavioral questions when relevant
        - Be open-ended to encourage detailed responses
        
        Format the response as a JSON array of strings. For example:
        ["Question 1", "Question 2", "Question 3"]`;

			const response = await ai.models.generateContent({
				model: "gemini-3-flash-preview",
				contents: [
					{
						parts: [{ text: prompt }],
					},
				],
			});
			// Parse the response
			const responseText =
				(response.text || response.candidates?.[0]?.content?.parts?.[0]?.text) ?? "";

			let questions: string[];
			try {
				questions = JSON.parse(responseText);
			} catch {
				// If not valid JSON, split by newlines and clean up
				questions = responseText
					.split("\n")
					.filter((line) => line.trim().length > 0)
					.map((line) => line.replace(/^\d+\.\s*/, "").trim());
			}

			// Ensure we have exactly 3 questions
			const finalQuestions = questions.slice(0, 3);

			res.json({
				success: true,
				jobTitle: cleanJobTitle,
				questions: finalQuestions,
			});
		} catch (error: any) {
			console.error("Gemini API error:", error);
			res.status(500).json({
				success: false,
				error: "Failed to generate questions. Please try again.",
				details: error.message,
			});
		}
});


app.listen(port, () => {
    console.log("app listening on port", port)
})

