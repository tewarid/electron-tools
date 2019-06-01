import * as fs from "fs";
import * as ko from "knockout";
import * as path from "path";

export class CustomLoader implements ko.components.Loader {
    private componentDir: string;

    constructor(dir: string) {
        this.componentDir = dir;
    }

    public getConfig(componentName: string, callback: (config: object) => void): void {
        const templatePath = path.join(this.componentDir, `${componentName}.html`);
        const templateString = fs.readFileSync(templatePath, {encoding: "utf8"});
        callback({
            template: templateString,
            viewModel: require(`${this.componentDir}/${componentName}`),
        });
    }
}
