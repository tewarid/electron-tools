import {Gitlab} from "gitlab";
import * as ko from "knockout";

class GitLabToolViewModel {
    public host: ko.Observable<string>;
    public token: ko.Observable<string>;
    public projects: ko.ObservableArray<any>;
    public milestones: ko.ObservableArray<any>;
    public busy: ko.Observable<boolean>;
    public projectsVisible: ko.Observable<boolean>;
    public milestonesVisible: ko.Observable<boolean>;

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
        this.projectsVisible = ko.observable(true);
        this.milestonesVisible = ko.observable(false);
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
        this.projectsVisible(true);
        this.milestonesVisible(false);
    }

    public viewMilestones(e: HTMLLinkElement) {
        this.projectsVisible(false);
        this.milestonesVisible(true);
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
