export interface TypoCorrectionModel {
    getCorrection(text: string): Promise<TypoCorrection>;
}

interface TypoCorrection {
    text: string;
}
