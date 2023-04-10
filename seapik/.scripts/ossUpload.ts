import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import utilPath from "./ossutil";
import inquirer from "inquirer";
import { spawn } from "child_process";

(async () => {
  dotenv.config({ path: path.resolve(__dirname, "../.oss.env") });
  let { AK_ID, AK_SECRET } = process.env;
  // console.log("AK:", AK_ID, AK_SECRET);
  if (!AK_ID) {
    const { answer } = await inquirer.prompt([
      {
        type: "input",
        name: "answer",
        message: "请输入AccessKeyId",
      },
    ]);
    if (!answer) {
      console.error("缺少AccessKeyId");
      process.exit(1);
    }
    AK_ID = answer;
  }
  if (!AK_SECRET) {
    const { answer } = await inquirer.prompt([
      {
        type: "input",
        name: "answer",
        message: "请输入AccessKeySecret",
      },
    ]);
    if (!answer) {
      console.error("缺少AccessKeySecret");
      process.exit(1);
    }
    AK_SECRET = answer;
  }

  const distPath = path.join(__dirname, "../dist");
  const needUploadPath = path.join(distPath, "__oss");
  await Promise.all(
    // ["css", "js", "static", "wasm"].map(i =>
    ["css", "js", "static"].map(i =>
      fs.move(path.join(distPath, i), path.join(needUploadPath, i)),
    ),
  );

  await new Promise<void>((resolve, reject) => {
    const cp = spawn(utilPath, [
      "cp",
      needUploadPath,
      "oss://xiudodo-js/xiudodo-editor/editor-dependence",
      "-r",
      "-f",
      "-u",
      `--endpoint=oss-cn-shanghai.aliyuncs.com`,
      `--access-key-id=${AK_ID}`,
      `--access-key-secret=${AK_SECRET}`,
      "--exclude=*.map",
    ]);
    cp.stdout.pipe(process.stdout);
    cp.stderr.pipe(process.stderr);
    cp.on("message", msg => console.log(msg.toString()));
    cp.on("close", code => {
      if (code) {
        reject(new Error("oss上传工具子进程退出码：" + code));
      } else {
        resolve();
      }
    });
  });

  await fs.remove(needUploadPath);
})().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
