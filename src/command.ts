import * as vscode from 'vscode';
import type { Context } from './context';
import type { TypoCorrectionModel } from './model';

export const getTypoCorrectionCommand = (ctx: Context) => (editor: vscode.TextEditor) => {
    fixTypo(ctx, editor).catch(console.error);
};

async function fixTypo(ctx: Context, editor: vscode.TextEditor) {
    const document = editor.document;
    const range = getRequestedRange(editor);

    if (document.getText(range).trim().length === 0) {
        return;
    }

    const result = await ctx.getTypoCorrectionModel();
    if (result.kind === 'err') {
        vscode.window.showErrorMessage(result.error);
        return;
    }
    const model = result.value;

    const decorationType = vscode.window.createTextEditorDecorationType({
        borderWidth: '1px',
        borderStyle: 'solid',
        overviewRulerColor: 'blue',
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        light: {
            borderColor: 'darkblue'
        },
        dark: {
            borderColor: 'lightblue'
        }
    });
    editor.setDecorations(decorationType, [{
        range,
        hoverMessage: "AI is working on here..."
    }]);

    try {
        const edit = await typoCorrection(model, document, range);
        await editor.edit(builder => builder.replace(edit.range, edit.newText));
    } catch (e) {
        console.error(e);
        vscode.window.showErrorMessage("Request to AI failed.");
    } finally {
        decorationType.dispose();
    }
}

function getRequestedRange(editor: vscode.TextEditor): vscode.Range {
    if (!editor.selection.isEmpty) {
        return new vscode.Range(editor.selection.start, editor.selection.end);
    }
    const currentLine = editor.document.lineAt(editor.selection.active.line);
    return new vscode.Range(currentLine.range.start, currentLine.range.end);
}

async function typoCorrection(model: TypoCorrectionModel, document: vscode.TextDocument, range: vscode.Range): Promise<vscode.TextEdit> {
    const originalText = document.getText(range);

    // LLM tends to trim leading and trailing spaces, breaking indents.
    // To avoid that, we trim the text manually and re-add the spaces later.
    const { leadingSpaces, trailingSpaces, trimmed } = trim(originalText);
    const result = await model.getCorrection(trimmed);
    
    switch (result.kind) {
        case 'no-typo':
            return new vscode.TextEdit(range, originalText);
        case 'fixed':
            return new vscode.TextEdit(range, leadingSpaces + result.text + trailingSpaces);
    }
}

function trim(string: string): { leadingSpaces: string, trailingSpaces: string, trimmed: string } {
    const leadingSpaces = string.match(/^\p{Z}*/u)?.[0] ?? "";
    const trailingSpaces = string.match(/\p{Z}*$/u)?.[0] ?? "";
    const trimmed = string.trim();
    return { leadingSpaces, trailingSpaces, trimmed };
}
