import * as vscode from "vscode";

export interface Settings {
    /**
     * Get the OpenAI API key stored locally, or prompt the user to enter one.
     */
    getOpenAiApiKey: () => Promise<string | undefined>;
    
    /**
     * Prompt the user to enter an OpenAI API key and store it locally.
     */
    setOpenAiApiKey: () => Promise<string | undefined>;
}

export const getSettings = (context: vscode.ExtensionContext): Settings => {
    async function setOpenAiApiKey(): Promise<string | undefined> {
        const store = context.secrets;

        const key = await vscode.window.showInputBox({
            placeHolder: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
            prompt: "Enter your OpenAI API Key",
            ignoreFocusOut: true,
        });

        if (key !== undefined) {
            await store.store("openai.apiKey", key);
            return key;
        }
    }

    return {
        setOpenAiApiKey,

        async getOpenAiApiKey(): Promise<string | undefined> {
            const store = context.secrets;
            const savedKey = await store.get("openai.apiKey");
            return savedKey !== undefined ? savedKey : setOpenAiApiKey();
        }
    };
};
