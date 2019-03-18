// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

let taskProvider: vscode.Disposable | undefined;
let linkerConfigWatcher: vscode.FileSystemWatcher | undefined;
let assemblyConfigWatcher: vscode.FileSystemWatcher | undefined;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let workspaceRoot = vscode.workspace.rootPath;
	if (workspaceRoot) {

		let ca65Promise: Thenable<vscode.Task[]> | undefined = undefined;

		linkerConfigWatcher = vscode.workspace.createFileSystemWatcher("**/*.cfg");
		linkerConfigWatcher.onDidChange(() => ca65Promise = undefined);
		linkerConfigWatcher.onDidCreate(() => ca65Promise = undefined);
		linkerConfigWatcher.onDidDelete(() => ca65Promise = undefined);

		assemblyConfigWatcher = vscode.workspace.createFileSystemWatcher(path.join(workspaceRoot, "ca65config.json"));
		assemblyConfigWatcher.onDidChange(() => ca65Promise = undefined);
		assemblyConfigWatcher.onDidCreate(() => ca65Promise = undefined);
		assemblyConfigWatcher.onDidDelete(() => ca65Promise = undefined);

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
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (assemblyConfigWatcher) {
		assemblyConfigWatcher.dispose();
	}
	if (linkerConfigWatcher) {
		linkerConfigWatcher.dispose();
	}
	if (taskProvider) {
		taskProvider.dispose();
	}
}

interface AssemblerTaskDefinition extends vscode.TaskDefinition {
	config: string | undefined;
}

interface AssemblerConfigurationDefinition {
	verbose: boolean | undefined;
}

function getAssemblerCommandLine(fileName: string, linkerConfig: string | undefined, assemblyConfig: AssemblerConfigurationDefinition | undefined): string {
	let cli = `cl65 "${fileName}"`;
	if (linkerConfig) {
		cli += ` -C "${linkerConfig}"`;
	}
	if (assemblyConfig) {
		if (assemblyConfig.verbose || false) {
			cli += ` --verbose`;
		}
	}
	return cli;
}

async function getAssemblerTasks(): Promise<vscode.Task[]> {

	let tasks: vscode.Task[] = [];
	let assemblerConfig: AssemblerConfigurationDefinition | undefined = undefined;

	let editor = vscode.window.activeTextEditor;
	if (editor && editor.document && editor.document.fileName) {

		if (vscode.workspace.rootPath) {

			try
			{
				const readFile = util.promisify(fs.readFile);
				const readFileData = await readFile(path.join(vscode.workspace.rootPath || "", "ca65config.json"), "utf-8");
				assemblerConfig = JSON.parse(readFileData);
			}
			catch (err) { }		

			let cfgs = await vscode.workspace.findFiles("**/*.cfg");
			for (let cfg of cfgs) {
	
				let buildLinkerConfigFile = path.relative(vscode.workspace.rootPath, cfg.fsPath);
				let buildTaskDef: AssemblerTaskDefinition = { type: "ca65", config: buildLinkerConfigFile };
				let buildTask = new vscode.Task(buildTaskDef, vscode.TaskScope.Workspace, `Build with ${buildLinkerConfigFile}`, "ca65", 
					new vscode.ShellExecution(getAssemblerCommandLine(editor.document.fileName, buildLinkerConfigFile, assemblerConfig)), [ "$ca65", "$ld65", "$ld65-unresolved", "$ld65-config" ]);
				buildTask.group = vscode.TaskGroup.Build;
	
				tasks.push(buildTask);		
	
			}	

		}

		let buildTaskDef: AssemblerTaskDefinition = { type: "ca65", config: undefined };
		let buildTask = new vscode.Task(buildTaskDef, vscode.TaskScope.Workspace, "Build without config", "ca65", 
			new vscode.ShellExecution(getAssemblerCommandLine(editor.document.fileName, undefined, assemblerConfig)), [ "$ca65", "$ld65", "$ld65-unresolved", "$ld65-config" ]);
		buildTask.group = vscode.TaskGroup.Build;

		tasks.push(buildTask);		
		
	}

	return tasks;
}