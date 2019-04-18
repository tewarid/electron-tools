$("#back").on("click", () => {
    window.history.back()
})

$(document).ready(() => {
    var url = window.localStorage.getItem("gitlab-tool.url")
    if (url) {
        $("#url").val(url)
    }
    var token = window.localStorage.getItem("gitlab-tool.token")
    if (token) {
        $("#token").val(token)
    }
})

$("#url").on("input", (e) => {
    window.localStorage.setItem("gitlab-tool.url", e.target.value)
})

$("#token").on("input", (e) => {
    window.localStorage.setItem("gitlab-tool.token", e.target.value)
})

$("#query").on("click", () => {
    $("#spinner").removeClass("d-none")
    var GitLab = require('gitlab/dist/es5').default
    var api = new GitLab({
        url: $("#url").val(),
        token: $("#token").val()
    })
    api.Projects.all()
    .then((projects) => {
        $("#projects tbody").empty()
        projects.forEach(p => {
            api.ProjectMilestones.all(p.id)
            .then((milestones) => {
                var row = $("#projects tbody").append($("<tr>"))
                row.append($("<td>").text(p.id))
                row.append($("<td>").text(p.name))
                row.append($("<td>").text(p.namespace.full_path))
                row.append($("<td>").text(p.http_url_to_repo))
                row.append($("<td>").text(p.ssh_url_to_repo))
                milestones.forEach(m => {
                    var row = $("#milestones tbody").append($("<tr>"))
                    row.append($("<td>").text(m.id))
                    row.append($("<td>").text(m.title))
                    row.append($("<td>").text(p.name))
                    row.append($("<td>").text(m.state))
                    row.append($("<td>").text(m.due_date))
                    row.append($("<td>").text(m.start_date))
                })
            })
        });
        $("#spinner").addClass("d-none")
    })
})

$("#viewProjects").on("change", (e) => {
    if (e.target.checked) {
        $("#projects").removeClass("d-none")
        $("#milestones").addClass("d-none")    
    }
})

$("#viewMilestones").on("change", (e) => {
    if (e.target.checked) {
        $("#projects").addClass("d-none")
        $("#milestones").removeClass("d-none")
    }
})
