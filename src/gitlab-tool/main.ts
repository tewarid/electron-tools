import * as fs from "fs";
import * as ko from "knockout";
import * as path from "path";

ko.components.register("settings", {
    synchronous: true,
    template: fs.readFileSync(path.join(__dirname, "settings.html")).toString(),
    viewModel: require("./settings"),
});

ko.components.register("projects", {
    template: fs.readFileSync(path.join(__dirname, "projects.html")).toString(),
    viewModel: require("./projects"),
});

ko.applyBindings({});
