import * as fs from "fs"
import * as path from "path"
import * as spawn from "child_process"

$("#back").on("click", () => {
    window.history.back()
})

$(document).ready(() => {
    scan(window.localStorage.getItem("git-tool.rootFolder"))
    $("#commands").text(window.localStorage.getItem("git-tool.commands"))
    $("#log").text(window.localStorage.getItem("git-tool.log"))
})

$("#rootFolder").on("change", (e) => {
    if ((<HTMLInputElement>e.target).files[0] == null) {
        return
    }
    var folder = (<HTMLInputElement>e.target).files[0].path
    window.localStorage.setItem("git-tool.rootFolder", folder)
    scan(folder)
})

function scan(folder: string) {
    if (folder == null) {
        return
    }
    $("label[for='rootFolder']").text(folder)
    $("#folders").empty()
    find(folder, (value: string) => {
        $("#folders").append($("<option>")
        .text(value)
        .attr("value", value))
    })
}

function find(folder: string, found: Function) {
    fs.access(path.join(folder, ".git"), fs.constants.F_OK, (err) => {
        if (!err) {
            found(folder)
        } else {
            fs.readdir(folder, {withFileTypes: true}, (err: any, files) => {
                files.forEach((f: any) => {
                    if (f.isDirectory()) {
                        find(path.join(folder, f.name), found)
                    }
                })
            })        
        }
    })
}

$("#commands").on("input", (e) => {
    window.localStorage.setItem("git-tool.commands", (<HTMLInputElement>e.target).value)
})

function getSelectedCommands() {
    var input = <HTMLInputElement>$("#commands")[0]
    var commands = input.value
    if (input.selectionStart !==  input.selectionEnd) {
        commands = commands.slice(input.selectionStart, input.selectionEnd)
    }
    return commands.split("\n")
}

class Command {
    command: string;
    folder: string;
}

class Config {
    commands: Command[] = new Array()
    executed(folder: string, command: string, output: string) {
        $("#log").prepend(`$ ${command}\n${output}\n`)
        $("#log").prepend(`${(new Date()).toISOString()} ${folder}\n`)
    }
    completed() {
        $("#spinner").addClass("d-none")
        window.localStorage.setItem("git-tool.log", $("#log").text())
    }
}

$("#run").on("click", (e) => {
    $("#spinner").removeClass("d-none")
    var config = new Config()
    $("#folders option:selected").each((index, option) => {
        getSelectedCommands().forEach((c: string) => {
            if (c.trim() === "") {
                return
            }
            config.commands.push({
                command: "git " + c,
                folder: (<HTMLInputElement>option).value
            })
        })
    })
    config.commands.reverse()
    process(config)
})

function process(config: Config) {
    if (config.commands.length == 0) {
        config.completed()
        return
    }
    var command = config.commands.pop()
    execute(command.folder, command.command)
    .then((value: string) => {
        config.executed(command.folder, command.command, value)
        process(config)
    })
}

function execute(folder: string, command: string) {
    return new Promise(function(resolve) {
        var output: string = ""
        var process = spawn.exec(command, {cwd: folder})
        process.stdout.on("data", (data) => {
            output += data
        })
        process.stderr.on("data", (data) => {
            output += data            
        })
        process.on("close", () => {
            resolve(output)
        })
    });
}

$("#clear").on("click", (e) => {
    $("#log").text("")
    window.localStorage.setItem("git-tool.log", "")
})
