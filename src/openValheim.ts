import { ChildProcess, exec } from "child_process";
import { copyFromValheim } from "./copyDLLs";
import path from "path";
import fs from "fs";

let pid: ChildProcess;
let isWin = process.platform === "win32";
let isRunning: boolean;

export default async function startValheim(
  exe: string,
  dlls: string[],
  dataPath: string
) {
  const exePath = exe.replace("/valheim.exe", "");

  let pid = exec(`cd /D "${exePath}" & "${exe}"`);

  pid.on("error", (error) => {
    console.log(`error: ${error.message}`);
    //  startValheim();
  });

  pid.on("close", async (code) => {
    const tmp = path.join(__dirname, "../", "tmp");
    await copyFromValheim(dlls, dataPath, tmp);

    fs.readdir(tmp, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(tmp, file), (err) => {
          if (err) throw err;
        });
      }
    });

    //  startValheim();
  });
}

export const velheim = () => pid;
