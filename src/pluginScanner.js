"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginScanner = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_json_1 = __importDefault(require("../config.json"));
const prompt_1 = require("./prompt");
const copyDLLs_1 = require("./copyDLLs");
const openValheim_1 = __importDefault(require("./openValheim"));
const pluginDirectory = path_1.default.join(__dirname, "../", "plugins");
exports.pluginScanner = () => {
    const tmp = path_1.default.join(__dirname, "../", "tmp");
    if (!fs_1.default.existsSync(tmp)) {
        fs_1.default.mkdirSync(tmp);
    }
    const plugins = fs_1.default.readdirSync(path_1.default.join(pluginDirectory));
    const dlls = {
        loaded: [],
    };
    plugins.map((plugin) => {
        const files = fs_1.default.readdirSync(`${pluginDirectory}/${plugin}`);
        let config;
        files.map((file) => {
            if (file.includes(".dll") && !dlls[file] && !dlls.loaded.includes(file)) {
                dlls[plugin] = `${pluginDirectory}/${plugin}/${file}`;
                dlls.loaded.push(file);
            }
            else if (file === "config.json" && !dlls.loaded.includes(file)) {
                config = JSON.parse(fs_1.default.readFileSync(`${pluginDirectory}/${plugin}/${file}`, "utf8"));
                if (!config.enabled)
                    dlls[plugin] = "disabled";
            }
            else if (dlls.loaded.includes(file)) {
                dlls[plugin] = `Plugin Conflict Another plugin is already modifying this DLL`;
            }
        });
    });
    let copyDllDone;
    const keys = Object.keys(dlls);
    keys.map(async (key, i) => {
        if (key === "loaded")
            return;
        const obj = dlls[key];
        if (obj === "Plugin Conflict Another plugin is already modifying this DLL" ||
            obj === "disabled")
            return;
        let valheimDir;
        let valheimExePath;
        let valheimDataPath;
        if (!config_json_1.default.valheimPath) {
            const obj = await prompt_1.valheimPath();
            let newConf = {};
            if (obj) {
                newConf = { ...config_json_1.default };
                newConf.valheimPath = obj.valheimDir;
                fs_1.default.writeFileSync(path_1.default.join(__dirname, "../", "config.json"), JSON.stringify(newConf, null, 3), "utf8");
                valheimDir = obj.valheimDir;
                valheimExePath = obj.exe;
                valheimDataPath = obj.dataPath;
            }
        }
        else {
            valheimDir = config_json_1.default.valheimPath;
            valheimExePath = `${config_json_1.default.valheimPath}/valheim.exe`;
            valheimDataPath = `${config_json_1.default.valheimPath}/valheim_Data/Managed`;
        }
        if (!copyDllDone && valheimDir && valheimExePath && valheimDataPath) {
            copyDllDone = true;
            copyDLLs_1.copyFromValheim(dlls.loaded, path_1.default.join(__dirname, "../", "tmp"), valheimDataPath);
        }
        if (valheimDataPath)
            copyDLLs_1.copyToValheim(obj, valheimDataPath);
        if (valheimExePath && valheimDataPath)
            await openValheim_1.default(valheimExePath, dlls.loaded, valheimDataPath);
    });
};
