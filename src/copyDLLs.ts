import promisify from "util.promisify";
import fs from "fs";
import path from "path";

const copyFilePromise = promisify(fs.copyFile);

function copyFiles(srcDir: string, destDir: string, files: string[]) {
  return Promise.all(
    files.map((f) => {
      return copyFilePromise(
        path.join(srcDir, f),
        path.join(destDir, f)
      ).catch((e) => {});
    })
  );
}

export const copyFromValheim = (
  dlls: string[],
  path: string,
  valheimPath: string
) => copyFiles(valheimPath, path, dlls);

export const copyToValheim = async (dll: string, path: string) => {
  const file = await fs.readFileSync(dll);
  const fileName = dll.split("/")[2];
  await fs.writeFileSync(`${path}/${fileName}`, file);
};
