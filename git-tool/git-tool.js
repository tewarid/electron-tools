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
    $("#folders").empty()
    scan(folder)
})

function scan(folder) {
    var fs = require("fs")
    var path = require("path")
    var found = false
    fs.access(path.join(folder, ".git"), fs.constants.F_OK, (err) => {
        if (!err) {
            $("#folders").append($("<option>")
                .text(folder)
                .attr("value", folder))
        } else {
            fs.readdir(folder, {withFileTypes: true}, (err, files) => {
                files.forEach((f) => {
                    if (f.isDirectory()) {
                        scan(path.join(folder, f.name))
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
    var promises = []
    $("#folders option:selected").each((index, option) => {
        var commands = getSelectedCommands()
        commands.forEach((c) => {
            if (c.trim() === "") {
                return
            }
            var command = "git " + c
            var promise = execute(option.value, command)
            promises.push(promise)
            promise.then((value) => {
                $("#log").prepend($("<pre>").text(`${option.value} $ ${command}\n${value}`))
            })    
        })
    })
    Promise.all(promises).then(() => {
        $("#spinner").addClass("d-none")
    })
})

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
