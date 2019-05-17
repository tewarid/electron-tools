import * as ko from "knockout";
import { ViewModelBase } from "./common";

class SettingsViewModel extends ViewModelBase {
    public host: ko.Observable<string>;
    public token: ko.Observable<string>;
    public busy: ko.Observable<boolean>;

    constructor() {
        super();
        this.typeName = "SettingsViewModel";
        ViewModelBase.settings = this;
        const saved = this.read();
        this.host = ko.observable(saved.host || "https://gitlab.com");
        this.token = ko.observable(saved.token || "");
        this.busy = ko.observable(false);
    }
}

export = SettingsViewModel;
