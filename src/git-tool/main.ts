import * as spawn from "child_process";
import CodeMirror from "codemirror";
import "codemirror/mode/shell/shell";
import * as fs from "fs";
import * as path from "path";
import * as xterm from "xterm";

const code = CodeMirror.fromTextArea(document.getElementById("commands") as HTMLTextAreaElement, {
    lineNumbers: true,
    mode: "shell",
});
code.setSize(null, "100");
$(".CodeMirror").addClass("border border-primary rounded")
    .css("font-size", "large");
CodeMirror.on(code.getDoc(), "change", (instance, change) => {
    window.localStorage.setItem("git-tool.commands", code.getValue());
});

const term = new xterm.Terminal();
term.setOption("convertEol", true);
term.resize(80, 30);
term.open(document.getElementById("log"));
$(".xterm").addClass("border border-secondary rounded");

$(document).ready(() => {
    scan(window.localStorage.getItem("git-tool.rootFolder"));
    code.setValue(window.localStorage.getItem("git-tool.commands") || "status");
    term.write(window.localStorage.getItem("git-tool.log"));
});

let rootFolder: string;

$("#rootFolder").on("change", (e) => {
    if ((e.target as HTMLInputElement).files[0] == null) {
        return;
    }
    rootFolder = (e.target as HTMLInputElement).files[0].path;
    window.localStorage.setItem("git-tool.rootFolder", rootFolder);
    scan(rootFolder);
});

function scan(root: string) {
    if (root == null) {
        return;
    }
    $("label[for='rootFolder']").text(root);
    $("#folders").empty();
    const selected = JSON.parse(window.localStorage.getItem("git-tool.selectedFolders")) as string[];
    find(root, (value: string) => {
        const option = $("<option>").text(value).attr("value", value);
        if (selected && selected.indexOf(value) !== -1) {
            option.attr("selected", "");
        }
        $("#folders").append(option);
    });
}

function find(folder: string, found: (folder: string) => void) {
    fs.access(path.join(folder, ".git"), fs.constants.F_OK, (err) => {
        if (!err) {
            found(folder);
        } else {
            fs.readdir(folder, {withFileTypes: true}, (dirErr: any, files) => {
                files.forEach((f: any) => {
                    if (f.isDirectory()) {
                        find(path.join(folder, f.name), found);
                    }
                });
            });
        }
    });
}

$("#folders").on("input", (e) => {
    const selected = new Array();
    $("#folders option:selected").each((index, option) => {
        selected.push((option as HTMLInputElement).value);
    });
    window.localStorage.setItem("git-tool.selectedFolders", JSON.stringify(selected));
});

function getSelectedCommands() {
    let commands = code.getDoc().getSelection();
    if (commands === "") {
        commands = code.getValue();
    }
    return commands.split("\n");
}

$("#run").on("click", (e) => {
    $("#spinner").removeClass("d-none");
    const config = {
        commands: new Array(),
        completed: () => {
            $("#spinner").addClass("d-none");
        },
        executed: (result: any) => {
            let s = `${(new Date()).toISOString()} ${result.command.folder}\n`;
            s += `$ ${result.command.command}\n${result.output}\n`;
            term.write(s);
            window.localStorage.setItem("git-tool.log",
                window.localStorage.getItem("git-tool.log") + s);
        },
    };
    $("#folders option:selected").each((index, option) => {
        config.commands = config.commands.concat(buildGitCommands((option as HTMLInputElement).value));
    });
    config.commands.reverse();
    process(config);
});

function buildGitCommands(folder: string): any {
    const commands: any = [];
    getSelectedCommands().forEach((c: string) => {
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

function process(config: any) {
    if (config.commands.length === 0) {
        config.completed();
        return;
    }
    const command = config.commands.pop();
    if (command.command.indexOf("git clone") !== -1) {
        config.executed({command,
            output: "\x1B[1;3;31mSkipping clone command. Please use submodule command instead.\x1B[0m\n"});
        process(config);
    } else {
        execute(command.folder, command.command)
        .then((value: string) => {
            config.executed({command, output: value});
            process(config);
        });
    }
}

function execute(folder: string, command: string) {
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

$("#clear").on("click", (e) => {
    term.clear();
    window.localStorage.setItem("git-tool.log", "");
});
