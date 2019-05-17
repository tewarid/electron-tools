import * as fs from "fs";
import * as ko from "knockout";
import * as path from "path";
import { ViewModelBase } from "./common";

ko.components.register("settings", {
    synchronous: true,
    template: fs.readFileSync(path.join(__dirname, "settings.html")).toString(),
    viewModel: require("./settings"),
});

ko.components.register("projects", {
    template: fs.readFileSync(path.join(__dirname, "projects.html")).toString(),
    viewModel: require("./projects"),
});

class MainViewModel extends ViewModelBase {
    private component: ko.Observable<string>;

    constructor() {
        super();
        this.typeName = "MainViewModel";
        this.component = ko.observable();
        const saved = this.read();
        this.component(saved.component || "settings");
    }

    private showProjects() {
        this.component("projects");
        this.save();
    }

    private showSettings() {
        this.component("settings");
        this.save();
    }
}

ko.applyBindings(new MainViewModel());
