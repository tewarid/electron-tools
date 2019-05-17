import * as ko from "knockout";
import { ViewModelBase } from "./common";
import {CustomLoader} from "./loader";

ko.components.loaders.push(new CustomLoader());

class MainViewModel extends ViewModelBase {
    private component: ko.Observable<string>;

    constructor() {
        super();
        this.typeName = "MainViewModel";
        this.component = ko.observable();
        const saved = this.read();
        this.component(saved.component || "settings");
    }

    private showComponent(component: string) {
        this.component(component);
        this.save();
    }
}

ko.applyBindings(new MainViewModel());
