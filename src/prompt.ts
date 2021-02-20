import prompt from "prompt";
import fs from "fs";
import path from "path";

export const valheimPath = async () => {
  const schema = {
    properties: {
      valheimDir: {
        // pattern: /^[a-zA-Z\s\-]+$/,
        message: "Please provide full Valheim Steam path",
        required: true,
      },
    },
  };

  await prompt.start();

  const { valheimDir } = await prompt.get([schema]);

  if (valheimDir && typeof valheimDir === "string") {
    const exist = fs.existsSync(
      valheimDir.includes("valheim.exe")
        ? valheimDir
        : `${valheimDir}/valheim.exe`
    );

    if (!exist) {
      valheimPath();
    } else {
      const exe = valheimDir.includes("valheim.exe")
        ? valheimDir
        : `${valheimDir}/valheim.exe`;

      const dataPath = path.join(
        valheimDir.includes("valheim.exe")
          ? valheimDir.replace("valheim.exe", "")
          : valheimDir,
        "/valheim_Data/Managed"
      );

      return { exe, dataPath, valheimDir };
    }
  }
};
