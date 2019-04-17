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
    scanFolder(folder)
})

function scanFolder(folder) {
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
                        scanFolder(path.join(folder, f.name))
                    }
                })
            })        
        }
    })
}

$("#run").on("click", (e) => {
    $("#progress").css("width", "0%")
    var options = $("#folders option:selected")
    var i = 1;
    options.each((index, option) => {
        var spawn = require("child_process")
        var command = "git " + $("#commands").val()
        var output = ""
        var process = spawn.exec(command, {cwd: option.value})
        process.stdout.on("data", (data) => {
            output += data
        })
        process.stderr.on("data", (data) => {
            output += data            
        })
        process.on("close", () => {
            $("#log").prepend($("<pre>").text(`${option.value} $ ${command}\n${output}`))
            $("#progress").css("width", `${(i++)*100 / options.length}%`)
        })
    })
})

$("#clear").on("click", (e) => {
    $("#log").text("")
})
