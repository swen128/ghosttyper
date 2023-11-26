import { OpenAI } from "openai";
import { TypoCorrectionModel } from "./model";

export function getOpenAiTypoCorrectionModel(openai: OpenAI): TypoCorrectionModel {
    return {
        getCorrection: async (originalText) => {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo-1106",
                temperature: 0.0,
                seed: 0,
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: JSON.stringify({ originalText }) },
                ],
            }, { timeout: 10 * 1000 });

            const message = response.choices[0]?.message?.content;

            if (message === null) {
                throw new Error("No response message from OpenAI chat completion API.");
            }

            const json = JSON.parse(message);

            return json.fixed !== undefined
                ? { kind: "fixed", text: json.fixed }
                : { kind: "noTypo" };
        }
    };
}

const systemMessage = `Spot any typos in the "originalText".
Respond with a JSON of the type \`{ fixed?: string }\`.
Return {} if you find no typo.`;
