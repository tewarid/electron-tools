import * as ko from "knockout";

export class ViewModelBase {
    protected static settings: any;
    protected static prefix: string = "ko";
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
