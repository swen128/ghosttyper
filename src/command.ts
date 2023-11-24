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
    const result = await model.getCorrection(originalText);
    return new vscode.TextEdit(range, result.text);
}
