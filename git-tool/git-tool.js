$("#back").on("click", () => {
    window.history.back()
})

$(document).ready(() => {
    scan(window.localStorage.getItem("git-tool.rootFolder"))
    $("#commands").text(window.localStorage.getItem("git-tool.commands"))
    $("#log").text(window.localStorage.getItem("git-tool.log"))
})

$("#rootFolder").on("change", (e) => {
    if (e.target.files[0] === undefined) {
        return
    }
    var folder = e.target.files[0].path
    window.localStorage.setItem("git-tool.rootFolder", folder)
    scan(folder)
})

function scan(folder) {
    if (folder === undefined) {
        return
    }
    $("label[for='rootFolder']").text(folder)
    $("#folders").empty()
    find(folder, (value) => {
        $("#folders").append($("<option>")
        .text(value)
        .attr("value", value))
    })
}

function find(folder, found) {
    var fs = require("fs")
    var path = require("path")
    fs.access(path.join(folder, ".git"), fs.constants.F_OK, (err) => {
        if (!err) {
            found(folder)
        } else {
            fs.readdir(folder, {withFileTypes: true}, (err, files) => {
                files.forEach((f) => {
                    if (f.isDirectory()) {
                        find(path.join(folder, f.name), found)
                    }
                })
            })        
        }
    })
}

$("#commands").on("input", (e) => {
    window.localStorage.setItem("git-tool.commands", e.target.value)
})

function getSelectedCommands() {
    var input = $("#commands")[0]
    var commands = input.value
    if (input.selectionStart !==  input.selectionEnd) {
        commands = commands.slice(input.selectionStart, input.selectionEnd)
    }
    return commands.split("\n")
}

$("#run").on("click", (e) => {
    $("#spinner").removeClass("d-none")
    var config = {
        commands: [],
        executed: (folder, command, output) => {
            $("#log").prepend(`${folder} $ ${command}\n${output}\n`)
        },
        completed: () => {
            $("#spinner").addClass("d-none")
            window.localStorage.setItem("git-tool.log", $("#log").text())
        }
    }
    $("#folders option:selected").each((index, option) => {
        getSelectedCommands().forEach((c) => {
            if (c.trim() === "") {
                return
            }
            config.commands.push({
                folder: option.value,
                command: "git " + c,
            })
        })
    })
    config.commands.reverse()
    process(config)
})

function process(config) {
    if (config.commands.length == 0) {
        config.completed()
        return
    }
    var command = config.commands.pop()
    execute(command.folder, command.command)
    .then((value) => {
        config.executed(command.folder, command.command, value)
        process(config)
    })
}

function execute(folder, command) {
    return promise = new Promise(function(resolve) {
        var spawn = require("child_process")
        var output = ""
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
