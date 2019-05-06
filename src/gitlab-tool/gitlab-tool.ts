import {Gitlab} from "gitlab";
import * as ko from "knockout";

class GitLabToolViewModel {
    public host: ko.Observable<string>;
    public token: ko.Observable<string>;
    public projects: ko.ObservableArray<any>;
    public milestones: ko.ObservableArray<any>;
    public busy: ko.Observable<boolean>;

    constructor(host: string, token: string) {
        if (host) {
            this.host = ko.observable(host);
        } else {
            this.host = ko.observable("https://gitlab.com");
        }
        this.token = ko.observable(token);
        this.projects = ko.observableArray();
        this.milestones = ko.observableArray();
        this.busy = ko.observable(false);
    }

    public query() {
        this.busy(true);
        const api = new Gitlab({
            host: this.host(),
            token: this.token(),
        });
        api.Projects.all()
        .then((projects: any) => {
            this.projects.removeAll();
            this.milestones.removeAll();
            projects.forEach((p: any) => {
                this.projects.push(p);
                api.ProjectMilestones.all(p.id)
                .then((milestones: any) => {
                    milestones.forEach((m: any) => {
                        m.projectName = p.name;
                        this.milestones.push(m);
                    });
                }, (reason) => {
                    // do nothing
                });
            });
            this.busy(false);
        }, (reason) => {
            this.busy(false);
        });
    }

    public viewProjects(e: HTMLLinkElement) {
        document.querySelector("#viewProjects").classList.add("active");
        document.querySelector("#projects").classList.remove("d-none");
        document.querySelector("#viewMilestones").classList.remove("active");
        document.querySelector("#milestones").classList.add("d-none");
    }

    public viewMilestones(e: HTMLLinkElement) {
        document.querySelector("#viewProjects").classList.remove("active");
        document.querySelector("#projects").classList.add("d-none");
        document.querySelector("#viewMilestones").classList.add("active");
        document.querySelector("#milestones").classList.remove("d-none");
    }
}

ko.applyBindings(new GitLabToolViewModel(window.localStorage.getItem("gitlab-tool.url"),
    window.localStorage.getItem("gitlab-tool.token")));

document.querySelector("#host").addEventListener("input", (e) => {
    window.localStorage.setItem("gitlab-tool.url", (e.target as HTMLInputElement).value);
});

document.querySelector("#token").addEventListener("input", (e) => {
    window.localStorage.setItem("gitlab-tool.token", (e.target as HTMLInputElement).value);
});
