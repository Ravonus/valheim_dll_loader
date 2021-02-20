import fs from "fs";
import path from "path";
import conf from "../config.json";
import { valheimPath } from "./prompt";
import { copyFromValheim, copyToValheim } from "./copyDLLs";
import openValheim from "./openValheim";

const pluginDirectory = path.join(__dirname, "../", "plugins");

export const pluginScanner = () => {
  const tmp = path.join(__dirname, "../", "tmp");

  if (!fs.existsSync(tmp)) {
    fs.mkdirSync(tmp);
  }

  const plugins = fs.readdirSync(path.join(pluginDirectory));
  const dlls: { loaded: string[]; [key: string]: any } = {
    loaded: [],
  };
  plugins.map((plugin) => {
    const files = fs.readdirSync(`${pluginDirectory}/${plugin}`);

    let config;

    files.map((file) => {
      if (file.includes(".dll") && !dlls[file] && !dlls.loaded.includes(file)) {
        dlls[plugin] = `${pluginDirectory}/${plugin}/${file}`;
        dlls.loaded.push(file);
      } else if (file === "config.json" && !dlls.loaded.includes(file)) {
        config = JSON.parse(
          fs.readFileSync(`${pluginDirectory}/${plugin}/${file}`, "utf8")
        );

        if (!config.enabled) dlls[plugin] = "disabled";
      } else if (dlls.loaded.includes(file)) {
        dlls[
          plugin
        ] = `Plugin Conflict Another plugin is already modifying this DLL`;
      }
    });
  });
  let copyDllDone: boolean;
  const keys = Object.keys(dlls);

  keys.map(async (key: string, i) => {
    if (key === "loaded") return;

    const obj = dlls[key];

    if (
      obj === "Plugin Conflict Another plugin is already modifying this DLL" ||
      obj === "disabled"
    )
      return;

    let valheimDir;
    let valheimExePath;
    let valheimDataPath;

    if (!conf.valheimPath) {
      const obj = await valheimPath();

      let newConf: any = {};

      if (obj) {
        newConf = { ...conf };
        newConf.valheimPath = obj.valheimDir;

        fs.writeFileSync(
          path.join(__dirname, "../", "config.json"),
          JSON.stringify(newConf, null, 3),
          "utf8"
        );

        valheimDir = obj.valheimDir;
        valheimExePath = obj.exe;
        valheimDataPath = obj.dataPath;
      }
    } else {
      valheimDir = conf.valheimPath;
      valheimExePath = `${conf.valheimPath}/valheim.exe`;
      valheimDataPath = `${conf.valheimPath}/valheim_Data/Managed`;
    }

    if (!copyDllDone && valheimDir && valheimExePath && valheimDataPath) {
      copyDllDone = true;
      copyFromValheim(
        dlls.loaded,
        path.join(__dirname, "../", "tmp"),
        valheimDataPath
      );
    }

    if (valheimDataPath) copyToValheim(obj, valheimDataPath);

    if (valheimExePath && valheimDataPath)
      await openValheim(valheimExePath, dlls.loaded, valheimDataPath);
  });
};
