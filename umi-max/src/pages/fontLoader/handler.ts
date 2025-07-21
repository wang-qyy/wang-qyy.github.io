import { stringify } from "qs";

const SMALL_FONT_BASE_URL = `https://upload.pngtree.com` + "/build_font";
export interface AllDesignFont {
  id: string;
  image_url: string; // 预览图
  url: string; // 字体包 地址
  font: string; // 生成 font-face font-family

  font_hash?: string; // 小字体包 hash
  words?: string;

  font_name: string; // 字体名称 - 多语言
  font_file: string;

  type: string | number;
  font_ext?: string; // 兼容重命名 font-face
}

const fontList: AllDesignFont[] = [];
export function str2unicode(text: string): string {
  return Array.from(text, (c) => c.charCodeAt(0).toString(16)).join(",");
}

export function buildSmallFontUrl(params: {
  font: string;
  words: string; // unicode string
  hash: string;
}): string {
  return `${SMALL_FONT_BASE_URL}?${stringify(params)}`;
}

export function formatFontFace(fontFamily: string, fontPath: string) {
  return `@font-face {font-family: '${fontFamily}';src:url('${fontPath}') format('truetype');font-display:swap}`;
}

const SheetID = "async_load_font";
export function addCssRules(rules: string) {
  let style = document.getElementById(SheetID) as HTMLStyleElement;

  if (!style) {
    style = document.createElement("style");
    style.id = SheetID;

    document.head.appendChild(style);
    // safari
    style.appendChild(document.createTextNode(""));
  }

  if (style.sheet) {
    style.sheet.insertRule(rules, style.sheet.cssRules.length);

    style.sheet.replace;
  }
}

export function replaceCssRules(targetFont: AllDesignFont) {
  let style = document.getElementById(SheetID) as HTMLStyleElement;

  if (style?.sheet) {
    for (let index = 0; index < style.sheet.cssRules.length; index++) {
      const element = style.sheet.cssRules[index] as CSSFontFaceRule;

      console.log(element, element.cssText);
      console.log(element.style.fontFamily);

      if (targetFont.font === element.style.fontFamily) {
        style.sheet.deleteRule(index);
      }
    }
  }
  updateFontFace(targetFont);
}

export function updateText(newWords: string, fontFamily: string) {
  const targetFont = fontList.find((font) => font.font == fontFamily);

  if (!targetFont) return;

  let style = document.getElementById(SheetID) as HTMLStyleElement;

  if (style?.sheet) {
    for (let index = 0; index < style.sheet.cssRules.length; index++) {
      const element = style.sheet.cssRules[index] as CSSFontFaceRule;

      if (targetFont.font === element.style.fontFamily) {
        style.sheet.deleteRule(index);
      }
    }
  }

  const newStr = targetFont.words + "," + str2unicode(newWords);

  updateFontFace({ ...targetFont, words: newStr });
}
export function updateFontFace(targetFont: AllDesignFont) {
  let { url: fontPath, font: fontFamily, words = "" } = targetFont;

  if (targetFont.font_hash) {
    fontPath = buildSmallFontUrl({
      font: fontFamily,
      words,
      hash: targetFont.font_hash,
    });
  }

  addCssRules(formatFontFace(targetFont.font, fontPath));
}

export function addFontFace(font: AllDesignFont) {
  const isExist = fontList.find((f) => f.font == font.font);
  if (!isExist) {
    console.log(1, font.words);

    if (font.font_hash && font.words) {
      Object.assign(font, { words: str2unicode(font.words) });
    }

    updateFontFace(font);
    fontList.push(font);
  } else if (font.words) {
    const newStr = Array.from(
      new Set((isExist.words + "," + str2unicode(font.words)).split(","))
    ).join(",");

    Object.assign(isExist, { words: newStr });
    updateFontFace(isExist);
  }
}

export function initFontFace(list: AllDesignFont[]) {
  list.forEach((font) => {
    if (font.font_hash && font.font_name) {
      font.words = str2unicode(font.font_name) + "," + (font.words || "");
    }

    updateFontFace(font);

    if (font.font_ext) {
      const ext = { ...font, font: font.font_ext };

      updateFontFace(ext);
    }
  });
}
