// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

let taskProvider: vscode.Disposable | undefined;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let ca65Promise: Thenable<vscode.Task[]> | undefined = undefined;
	let ca65ConfigWatcher = vscode.workspace.createFileSystemWatcher("**/*.cfg");
	ca65ConfigWatcher.onDidChange(() => ca65Promise = undefined);
	ca65ConfigWatcher.onDidCreate(() => ca65Promise = undefined);
	ca65ConfigWatcher.onDidChange(() => ca65Promise = undefined);

	taskProvider = vscode.tasks.registerTaskProvider('ca65', {
		provideTasks: () => {
			if (!ca65Promise) {
				ca65Promise = getAssemblerTasks();
			}
			return ca65Promise;
		},
		resolveTask(_task: vscode.Task): vscode.Task | undefined {
			return undefined;
		}
	});

}

// this method is called when your extension is deactivated
export function deactivate() {
	if (taskProvider) {
		taskProvider.dispose();
	}
}

interface AssemblerTaskDefinition extends vscode.TaskDefinition {
	config: string | undefined;
}

async function getAssemblerTasks(): Promise<vscode.Task[]> {

	let tasks: vscode.Task[] = [];

	let editor = vscode.window.activeTextEditor;
	if (editor && editor.document && editor.document.fileName && vscode.workspace.rootPath) {

		let cfgs = await vscode.workspace.findFiles("*.cfg");
		for (let cfg of cfgs) {

			let buildConfig = path.relative(vscode.workspace.rootPath, cfg.fsPath);
			let buildTaskDef: AssemblerTaskDefinition = { type: "ca65", config: buildConfig };
			let buildTask = new vscode.Task(buildTaskDef, vscode.TaskScope.Workspace, `Build with ${buildConfig}`, "ca65", 
				new vscode.ShellExecution(`cl65 "${editor.document.fileName}" -C "${buildConfig}"`), [ "$ca65", "$ld65", "$ld65-unresolved", "$ld65-config" ]);
			buildTask.group = vscode.TaskGroup.Build;

			tasks.push(buildTask);		

		}

		let buildTaskDef: AssemblerTaskDefinition = { type: "ca65", config: undefined };
		let buildTask = new vscode.Task(buildTaskDef, vscode.TaskScope.Workspace, "Build without config", "ca65", 
			new vscode.ShellExecution(`cl65 ${editor.document.fileName}`), [ "$ca65", "$ld65", "$ld65-unresolved", "$ld65-config" ]);
		buildTask.group = vscode.TaskGroup.Build;

		tasks.push(buildTask);		
		
	}

	return tasks;
}