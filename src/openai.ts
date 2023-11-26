import { OpenAI } from "openai";
import { TypoCorrectionModel } from "./model";

export function getOpenAiTypoCorrectionModel(openai: OpenAI): TypoCorrectionModel {
    return {
        getCorrection: async (originalText) => {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo-1106",
                temperature: 0.0,
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: originalText },
                ],
            }, { timeout: 10 * 1000 });

            const message = response.choices[0]?.message?.content;
            if (message === null) {
                throw new Error("No response message from OpenAI chat completion.");
            }
            return message?.trim() !== ""
                ? { kind: "fixed", text: message }
                : { kind: "no-typo" };
        }
    };
}

const systemMessage = `You are a typo correcting bot. Fix typos in the input text and return only the fixed text. If there is no typo, return empty string.
Input: "Im typoing this very fats"
Output: "I'm typing this very fast"

Input: "There's no typo here."
Output: ""`;
