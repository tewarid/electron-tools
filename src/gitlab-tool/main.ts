import * as ko from "knockout";
import { ViewModelBase } from "../ko/common";
import { CustomLoader } from "../ko/loader";
import SettingsViewModel from "./settings";

ko.components.loaders.push(new CustomLoader(__dirname));

class MainViewModel extends ViewModelBase {
    private component: ko.Observable<string>;

    constructor() {
        ViewModelBase.prefix = "gitlab-tool";
        super();
        this.typeName = "MainViewModel";
        this.component = ko.observable();
        ViewModelBase.settings = new SettingsViewModel();
        this.showComponent();
    }

    private showComponent(component: string = null) {
        if (component == null) {
            const saved = this.read();
            component = saved.component || "settings";
        }
        this.component(component);
        this.save();
    }
}

ko.applyBindings(new MainViewModel());
