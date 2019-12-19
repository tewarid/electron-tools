import * as spawn from "child_process";
import CodeMirror from "codemirror";
import "codemirror/mode/shell/shell";
import * as fs from "fs";
import * as ko from "knockout";
import * as path from "path";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { ViewModelBase } from "../ko/common";

const code = CodeMirror.fromTextArea(document.getElementById("commands") as HTMLTextAreaElement, {
    lineNumbers: true,
    mode: "shell",
});
code.setSize(null, "100");
$(".CodeMirror").addClass("border border-primary rounded").css("font-size", "large").css("height", "90%");

const term = new Terminal();
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.setOption("convertEol", true);
term.open(document.getElementById("log"));
$(".xterm").addClass("border border-secondary rounded");
fitAddon.fit();

$(window).resize(() => {
    fitAddon.fit();
});

class MainViewModel extends ViewModelBase {
    private readonly replacer: string[] = [
        "rootFolder",
        "gitFolders",
        "selectedFolders",
        "gitCommands",
        "log"];
    private busy: ko.Observable<boolean>;
    private rootFolder: ko.Observable<string>;
    private gitFolders: ko.ObservableArray<string>;
    private selectedFolders: ko.ObservableArray<string>;
    private gitCommands: ko.Observable<string>;
    private log: ko.Observable<string>;

    constructor() {
        super();
        ViewModelBase.prefix = "git-tool";
        this.typeName = "MainViewModel";
        this.busy = ko.observable<boolean>(false);
        const saved = this.read();
        this.rootFolder = ko.observable<string>(saved.rootFolder);
        this.gitFolders = ko.observableArray<string>(saved.gitFolders);
        this.selectedFolders = ko.observableArray<string>(saved.selectedFolders);
        this.gitCommands = ko.observable<string>(saved.gitCommands);
        this.log = ko.observable<string>(saved.log);
        CodeMirror.on(code.getDoc(), "change", (instance, change) => {
            this.gitCommands(code.getValue());
        });
        code.setValue(this.gitCommands() || "status");
        term.write(this.log() || "");
    }

    protected save(): void {
        super.save(this.replacer);
    }

    private setRootFolder(folder: string) {
        this.rootFolder(folder);
        this.scan(this.rootFolder());
        this.save();
    }

    private scan(root: string) {
        if (root == null) {
            return;
        }
        this.gitFolders.removeAll();
        this.find(root, (folder: string) => {
            this.gitFolders.push(folder);
        });
        const copy = this.selectedFolders.slice(0);
        this.selectedFolders.removeAll();
        copy.forEach((value: string) => {
            this.selectedFolders.push(value);
        });
    }

    private find(folder: string, found: (folder: string) => void) {
        try {
            fs.accessSync(path.join(folder, ".git"), fs.constants.F_OK);
            found(folder);
        } catch {
            const files = fs.readdirSync(folder, {withFileTypes: true});
            files.forEach((f: any) => {
                if (f.isDirectory()) {
                    this.find(path.join(folder, f.name), found);
                }
            });
        }
    }

    private runCommands() {
        this.busy(true);
        const config = {
            commands: new Array(),
            completed: () => {
                this.busy(false);
                this.save();
            },
            executed: (result: any) => {
                let s = `${(new Date()).toISOString()} ${result.command.folder}\n`;
                s += `$ ${result.command.command}\n${result.output}\n`;
                term.write(s);
                this.log(this.log() + s);
            },
        };
        this.selectedFolders().forEach((folder) => {
            config.commands = config.commands
                .concat(this.buildGitCommands(folder));
        });
        config.commands.reverse();
        this.process(config);
    }

    private getSelectedCommands(): string[] {
        let commands = code.getDoc().getSelection();
        if (commands === "") {
            commands = code.getValue();
        }
        return commands.split("\n");
    }

    private buildGitCommands(folder: string): any {
        const commands: any = [];
        this.getSelectedCommands().forEach((c: string) => {
            if (c.trim() === "") {
                return;
            }
            commands.push({
                command: "git " + c,
                folder,
            });
        });
        return commands;
    }

    private process(config: any) {
        if (config.commands.length === 0) {
            config.completed();
            return;
        }
        const command = config.commands.pop();
        if (command.command.indexOf("git clone") !== -1) {
            config.executed({command,
                output: "\x1B[1;3;31mSkipping clone command. Please use submodule command instead.\x1B[0m\n"});
            this.process(config);
        } else {
            this.execute(command.folder, command.command)
            .then((value: string) => {
                config.executed({command, output: value});
                this.process(config);
            });
        }
    }

    private execute(folder: string, command: string) {
        return new Promise((resolve) => {
            let output: string = "";
            const proc = spawn.exec(command, {cwd: folder});
            proc.stdout.on("data", (data) => {
                output += data;
            });
            proc.stderr.on("data", (data) => {
                output += data;
            });
            proc.on("close", () => {
                resolve(output);
            });
        });
    }

    private clearTerminal() {
        term.clear();
        this.log("");
        this.save();
    }
}

ko.applyBindings(new MainViewModel());
