import * as spawn from "child_process";
import * as fs from "fs";
import * as path from "path";

$("#back").on("click", () => {
    window.history.back();
});

$(document).ready(() => {
    scan(window.localStorage.getItem("git-tool.rootFolder"));
    $("#commands").text(window.localStorage.getItem("git-tool.commands"));
    $("#log").text(window.localStorage.getItem("git-tool.log"));
});

$("#rootFolder").on("change", (e) => {
    if ((e.target as HTMLInputElement).files[0] == null) {
        return;
    }
    const folder = (e.target as HTMLInputElement).files[0].path;
    window.localStorage.setItem("git-tool.rootFolder", folder);
    scan(folder);
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

$("#commands").on("input", (e) => {
    window.localStorage.setItem("git-tool.commands", (e.target as HTMLInputElement).value);
});

function getSelectedCommands() {
    const input = $("#commands")[0] as HTMLInputElement;
    let commands = input.value;
    if (input.selectionStart !==  input.selectionEnd) {
        commands = commands.slice(input.selectionStart, input.selectionEnd);
    }
    return commands.split("\n");
}

$("#run").on("click", (e) => {
    $("#spinner").removeClass("d-none");
    const config = {
        commands: new Array(),
        completed: () => {
            $("#spinner").addClass("d-none");
            window.localStorage.setItem("git-tool.log", $("#log").text());
        },
        executed: (folder: string, command: string, output: string) => {
            $("#log").prepend(`$ ${command}\n${output}\n`);
            $("#log").prepend(`${(new Date()).toISOString()} ${folder}\n`);
        },
    };
    $("#folders option:selected").each((index, option) => {
        getSelectedCommands().forEach((c: string) => {
            if (c.trim() === "") {
                return;
            }
            config.commands.push({
                command: "git " + c,
                folder: (option as HTMLInputElement).value,
            });
        });
    });
    config.commands.reverse();
    process(config);
});

function process(config: any) {
    if (config.commands.length === 0) {
        config.completed();
        return;
    }
    const command = config.commands.pop();
    execute(command.folder, command.command)
    .then((value: string) => {
        config.executed(command.folder, command.command, value);
        process(config);
    });
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
    $("#log").text("");
    window.localStorage.setItem("git-tool.log", "");
});
