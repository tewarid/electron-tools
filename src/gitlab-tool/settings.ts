import * as ko from "knockout";
import { ViewModelBase } from "./common";

class SettingsViewModel extends ViewModelBase {
    public host: ko.Observable<string>;
    public token: ko.Observable<string>;
    public busy: ko.Observable<boolean>;

    constructor() {
        super();
        const saved = this.read();
        ViewModelBase.host = saved.host || ViewModelBase.host;
        this.host = ko.observable(SettingsViewModel.host);
        ViewModelBase.token = saved.token || ViewModelBase.token;
        this.token = ko.observable(ViewModelBase.token);
        this.busy = ko.observable(false);
    }

    private read(): any {
        try {
            return JSON.parse(window.localStorage.getItem("gitlab-tool.SettingsViewModel")) || {};
        } catch {
            return  {};
        }
    }

    private save(): void {
        ViewModelBase.host = this.host();
        ViewModelBase.token = this.token();
        window.localStorage.setItem("gitlab-tool.SettingsViewModel", ko.toJSON(this));
    }
}

export = SettingsViewModel;
