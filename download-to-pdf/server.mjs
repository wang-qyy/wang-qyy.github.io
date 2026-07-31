import express from "express";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import multer from "multer";
import { execFile } from "child_process";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = path.join(__dirname, "./temp_upload");

// 不存在则创建目录
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// 上传中间件
const upload = multer({ dest: TEMP_DIR });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/pages", express.static(path.join("./", "src", "pages")));

app.use(express.json());

let browser;
(async () =>
  (browser = await puppeteer.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox"],
  })))();

app.post("/api/pdf", async (req, res) => {
  const page = await browser.newPage();

  await page.setContent(req.body.html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    // 开启页眉页脚
    displayHeaderFooter: true,
    // 上下边距给页眉页脚留出空间，否则文字会被截断
    margin: {
      top: "40px",
      bottom: "40px",
      left: "20px",
      right: "20px",
    },
    // 页脚模板：居中显示 第X页 / 共Y页
    footerTemplate: `
      <div style="width:100%; text-align:center; font-size:12px; color:#333;">
        第 {{pageNumber}} 页 / 共 {{totalPages}} 页
      </div>
    `,
    // 页眉留空，不需要可以删掉headerTemplate
    headerTemplate: `
      <div style="width:100%; text-align:center; font-size:12px; color:#666;">文档导出</div>
    `,
  });

  await page.close();
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": 'attachment; filename="doc.pdf"',
  });
  res.send(pdf);
});

app.post("/api/word-to-pdf", upload.single("wordFile"), (req, res) => {
  // 20秒超时兜底
  const timeout = setTimeout(() => {
    res.status(504).send("转换超时");
    clearFile(req.file?.path);
  }, 20000);

  if (!req.file) {
    clearTimeout(timeout);
    return res.status(400).send("请上传docx文件");
  }

  const sourcePath = req.file.path;
  const originFileName = req.file.originalname;
  const pureName = path.parse(originFileName).name;
  // LibreOffice 自动生成同名pdf，不自定义输出名，避免编码问题
  const sourceBaseName = path.basename(sourcePath);
  const pdfName = sourceBaseName.replace(path.extname(sourceBaseName), ".pdf");
  const targetPath = path.join(TEMP_DIR, pdfName);

  const officePath = "/Applications/LibreOffice.app/Contents/MacOS/soffice";
  const args = [
    "--headless",
    "--convert-to",
    "pdf",
    "--outdir",
    TEMP_DIR,
    sourcePath,
  ];

  // 捕获stdout/stderr，打印LibreOffice真实日志
  const child = execFile(officePath, args, async (err, stdout, stderr) => {
    clearTimeout(timeout);

    console.log(sourcePath);
    console.log(req.file);

    console.log("LibreOffice stdout:", stdout);
    console.log("LibreOffice stderr:", stderr);

    // 转换命令执行报错
    if (err) {
      console.error("转换进程异常", err);
      clearFile(sourcePath);
      return res.status(500).send(`转换失败：${stderr || err.message}`);
    }

    // 等待磁盘写入完成，防止文件延迟生成
    setTimeout(async () => {
      // 判断PDF是否生成
      if (!fs.existsSync(targetPath)) {
        clearFile(sourcePath);
        return res
          .status(500)
          .send("转换完成但PDF文件未生成，LibreOffice输出日志：" + stderr);
      }

      // 正常返回PDF流
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(pureName)}.pdf"`,
      });
      const pdfStream = fs.createReadStream(targetPath);
      pdfStream.pipe(res);

      // 传输结束清理文件
      const cleanAll = async () => {
        await clearFile(sourcePath);
        await clearFile(targetPath);
      };
      pdfStream.on("close", cleanAll);
      pdfStream.on("error", cleanAll);
    }, 800);
  });
});

// 工具函数：安全删除文件
async function clearFile(filePath) {
  if (!filePath) return;
  try {
    await fsPromises.unlink(filePath);
  } catch (e) {
    // 文件不存在无需报错
  }
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
