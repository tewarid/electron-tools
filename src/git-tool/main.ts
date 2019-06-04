import * as spawn from "child_process";
import CodeMirror from "codemirror";
import "codemirror/mode/shell/shell";
import * as fs from "fs";
import * as ko from "knockout";
import * as path from "path";
import * as xterm from "xterm";
import { ViewModelBase } from "../ko/common";

class MainViewModel extends ViewModelBase {
    private code: CodeMirror.EditorFromTextArea;
    private term: xterm.Terminal;
    private busy: ko.Observable;
    private rootFolder: ko.Observable;
    private gitFolders: ko.ObservableArray;
    private selectedFolders: ko.ObservableArray;

    constructor() {
        ViewModelBase.prefix = "git-tool";
        super();
        this.typeName = "MainViewModel";
        this.busy = ko.observable(false);
        this.rootFolder = ko.observable("");
        this.gitFolders = ko.observableArray();
        this.selectedFolders = ko.observableArray();
        this.setRootFolder(window.localStorage.getItem("git-tool.rootFolder"));
        this.code = CodeMirror.fromTextArea(document.getElementById("commands") as HTMLTextAreaElement, {
            lineNumbers: true,
            mode: "shell",
        });
        this.code.setSize(null, "100");
        $(".CodeMirror").addClass("border border-primary rounded").css("font-size", "large");
        CodeMirror.on(this.code.getDoc(), "change", (instance, change) => {
            window.localStorage.setItem("git-tool.commands", this.code.getValue());
        });
        this.code.setValue(window.localStorage.getItem("git-tool.commands") || "status");
        this.term = new xterm.Terminal();
        this.term.setOption("convertEol", true);
        this.term.resize(80, 30);
        this.term.open(document.getElementById("log"));
        $(".xterm").addClass("border border-secondary rounded");
        this.term.write(window.localStorage.getItem("git-tool.log"));
    }

    private setRootFolder(folder: string) {
        this.rootFolder(folder);
        window.localStorage.setItem("git-tool.rootFolder", folder);
        this.scan(this.rootFolder());
    }

    private scan(root: string) {
        if (root == null) {
            return;
        }
        this.gitFolders.removeAll();
        this.find(root, (folder: string) => {
            this.gitFolders.push(folder);
        });
        this.selectedFolders.removeAll();
        JSON.parse(window.localStorage.getItem("git-tool.selectedFolders"))
        .forEach((value: string) => {
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
            },
            executed: (result: any) => {
                let s = `${(new Date()).toISOString()} ${result.command.folder}\n`;
                s += `$ ${result.command.command}\n${result.output}\n`;
                this.term.write(s);
                window.localStorage.setItem("git-tool.log",
                    window.localStorage.getItem("git-tool.log") + s);
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
        let commands = this.code.getDoc().getSelection();
        if (commands === "") {
            commands = this.code.getValue();
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
        this.term.clear();
        window.localStorage.removeItem("git-tool.log");
    }
}

ko.applyBindings(new MainViewModel());
