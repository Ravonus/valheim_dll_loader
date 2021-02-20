"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.valheimPath = void 0;
const prompt_1 = __importDefault(require("prompt"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.valheimPath = async () => {
    const schema = {
        properties: {
            valheimDir: {
                // pattern: /^[a-zA-Z\s\-]+$/,
                message: "Please provide full Valheim Steam path",
                required: true,
            },
        },
    };
    await prompt_1.default.start();
    const { valheimDir } = await prompt_1.default.get([schema]);
    if (valheimDir && typeof valheimDir === "string") {
        const exist = fs_1.default.existsSync(valheimDir.includes("valheim.exe")
            ? valheimDir
            : `${valheimDir}/valheim.exe`);
        if (!exist) {
            exports.valheimPath();
        }
        else {
            const exe = valheimDir.includes("valheim.exe")
                ? valheimDir
                : `${valheimDir}/valheim.exe`;
            const dataPath = path_1.default.join(valheimDir.includes("valheim.exe")
                ? valheimDir.replace("valheim.exe", "")
                : valheimDir, "/valheim_Data/Managed");
            return { exe, dataPath, valheimDir };
        }
    }
};
