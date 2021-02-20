"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyToValheim = exports.copyFromValheim = void 0;
const util_promisify_1 = __importDefault(require("util.promisify"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const copyFilePromise = util_promisify_1.default(fs_1.default.copyFile);
function copyFiles(srcDir, destDir, files) {
    return Promise.all(files.map((f) => {
        return copyFilePromise(path_1.default.join(srcDir, f), path_1.default.join(destDir, f)).catch((e) => { });
    }));
}
exports.copyFromValheim = (dlls, path, valheimPath) => copyFiles(valheimPath, path, dlls);
exports.copyToValheim = async (dll, path) => {
    const file = await fs_1.default.readFileSync(dll);
    const fileName = dll.split("/")[2];
    await fs_1.default.writeFileSync(`${path}/${fileName}`, file);
};
