import { getFontList } from '@/apis/global';

import { setFontList } from '@/pages/store/font';

export function formatFontFace(fontFamily: string, fontPath: string) {
  return `@font-face {font-family: '${fontFamily}';src:url('${fontPath}') format('truetype');}`;
}

// 系统字体
export async function initFontFamily() {
  if (document.getElementById('fontFamilyScope')) {
    return;
  }
  const FontFamilyScope = document.createElement('style');
  FontFamilyScope.id = 'fontFamilyScope';
  document.head.appendChild(FontFamilyScope);

  const res = await getFontList();

  if (res.code === 200) {
    let fontFamilyInit = '';
    setFontList(res.data);

    res.data.forEach((font) => {
      fontFamilyInit += formatFontFace(font.font, font.url);
    });

    FontFamilyScope.appendChild(document.createTextNode(fontFamilyInit));
  }
}
