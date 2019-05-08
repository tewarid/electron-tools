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
        this.projectsVisible = ko.observable(config.projectsVisible !== null ? config.projectsVisible : true);
        this.milestonesVisible = ko.observable(config.milestonesVisible !== null ? config.milestonesVisible : false);
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
