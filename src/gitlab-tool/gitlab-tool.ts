import {Gitlab} from "gitlab";
import * as ko from "knockout";

class GitLabToolViewModel {
    public host: ko.Observable<string>;
    public token: ko.Observable<string>;
    public projects: ko.ObservableArray<any>;
    public milestones: ko.ObservableArray<any>;

    constructor(host: string, token: string) {
        if (host) {
            this.host = ko.observable(host);
        } else {
            this.host = ko.observable("https://gitlab.com");
        }
        this.token = ko.observable(token);
        this.projects = ko.observableArray();
        this.milestones = ko.observableArray();
    }

    public query() {
        $("#spinner").removeClass("d-none");
        const api = new Gitlab({
            host: this.host(),
            token: this.token(),
            url: "",
        });
        api.Projects.all()
        .then((projects: any) => {
            this.projects.removeAll();
            this.milestones.removeAll();
            projects.forEach((p: any) => {
                this.projects.push({
                    httpUrl: p.http_url_to_repo,
                    id: p.id,
                    name: p.name,
                    namespace: p.namespace.full_path,
                    sshUrl: p.ssh_url_to_repo,
                });
                api.ProjectMilestones.all(p.id)
                .then((milestones: any) => {
                    milestones.forEach((m: any) => {
                        this.milestones.push({
                            dueDate: m.due_date,
                            id: m.id,
                            projectId: p.id,
                            projectName: p.name,
                            startDate: m.start_date,
                            state: m.state,
                            title: m.title,
                        });
                    });
                }, (reason) => {
                    // do nothing
                });
            });
            $("#spinner").addClass("d-none");
        }, (reason) => {
            $("#spinner").addClass("d-none");
        });
    }
}

ko.applyBindings(new GitLabToolViewModel(window.localStorage.getItem("gitlab-tool.url"),
    window.localStorage.getItem("gitlab-tool.token")));

$("#host").on("input", (e) => {
    window.localStorage.setItem("gitlab-tool.url", (e.target as HTMLInputElement).value);
});

$("#token").on("input", (e) => {
    window.localStorage.setItem("gitlab-tool.token", (e.target as HTMLInputElement).value);
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
