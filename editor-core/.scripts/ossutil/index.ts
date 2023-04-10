import path from "path";
import { execSync } from "child_process";

let utilPath: string;
if (process.platform === "win32") {
  utilPath = path.join(__dirname, "ossutil64");
} else if (process.platform === "darwin") {
  utilPath = path.join(__dirname, "ossutilmac64");
  execSync(`chmod +x ${utilPath}`);
} else if (process.platform === "linux") {
  utilPath = path.join(__dirname, "ossutil64");
  execSync(`chmod +x ${utilPath}`);
} else {
  throw new Error("unsupported platform");
}

export default utilPath;
