"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.velheim = void 0;
const child_process_1 = require("child_process");
const copyDLLs_1 = require("./copyDLLs");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let pid;
let isWin = process.platform === "win32";
let isRunning;
async function startValheim(exe, dlls, dataPath) {
    const exePath = exe.replace("/valheim.exe", "");
    let pid = child_process_1.exec(`cd /D "${exePath}" & "${exe}"`);
    pid.on("error", (error) => {
        console.log(`error: ${error.message}`);
        //  startValheim();
    });
    pid.on("close", async (code) => {
        const tmp = path_1.default.join(__dirname, "../", "tmp");
        await copyDLLs_1.copyFromValheim(dlls, dataPath, tmp);
        fs_1.default.readdir(tmp, (err, files) => {
            if (err)
                throw err;
            for (const file of files) {
                fs_1.default.unlink(path_1.default.join(tmp, file), (err) => {
                    if (err)
                        throw err;
                });
            }
        });
        //  startValheim();
    });
}
exports.default = startValheim;
exports.velheim = () => pid;
