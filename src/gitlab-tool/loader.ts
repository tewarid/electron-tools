import * as fs from "fs";
import * as ko from "knockout";
import * as path from "path";

export class CustomLoader implements ko.components.Loader {
    public getConfig(componentName: string, callback: (config: object) => void): void {
        const templatePath = path.join(__dirname, `${componentName}.html`);
        const templateString = fs.readFileSync(templatePath, {encoding: "utf8"});
        callback({
            template: templateString,
            viewModel: require(`./${componentName}`),
        });
    }
}
