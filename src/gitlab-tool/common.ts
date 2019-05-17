import * as ko from "knockout";
import SettingsViewModel from "./settings";

export class ViewModelBase {
    protected static settings: SettingsViewModel;
    private static readonly prefix: string = "gitlab-tool";
    protected typeName: string = "ViewModelBase";

    protected read(): any {
        try {
            return JSON.parse(window.localStorage.getItem(`${ViewModelBase.prefix}.${this.typeName}`)) || {};
        } catch {
            return  {};
        }
    }

    protected save() {
        window.localStorage.setItem(`${ViewModelBase.prefix}.${this.typeName}`, ko.toJSON(this));
    }
}
