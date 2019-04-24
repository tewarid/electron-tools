import {Gitlab} from "gitlab";

$("#back").on("click", () => {
    window.history.back();
});

$(document).ready(() => {
    const url = window.localStorage.getItem("gitlab-tool.url");
    if (url) {
        $("#host").val(url);
    }
    const token = window.localStorage.getItem("gitlab-tool.token");
    if (token) {
        $("#token").val(token);
    }
});

$("#host").on("input", (e) => {
    window.localStorage.setItem("gitlab-tool.url", (e.target as HTMLInputElement).value);
});

$("#token").on("input", (e) => {
    window.localStorage.setItem("gitlab-tool.token", (e.target as HTMLInputElement).value);
});

$("#query").on("click", () => {
    $("#spinner").removeClass("d-none");
    const api = new Gitlab({
        host: $("#host").val().toString(),
        token: $("#token").val().toString(),
    });
    api.Projects.all()
    .then((projects: any) => {
        $("#projects tbody").empty();
        projects.forEach((p: any) => {
            api.ProjectMilestones.all(p.id, {})
            .then((milestones: any) => {
                let row = $("#projects tbody").append($("<tr>"));
                row.append($("<td>").text(p.id));
                row.append($("<td>").text(p.name));
                row.append($("<td>").text(p.namespace.full_path));
                row.append($("<td>").text(p.http_url_to_repo));
                row.append($("<td>").text(p.ssh_url_to_repo));
                milestones.forEach((m: any) => {
                    row = $("#milestones tbody").append($("<tr>"));
                    row.append($("<td>").text(m.id));
                    row.append($("<td>").text(m.title));
                    row.append($("<td>").text(p.name));
                    row.append($("<td>").text(m.state));
                    row.append($("<td>").text(m.due_date));
                    row.append($("<td>").text(m.start_date));
                });
            });
        });
        $("#spinner").addClass("d-none");
    });
});

$("#viewProjects").on("change", (e) => {
    if ((e.target as HTMLInputElement).checked) {
        $("#projects").removeClass("d-none");
        $("#milestones").addClass("d-none");
    }
});

$("#viewMilestones").on("change", (e) => {
    if ((e.target as HTMLInputElement).checked) {
        $("#projects").addClass("d-none");
        $("#milestones").removeClass("d-none");
    }
});
