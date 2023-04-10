import { getFontList } from '@/api/upload';

const fontsPath = '//js.xiudodo.com/fonts/';

const fontMap: Record<string, string> = {
  font9: 'syht',
  font0: 'yahei',
  font1: 'fzfsjt',
  font2: 'fzhtjt',
  font3: 'fzktjt',
  font4: 'pmzdbtt',
  font5: 'qsgcfxt',
  font6: 'qscmxxjt',
  font7: 'qsyrt',
  font8: 'qsyh',
  // font9:'syht',
  font11: 'wqydkwmh',
  font12: 'wqydkzh',
  font13: 'zkgdh',
  font14: 'zkklt',
  font15: 'ztgjbs',
  font16: 'ztgjfm',
  font18: 'ztgjpxe',
  font19: 'ztgjrx',
  // font54:'systjixi',
  // font55:'systx',
  // font56:'systcg',
  // font57:'systct',
  // font58:'fn851sxzzt',
  // font59:'fnlhzt',
  // font60:'fnyrdzst',
  // font61:'fnzkkh',
  // font62:'fnzkxwlogot',
  // font63:'fnzqkhyt',
  font20: '2Dumb',
  font21: '3Dumb',
  font22: 'AaShouXieHB',
  font23: 'AaWanWan',
  font24: 'AbrilFatface',
  font25: 'AleoLight',
  font26: 'AleoRegular',
  font27: 'AlexBrush',
  font28: 'Aliquam',
  font29: 'AmaticSC',
  font30: 'Amble',
  font31: 'ArialRegular',
  font32: 'Aspire',
  font33: 'BebasNeueBook',
  font34: 'BebasNeue',
  font35: 'BukhariScript',
  font36: 'DancingScript',
  font37: 'DroidSerif',
  font38: 'Edo',
  font39: 'GrandHotel',
  font40: 'GreatVibes',
  font41: 'KoolBeans',
  font42: 'Langdon',
  font43: 'NeutonRegular',
  font44: 'NeutonSCLight',
  font45: 'OswaldStencil',
  font46: 'Parisish',
  font47: 'PlayfairDisplaySC',
  font48: 'Quango',
  font49: 'Rochester',
  font50: 'ScriptinaPro',
  font51: 'SixCaps',
  font52: 'Trocchi',
  font54: 'systjixi',
  font55: 'systx',
  font56: 'systcg',
  font57: 'systct',
  font58: 'fn851sxzzt',
  font59: 'fnlhzt',
  font60: 'fnyrdzst',
  font61: 'fnzkkh',
  font62: 'fnzkxwlogot',
  font63: 'fnzqkhyt',

  font101: 'fnAmaranthBold',
  font102: 'fnAmaranthItalic',
  font103: 'fnAsapCondensedBold',
  font104: 'fnBadScriptRegular',
  font105: 'fnBahianaRegular',
  font106: 'fnBarrioRegular',
  font107: 'fnblowbrush',
  font108: 'fnDancingScriptBold',
  font109: 'fnDancingScriptRegular',
  font110: 'fnDolceVitaLight',
  font111: 'fnDroidSansBold',
  font112: 'fnFinelinerScript',
  font113: 'fnFirstShineregular',
  font114: 'fnLeagueScript',
  font115: 'fnMarckScriptRegular',
  font116: 'fnNISCRIPTRegular',
  font117: 'fnParalinesRegular',
  font118: 'fnPlaylistScript',
  font119: 'fnPoiretOneRegular',
  font120: 'fnPostNoBillsColomboExtraBold',
  font121: 'fnsoulhandwritingfreeversion',
  font122: 'fnTypoPRODancingScriptRegular',
  font123: 'fnfzfsft',
  font124: 'fnfzhtft',
  font125: 'fnfzktGBK',
  font126: 'fnfzktft',
  font127: 'fnhymztHanaMinA',
  font128: 'fnhymctHanaMinB',
  font129: 'fnsyhtLight',
  font130: 'fnsyhtRegular',
  font131: 'fnsyhtSourceHanSansKHeavy',
  font132: 'fnsyhtjzxExtraLight',
  font133: 'fnsyhtjzxLight',
  font134: 'fnsyhtjzxRegular',
  font135: 'fntwjybbzks',
  font136: 'fntwjybbzst',
  font137: 'fntwqzksmjs',
  font138: 'fnwhzbktkx',
  font139: 'fnwhzbktky',
  font140: 'fnwhzchtqpdw',
  font141: 'fnwhzcgtbz',
  font142: 'fnwhzchtsy',
  font143: 'fnwhzcktj',
  font144: 'fnwhzcytsk',
  font145: 'fnwhzhbtbts',
  font146: 'fnwhzktyf',
  font147: 'fnwhzklhb',
  font148: 'fnwhzkzhb',
  font149: 'fnwhzyktf',
  font150: 'fnwhzzlsf',
  font151: 'fnwhzzytf',
  font152: 'fnwhzzytsky',
  font153: 'fnyrdzstBold',
  font154: 'fnyrdzstExtralight',
  font155: 'fnyrdzstHeavy',
  font156: 'fnyrdzstMedium',
  font157: 'fnyrdzstRegular',
  font158: 'fnyrdzstSemibold',
  font159: 'fnyjmc',
  font160: 'fnzkwyt',
  font161: 'fnzkydlt01',
  font162: 'fnzkydlt02',
  font163: 'fnsystSCBold',
  font164: 'fnsystSCExtraLight',
  font165: 'fnsystSCHeavy',
  font166: 'fnsystSCLight',
  font167: 'fnfystSCRegular',
  font168: 'fnsystSCSemiBold',
  font169: 'fnsyhtHeavy',

  font200: 'zh2hllcht',
  font201: 'zh3hyxht',
  font202: 'zh4hcjxkt',
  font203: 'zh5hwwrht',
  font204: 'zh6hrjcht',
  font205: 'zh7hwntzt',
  font206: 'zh8hzznct',
  font207: 'zh10hgyxsjxkt',

  font208: 'zh17hmqgdt',
  font209: 'zh19hxyfbt',
  font210: 'zh20hstt',
  font211: 'zh21hbqsyt',
  font212: 'zh24hzhss',
  font213: 'zh27hbdt',

  font214: 'zh32hwzyxzt',
  font215: 'zh34hsnhft',
  font216: 'zh35hsxheht',
  font217: 'zh36hsxhskt',
  font218: 'zh37hsxhggt',
  font219: 'zh38hyxxkt',
  font220: 'zh39fzklt',

  font221: 'zh40hxcfft',
  font222: 'zh41hcxt',
  font223: 'zh42kxsk',
  font224: 'zh43hgcss',
  font225: 'zh44hkxyh',
  font226: 'zh46hmmt',
  font227: 'zh47hsfxk',
  font228: 'zh49hxyxs',

  font229: 'zh51qqzjt',
  font230: 'zh52hakmht',
  font231: 'zh53hyxt',
  font232: 'zh54hxh',
  font233: 'zh55hlyss',
  font234: 'zh56hhlmblsjt',
  font235: 'zh57hcxh',
  font236: 'zh58hczh',
  font237: 'zh59hcch',
  font238: 'zh60hmxszt',
  font239: 'zh62hsjt',
  font240: 'zh63hppt',
  font241: 'zh64hmqrtt',
  font242: 'zh66hzzt',

  font243: 'zh70hlyht',
  font244: 'zh71hysjs',
  font245: 'zh73hjnss',
  font246: 'zh74hfmss',
  font247: 'zh75hlyzmt',
  font248: 'zh79hmqnyt',

  font249: 'zh80hmqxyt',
  font250: 'zh81hqft',

  font251: 'zh92hxchbt',
  font252: 'zh95hsks',
  font253: 'zh96hhxss',

  font254: 'zh100hffxft',
  font255: 'zh101hxqx',
  font256: 'zh103hhtss',
  font257: 'zh104hsxt',
  font258: 'zh105hjyh',
  font259: 'zh107hmqhlt',
  font260: 'zh109hfgxzt',

  font261: 'zh110hwljht',
  font262: 'zh111hjbzpt',
  font263: 'zh113hdmsnt',
  font264: 'zh119htzeft',

  font265: 'zh120hpbsht',
  font266: 'zh122hqsb',
  font267: 'zh126hyzt',
  font268: 'zh127hyyt',
  font269: 'zh128hwxpmt',
  font270: 'zh129hbhxft',

  font271: 'zh130hklqht',
  font272: 'zh131hklcwt',
  font273: 'zh133hmkkb',
  font274: 'zh137hcyls',
  font275: 'zh138hbrss',
  font276: 'zh139hmqyyt',
  font277: 'zh141hhlydt',
  font280: 'zh116hfmss',

  font281: 'zh142hxhx',
  font282: 'zh151hlmzyt',
  font283: 'zh152hjjcjh',
  font284: 'zh155hfqt',
  // font285:'zh161hjhczpt',
  font286: 'zh162hyqllt',
  font287: 'zh164hfyh',
  font288: 'zh173hqxt',
  font289: 'zh179hzkbbt',
  font290: 'zh184hyycyh',
  font291: 'zh194hmqfxt',
  font292: 'zh199hmqcct',
  font293: 'zh201hmqyht',
  font294: 'zh208hxcqwt',

  font295: 'zh160ts',

  font296: 'zh176ccy',
  font297: 'zh181fcbtt',
  font298: 'zh143zkcjh',
  font299: 'zh167yrh',
  font300: 'zh144lyt',
  font301: 'zh31ns',
  font302: 'zh45byys',
  font303: 'zh23xws',
  font304: 'zh193wsfgt',
  font305: 'zh197dms',
  font306: 'zh237ylss',
  font307: 'zh210gfsnt',
};
const fontNameValueList: Record<string, string> = {};

export function getFontNameList(): Record<string, string> {
  return fontMap;
}

export function getFontNameValueList(): Record<string, string> {
  if (Object.keys(fontNameValueList).length > 0) {
    return fontNameValueList;
  }
  const fontNameList = getFontNameList();

  Object.keys(fontNameList).forEach(key => {
    fontNameValueList[fontNameList[key]] = key;
  });

  return fontNameValueList;
}

export function getFontId(fontFamily: string) {
  const fontNameValueList = getFontNameValueList();
  const backupFontFamily = fontNameValueList.fnsyhtRegular;
  const font = fontNameValueList[fontFamily] ?? '';

  return {
    backupFontFamily,
    fontFamily: font,
  };
}
export function getFontFamily(fontId: string) {
  const font = fontMap[fontId] ?? '';

  return font;
}

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
  let fontFamilyInit = '';
  Object.keys(fontMap).forEach(key => {
    // @ts-ignore
    const fontFamily = fontMap[key];
    const url = `${fontsPath}${fontFamily}.woff`;
    fontFamilyInit += formatFontFace(key, url);
  });

  FontFamilyScope.appendChild(document.createTextNode(fontFamilyInit));
}

export function updateUserFontFamily(fontList: any) {
  let FontFamilyScope = document.getElementById('userFontFamilyScope');

  let fontFamilyInit = '';

  if (!FontFamilyScope) {
    FontFamilyScope = document.createElement('style');
    FontFamilyScope.id = 'userFontFamilyScope';
    document.head.appendChild(FontFamilyScope);
  }

  fontList.forEach((font: any) => {
    const {
      file_id,
      fileInfo: { file_path },
    } = font;

    fontFamilyInit += formatFontFace(`webfont-${file_id}`, file_path);
  });

  FontFamilyScope.innerHTML = fontFamilyInit;
}

// 用户上传字体
export async function initUserFontFamily() {
  const userFontList = await getFontList({ page: 1, pageSize: 100 });
  updateUserFontFamily(userFontList.data?.items || []);
}
