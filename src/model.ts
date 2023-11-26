export interface TypoCorrectionModel {
    getCorrection(text: string): Promise<TypoCorrection>;
}

type TypoCorrection = TypoFixed | NoTypo;

interface TypoFixed {
    kind: 'fixed';
    text: string;
}

interface NoTypo {
    kind: 'noTypo';
}
