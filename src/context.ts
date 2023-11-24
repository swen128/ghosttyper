import OpenAI from "openai";
import { getOpenAiTypoCorrectionModel } from "./openai";
import { Result } from "./result";
import { Settings } from "./settings";
import { TypoCorrectionModel } from "./model";

export interface Context {
    getTypoCorrectionModel: () => Promise<Result<TypoCorrectionModel>>;
}

export const getDefaultContext = (settings: Settings): Context => {
    return {
        async getTypoCorrectionModel() {
            const apiKey = await settings.getOpenAiApiKey();
            if (apiKey === undefined) {
                return {
                    kind: 'err',
                    error: 'No OpenAI API key provided',
                };
            }

            const openai = new OpenAI({ apiKey });
            return {
                kind: 'ok',
                value: getOpenAiTypoCorrectionModel(openai),
            };
        }
    };
};
