import * as vscode from 'vscode';
import { getDefaultContext } from './context';
import { getSettings } from './settings';
import { getTypoCorrectionCommand } from './command';

export async function activate(context: vscode.ExtensionContext) {
	const settings = getSettings(context);
	const appContext = getDefaultContext(settings);

	context.subscriptions.push(
		vscode.commands.registerCommand('ghosttyper.setOpenAiApiKey', settings.setOpenAiApiKey),
		vscode.commands.registerTextEditorCommand('ghosttyper.fixTypo', getTypoCorrectionCommand(appContext)),
	);
}

export function deactivate() { }
