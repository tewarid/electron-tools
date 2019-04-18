$("#back").on("click", () => {
    window.history.back()
})

$(document).ready(() => {

})

$("#rootFolder").on("change", (e) => {
    if (e.target.files[0] === undefined) {
        return
    }    
    var folder = e.target.files[0].path
    $("label[for='rootFolder']").text(folder)
    $("#folders").empty()
    scan(folder, (value) => {
        $("#folders").append($("<option>")
        .text(value)
        .attr("value", value))
    })
})

function scan(folder, found) {
    var fs = require("fs")
    var path = require("path")
    fs.access(path.join(folder, ".git"), fs.constants.F_OK, (err) => {
        if (!err) {
            found(folder)
        } else {
            fs.readdir(folder, {withFileTypes: true}, (err, files) => {
                files.forEach((f) => {
                    if (f.isDirectory()) {
                        scan(path.join(folder, f.name), found)
                    }
                })
            })        
        }
    })
}

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
            $("#log").prepend($("<pre>")
            .text(`${folder} $ ${command}\n${output}`))
        },
        completed: () => {
            $("#spinner").addClass("d-none")
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
    var command = config.commands.pop()
    execute(command.folder, command.command)
    .then((value) => {
        config.executed(command.folder, command.command, value)
        if (config.commands.length > 0) {
            process(config)
        } else {
            config.completed()
        }
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
})
