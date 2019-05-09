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

    constructor() {
        const config = this.read();
        this.host = ko.observable(config.host || "https://gitlab.com");
        this.token = ko.observable(config.token);
        this.projects = ko.observableArray(config.projects);
        this.milestones = ko.observableArray(config.milestones);
        this.busy = ko.observable(false);
        this.projectsVisible = ko.observable(config.projectsVisible !== undefined
            ? config.projectsVisible : true);
        this.milestonesVisible = ko.observable(config.milestonesVisible !== undefined
            ? config.milestonesVisible : false);
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
                this.projects.push({http_url_to_repo: p.http_url_to_repo, id: p.id,
                    name: p.name, namespace: {full_path: p.namespace.full_path},
                    ssh_url_to_repo: p.ssh_url_to_repo});
                api.ProjectMilestones.all(p.id)
                .then((milestones: any) => {
                    milestones.forEach((m: any) => {
                        this.milestones.push({due_date: m.due_date, id: m.id,
                            projectName: p.name, start_date: m.start_date,
                            state: m.state, title: m.title});
                    });
                }, (reason) => {
                    // do nothing
                });
            });
            this.save();
            this.busy(false);
        }, (reason) => {
            this.save();
            this.busy(false);
        });
    }

    public viewProjects(e: HTMLLinkElement) {
        this.projectsVisible(true);
        this.milestonesVisible(false);
        this.save();
    }

    public viewMilestones(e: HTMLLinkElement) {
        this.projectsVisible(false);
        this.milestonesVisible(true);
        this.save();
    }

    private read(): any {
        try {
            return JSON.parse(window.localStorage.getItem("gitlab-tool.config")) || {};
        } catch {
            return  {};
        }
    }

    private save() {
        window.localStorage.setItem("gitlab-tool.config", ko.toJSON(this));
    }
}

ko.applyBindings(new GitLabToolViewModel());
