import { useEffect } from "react";
import { pikbestAdminHost } from "../../config/http";

const text = [
  "Enterprise",
  "All personal premium assets",
  "Access to all personal premium assets",
  "Personal Premium Assets",
  "Enterprise Premium Assets",
  "This image has copyright license for commercial use and exclusive for Enterprise plan downloads.",
  "This image has copyright license and available for commercial use.",
  "This image has copyright license for commercial use and exclusive for Enterprise premium plans downloads.",
  "Upgrade to enterprise premium plan",
  "Upgrade to premium plan",
  "and get enterprise commercial use license.",
  "and get commercial use license.",
  "Valentine's Day",
  "Enterprise Premium User",
  "For enterprise commercial use",
  "Personal Commercial Use",
  "License",

  "Permanent access to all personal premium assets",
  "Download only for enterprise premium members",
  "Upgrade to premium plan and get commercial use license.",
  "Free assets only",
  "Personal Premium Assets",
];

const a: any[] = [
  {
    "en-us": "Enterprise",
    cht: "企業",
    vi: "Doanh nghiệp",
    th: "องค์กร",
    id: "Perusahaan",
    ms: "Perusahaan",
    hi: "उद्यम",
    pt: "Empresa",
    ko: "기업",
    ja: "企業",
    es: "Empresa",
    de: "Unternehmen",
    fr: "Entreprise",
    it: "Impresa",
    pl: "Przedsiębiorstwo",
    ru: "Предприятие",
    ara: "مَشرُوع",
    ph: "Enterprise",
    tr: "Girişim",
  },
  {
    "en-us": "All personal premium assets",
    cht: "所有個人高級資產",
    vi: "Tất cả các tài sản phí bảo hiểm cá nhân",
    th: "สินทรัพย์พรีเมี่ยมส่วนบุคคลทั้งหมด",
    id: "Semua aset premium pribadi",
    ms: "Semua aset premium peribadi",
    hi: "सभी व्यक्तिगत प्रीमियम संपत्ति",
    pt: "Todos os ativos pessoais premium",
    ko: "모든 개인 프리미엄 자산",
    ja: "すべての個人的なプレミアム資産",
    es: "Todos los activos de prima personal",
    de: "Alle persönlichen Premium -Vermögenswerte",
    fr: "Tous les actifs de primes personnels",
    it: "Tutte le risorse premium personali",
    pl: "Wszystkie osobiste zasoby premium",
    ru: "Все личные премиальные активы",
    ara: "جميع الأصول المميزة الشخصية",
    ph: "Lahat ng mga personal na premium na pag -aari",
    tr: "Tüm kişisel premium varlıklar",
  },
  {
    "en-us": "Access to all personal premium assets",
    cht: "訪問所有個人保費資產",
    vi: "Truy cập vào tất cả các tài sản phí bảo hiểm cá nhân",
    th: "การเข้าถึงสินทรัพย์พรีเมี่ยมส่วนบุคคลทั้งหมด",
    id: "Akses ke semua aset premium pribadi",
    ms: "Akses ke semua aset premium peribadi",
    hi: "सभी व्यक्तिगत प्रीमियम परिसंपत्तियों तक पहुंच",
    pt: "Acesso a todos os ativos premium pessoal",
    ko: "모든 개인 프리미엄 자산에 대한 액세스",
    ja: "すべての個人プレミアム資産へのアクセス",
    es: "Acceso a todos los activos de prima personal",
    de: "Zugang zu allen persönlichen Premium -Vermögenswerten",
    fr: "Accès à tous les actifs de primes personnels",
    it: "Accesso a tutte le risorse premium personali",
    pl: "Dostęp do wszystkich osobistych zasobów premium",
    ru: "Доступ ко всем личным премиальным активам",
    ara: "الوصول إلى جميع الأصول الشخصية الشخصية",
    ph: "Pag -access sa lahat ng mga personal na premium na pag -aari",
    tr: "Tüm kişisel premium varlıklara erişim",
  },
  {
    "en-us": "Personal Premium Assets",
    cht: "個人高級資產",
    vi: "Tài sản cao cấp cá nhân",
    th: "สินทรัพย์พรีเมี่ยมส่วนบุคคล",
    id: "Aset premium pribadi",
    ms: "Aset premium peribadi",
    hi: "व्यक्तिगत प्रीमियम परिसंपत्तियां",
    pt: "Ativos premium pessoal",
    ko: "개인 프리미엄 자산",
    ja: "個人的なプレミアム資産",
    es: "Activos de prima personal",
    de: "Persönliche Premium -Vermögenswerte",
    fr: "Actifs de primes personnelles",
    it: "Beni premium personali",
    pl: "Osobiste zasoby premium",
    ru: "Личные премиальные активы",
    ara: "الأصول المميزة الشخصية",
    ph: "Mga personal na premium na pag -aari",
    tr: "Kişisel Premium Varlıklar",
  },
  {
    "en-us": "Enterprise Premium Assets",
    cht: "企業保費資產",
    vi: "Tài sản cao cấp doanh nghiệp",
    th: "สินทรัพย์พรีเมี่ยมขององค์กร",
    id: "Aset Premium Perusahaan",
    ms: "Aset premium perusahaan",
    hi: "उद्यम प्रीमियम परिसंपत्तियां",
    pt: "Ativos premium corporativos",
    ko: "기업 프리미엄 자산",
    ja: "エンタープライズプレミアム資産",
    es: "Activos premium empresariales",
    de: "Enterprise Premium Assets",
    fr: "Actifs de primes d'entreprise",
    it: "Asset premium aziendali",
    pl: "Aktywa premium przedsiębiorstwa",
    ru: "Энтерправомерные премиальные активы",
    ara: "أصول المؤسسة المتميزة",
    ph: "Enterprise Premium Assets",
    tr: "Kurumsal Premium Varlıklar",
  },
  {
    "en-us":
      "This image has copyright license for commercial use and exclusive for Enterprise plan downloads.",
    cht: "此圖像具有用於商業用途的版權許可，並且具有企業計劃下載的獨家許可。",
    vi: "Hình ảnh này có giấy phép bản quyền cho sử dụng thương mại và độc quyền cho tải xuống kế hoạch doanh nghiệp.",
    th: "ภาพนี้มีใบอนุญาตลิขสิทธิ์สำหรับการใช้งานเชิงพาณิชย์และพิเศษสำหรับการดาวน์โหลดแผนองค์กร",
    id: "Gambar ini memiliki lisensi hak cipta untuk penggunaan komersial dan eksklusif untuk unduhan rencana perusahaan.",
    ms: "Imej ini mempunyai lesen hak cipta untuk kegunaan komersil dan eksklusif untuk muat turun pelan perusahaan.",
    hi: "इस छवि में वाणिज्यिक उपयोग के लिए कॉपीराइट लाइसेंस है और एंटरप्राइज़ प्लान डाउनलोड के लिए अनन्य है।",
    pt: "Esta imagem possui licença de direitos autorais para uso comercial e exclusivo para downloads de plano corporativo.",
    ko: "이 이미지에는 상업용 사용을위한 저작권 라이센스가 있으며 Enterprise Plan Downloads 독점.",
    ja: "この画像には、商用利用に関する著作権ライセンスがあり、エンタープライズプランのダウンロード専用です。",
    es: "Esta imagen tiene una licencia de derechos de autor para uso comercial y exclusivo para descargas de planes empresariales.",
    de: "Dieses Bild hat eine Urheberrechtslizenz für die kommerzielle Nutzung und exklusiv für Unternehmensplan -Downloads.",
    fr: "Cette image a une licence de copyright pour une utilisation commerciale et exclusive pour les téléchargements de plan d'entreprise.",
    it: "Questa immagine ha la licenza di copyright per uso commerciale ed esclusiva per i download di piani aziendali.",
    pl: "Ten obraz ma prawo autorskie do użytku komercyjnego i wyłącznie do pobrania planu przedsiębiorstwa.",
    ru: "Это изображение имеет лицензию на авторское право на коммерческое использование и эксклюзивное для загрузки планов предприятия.",
    ara: "تحتوي هذه الصورة على رخصة حقوق الطبع والنشر للاستخدام التجاري وحصريًا لتنزيلات خطة المؤسسات.",
    ph: "Ang imaheng ito ay may lisensya sa copyright para sa komersyal na paggamit at eksklusibo para sa mga pag -download ng plano ng negosyo.",
    tr: "Bu resmin ticari kullanım için telif hakkı lisansı vardır ve kurumsal plan indirmeleri için özeldir.",
  },
  {
    "en-us":
      "This image has copyright license and available for commercial use.",
    cht: "該圖像具有版權許可，可用於商業用途。",
    vi: "Hình ảnh này có giấy phép bản quyền và có sẵn cho sử dụng thương mại.",
    th: "ภาพนี้มีใบอนุญาตลิขสิทธิ์และพร้อมใช้งานในเชิงพาณิชย์",
    id: "Gambar ini memiliki lisensi hak cipta dan tersedia untuk penggunaan komersial.",
    ms: "Imej ini mempunyai lesen hak cipta dan tersedia untuk kegunaan komersil.",
    hi: "इस छवि में कॉपीराइट लाइसेंस है और व्यावसायिक उपयोग के लिए उपलब्ध है।",
    pt: "Esta imagem possui licença de direitos autorais e disponível para uso comercial.",
    ko: "이 이미지에는 저작권 라이센스가 있으며 상업용으로 사용할 수 있습니다.",
    ja: "この画像には著作権ライセンスがあり、商業用に利用可能です。",
    es: "Esta imagen tiene licencia de derechos de autor y disponible para uso comercial.",
    de: "Dieses Bild verfügt über eine Urheberrechtslizenz und zur kommerziellen Nutzung.",
    fr: "Cette image a une licence de copyright et disponible pour un usage commercial.",
    it: "Questa immagine ha una licenza di copyright e disponibile per uso commerciale.",
    pl: "Ten obraz ma prawo autorskie i jest dostępna do użytku komercyjnego.",
    ru: "Это изображение имеет лицензию на авторское право и доступно для коммерческого использования.",
    ara: "تحتوي هذه الصورة على رخصة حقوق الطبع والنشر ومتاحة للاستخدام التجاري.",
    ph: "Ang imaheng ito ay may lisensya sa copyright at magagamit para sa komersyal na paggamit.",
    tr: "Bu resmin telif hakkı lisansı vardır ve ticari kullanım için kullanılabilir.",
  },
  {
    "en-us":
      "This image has copyright license for commercial use and exclusive for Enterprise premium plans downloads.",
    cht: "此圖像具有商業用途的版權許可，並且具有企業高級計劃下載的獨家許可。",
    vi: "Hình ảnh này có giấy phép bản quyền cho sử dụng thương mại và độc quyền cho các gói hàng cao cấp doanh nghiệp.",
    th: "ภาพนี้มีใบอนุญาตลิขสิทธิ์สำหรับการใช้งานเชิงพาณิชย์และพิเศษสำหรับการดาวน์โหลดแผนระดับพรีเมี่ยมขององค์กร",
    id: "Gambar ini memiliki lisensi hak cipta untuk penggunaan komersial dan eksklusif untuk unduhan rencana premium perusahaan.",
    ms: "Imej ini mempunyai lesen hak cipta untuk kegunaan komersil dan eksklusif untuk muat turun pelan premium perusahaan.",
    hi: "इस छवि में वाणिज्यिक उपयोग के लिए कॉपीराइट लाइसेंस है और एंटरप्राइज़ प्रीमियम प्लान डाउनलोड के लिए अनन्य है।",
    pt: "Esta imagem possui licença de direitos autorais para uso comercial e exclusivo para downloads de planos premium corporativos.",
    ko: "이 이미지에는 상업용 사용을위한 저작권 라이센스가 있으며 Enterprise Premium Plans 다운로드 독점.",
    ja: "この画像には、商用利用に関する著作権ライセンスがあり、エンタープライズプレミアムプランのダウンロード専用です。",
    es: "Esta imagen tiene una licencia de derechos de autor para uso comercial y exclusivo para las descargas de planes premium empresariales.",
    de: "Dieses Bild hat eine Urheberrechtslizenz für die kommerzielle Nutzung und exklusiv für Unternehmens -Premium -Pläne.",
    fr: "Cette image a une licence de copyright pour une utilisation commerciale et exclusive pour les téléchargements de plans Premium Enterprise.",
    it: "Questa immagine ha la licenza di copyright per uso commerciale ed esclusiva per i download di piani premium aziendali.",
    pl: "Ten obraz ma prawo autorskie do użytku komercyjnego i wyłączne dla pobierania planów Premium Enterprise.",
    ru: "Это изображение имеет лицензию на авторское право на коммерческое использование и эксклюзивное для загрузки планов Enterprise Premium.",
    ara: "تحتوي هذه الصورة على ترخيص حقوق الطبع والنشر للاستخدام التجاري وحصريًا لتنزيلات خطط Enterprise Premium.",
    ph: "Ang imaheng ito ay may lisensya sa copyright para sa komersyal na paggamit at eksklusibo para sa mga pag -download ng mga plano sa premium ng Enterprise.",
    tr: "Bu görüntü ticari kullanım için telif hakkı lisansına sahiptir ve Enterprise Premium planları indirmeleri için özeldir.",
  },
  {
    "en-us": "Upgrade to enterprise premium plan",
    cht: "升級到企業高級計劃",
    vi: "Nâng cấp lên kế hoạch cao cấp doanh nghiệp",
    th: "อัพเกรดเป็นแผนพรีเมี่ยมของ Enterprise",
    id: "Tingkatkan ke Paket Premium Perusahaan",
    ms: "Naik taraf ke Rancangan Premium Enterprise",
    hi: "उद्यम प्रीमियम योजना में अपग्रेड करें",
    pt: "Atualizar para o Plano Premium Enterprise",
    ko: "Enterprise Premium Plan으로 업그레이드",
    ja: "エンタープライズプレミアムプランへのアップグレード",
    es: "Actualizar al plan premium empresarial",
    de: "Upgrade auf Enterprise Premium Plan",
    fr: "Passer à Enterprise Premium Plan",
    it: "Aggiornamento al piano premium aziendale",
    pl: "Uaktualnia do Planu Premium Enterprise",
    ru: "Обновить до плана Enterprise Premium",
    ara: "الترقية إلى خطة قسط المؤسسات",
    ph: "Mag -upgrade sa Enterprise Premium Plan",
    tr: "Enterprise Premium Planına Yükseltme",
  },
  {
    "en-us": "Upgrade to premium plan",
    cht: "升級到高級計劃",
    vi: "Nâng cấp lên kế hoạch cao cấp",
    th: "อัพเกรดเป็นแผนพรีเมี่ยม",
    id: "Tingkatkan ke Paket Premium",
    ms: "Naik taraf ke rancangan premium",
    hi: "प्रीमियम योजना में अपग्रेड",
    pt: "Atualizar para o Plano Premium",
    ko: "프리미엄 계획으로 업그레이드",
    ja: "プレミアムプランにアップグレードします",
    es: "Actualizar al plan premium",
    de: "Upgrade auf Premium -Plan",
    fr: "Passer à un plan premium",
    it: "Aggiorna al piano premium",
    pl: "Uaktualnij do planu premium",
    ru: "Обновить до премиального плана",
    ara: "الترقية إلى خطة الممتازة",
    ph: "Mag -upgrade sa premium na plano",
    tr: "Premium Plana Yükseltme",
  },
  {
    "en-us": "and get enterprise commercial use license.",
    cht: "並獲得企業商業使用許可。",
    vi: "và nhận giấy phép sử dụng thương mại doanh nghiệp.",
    th: "และรับใบอนุญาตการใช้งานเชิงพาณิชย์ระดับองค์กร",
    id: "dan dapatkan lisensi penggunaan komersial perusahaan.",
    ms: "dan dapatkan lesen penggunaan komersial perusahaan.",
    hi: "और एंटरप्राइज कमर्शियल यूज़ लाइसेंस प्राप्त करें।",
    pt: "e obter licença de uso comercial corporativo.",
    ko: "엔터프라이즈 상업용 사용 라이센스를 얻으십시오.",
    ja: "エンタープライズコマーシャル使用ライセンスを取得します。",
    es: "y obtener una licencia de uso comercial empresarial.",
    de: "und erhalten Sie eine Lizenz für kommerzielle Nutzung von Enterprise.",
    fr: "et obtenir une licence d'utilisation commerciale d'entreprise.",
    it: "e ottenere la licenza di utilizzo commerciale aziendale.",
    pl: "i uzyskaj licencję na użytek komercyjny dla przedsiębiorstw.",
    ru: "и получить лицензию на коммерческое использование предприятия.",
    ara: "والحصول على ترخيص الاستخدام التجاري للمؤسسة.",
    ph: "at kumuha ng lisensya sa paggamit ng komersyal na negosyo.",
    tr: "ve kurumsal ticari kullanım lisansını alın.",
  },
  {
    "en-us": "and get commercial use license.",
    cht: "並獲得商業使用許可證。",
    vi: "và nhận giấy phép sử dụng thương mại.",
    th: "และรับใบอนุญาตการใช้งานเชิงพาณิชย์",
    id: "dan dapatkan lisensi penggunaan komersial.",
    ms: "dan dapatkan lesen penggunaan komersial.",
    hi: "और वाणिज्यिक उपयोग लाइसेंस प्राप्त करें।",
    pt: "e obter licença de uso comercial.",
    ko: "상업용 사용 라이센스를 얻습니다.",
    ja: "商用使用ライセンスを取得します。",
    es: "y obtener licencia de uso comercial.",
    de: "und eine kommerzielle Nutzungslizenz erhalten.",
    fr: "et obtenir une licence d'utilisation commerciale.",
    it: "e ottenere la licenza di uso commerciale.",
    pl: "i uzyskaj licencję na użytek komercyjny.",
    ru: "и получить лицензию на коммерческое использование.",
    ara: "واحصل على ترخيص الاستخدام التجاري.",
    ph: "at kumuha ng lisensya sa paggamit ng komersyal.",
    tr: "ve ticari kullanım lisansı alın.",
  },
  {
    "en-us": "Valentine's Day",
    cht: "情人節",
    vi: "Ngày lễ tình nhân",
    th: "วันวาเลนไทน์",
    id: "Hari Valentine",
    ms: "Hari Valentine",
    hi: "वेलेंटाइन्स डे",
    pt: "Dia dos Namorados",
    ko: "발렌타인 데이",
    ja: "バレンタインデー",
    es: "Día de San Valentín",
    de: "Valentinstag",
    fr: "Saint Valentin",
    it: "San Valentino",
    pl: "Walentynki",
    ru: "День святого Валентина",
    ara: "عيد الحب",
    ph: "Araw ng mga Puso",
    tr: "Sevgililer Günü",
  },
  {
    "en-us": "Enterprise Premium User",
    cht: "企業高級用戶",
    vi: "Người dùng cao cấp doanh nghiệp",
    th: "ผู้ใช้ระดับพรีเมี่ยมขององค์กร",
    id: "Pengguna Premium Perusahaan",
    ms: "Pengguna Premium Enterprise",
    hi: "उद्यम प्रीमियम उपयोगकर्ता",
    pt: "Usuário premium corporativo",
    ko: "엔터프라이즈 프리미엄 사용자",
    ja: "エンタープライズプレミアムユーザー",
    es: "Usuario premium empresarial",
    de: "Enterprise Premium -Benutzer",
    fr: "Utilisateur Premium d'entreprise",
    it: "Utente premium aziendale",
    pl: "Użytkownik Premium Enterprise",
    ru: "Enterprise Premium пользователь",
    ara: "Enterprise Premium User",
    ph: "Ang gumagamit ng Premium ng Enterprise",
    tr: "Kurumsal Premium Kullanıcı",
  },
  {
    "en-us": "For enterprise commercial use",
    cht: "用於企業商業用途",
    vi: "Cho sử dụng thương mại doanh nghiệp",
    th: "สำหรับการใช้งานเชิงพาณิชย์ขององค์กร",
    id: "Untuk penggunaan komersial perusahaan",
    ms: "Untuk kegunaan komersial perusahaan",
    hi: "उद्यम वाणिज्यिक उपयोग के लिए",
    pt: "Para uso comercial corporativo",
    ko: "기업 상업용 용도",
    ja: "エンタープライズコマーシャルでの使用",
    es: "Para uso comercial empresarial",
    de: "Für die kommerzielle Nutzung des Unternehmens",
    fr: "Pour une utilisation commerciale d'entreprise",
    it: "Per uso commerciale aziendale",
    pl: "Do użytku komercyjnego przedsiębiorstwa",
    ru: "Для коммерческого использования предприятия",
    ara: "للاستخدام التجاري للمؤسسة",
    ph: "Para sa paggamit ng komersyal na negosyo",
    tr: "Kurumsal ticari kullanım için",
  },
  {
    "en-us": "Personal Commercial Use",
    cht: "個人商業用途",
    vi: "Sử dụng thương mại cá nhân",
    th: "การใช้งานเชิงพาณิชย์ส่วนบุคคล",
    id: "Penggunaan komersial pribadi",
    ms: "Penggunaan komersial peribadi",
    hi: "व्यक्तिगत वाणिज्यिक उपयोग",
    pt: "Uso comercial pessoal",
    ko: "개인 상업적 사용",
    ja: "個人的な商業利用",
    es: "Uso comercial personal",
    de: "Persönliche kommerzielle Verwendung",
    fr: "Utilisation commerciale personnelle",
    it: "Uso commerciale personale",
    pl: "Osobiste użycie komercyjne",
    ru: "Личное коммерческое использование",
    ara: "الاستخدام التجاري الشخصي",
    ph: "Personal na komersyal na paggamit",
    tr: "Kişisel Ticari Kullanım",
  },
  {
    "en-us": "License",
    cht: "執照",
    vi: "Giấy phép",
    th: "ใบอนุญาต",
    id: "Lisensi",
    ms: "Lesen",
    hi: "लाइसेंस",
    pt: "Licença",
    ko: "특허",
    ja: "ライセンス",
    es: "Licencia",
    de: "Lizenz",
    fr: "Licence",
    it: "Licenza",
    pl: "Licencja",
    ru: "Лицензия",
    ara: "رخصة",
    ph: "Lisensya",
    tr: "Lisans",
  },
  {
    "en-us": "Permanent access to all personal premium assets",
    cht: "永久訪問所有個人高級資產",
    vi: "Truy cập vĩnh viễn vào tất cả các tài sản phí bảo hiểm cá nhân",
    th: "การเข้าถึงสินทรัพย์พรีเมี่ยมส่วนบุคคลอย่างถาวร",
    id: "Akses permanen ke semua aset premium pribadi",
    ms: "Akses kekal ke semua aset premium peribadi",
    hi: "सभी व्यक्तिगत प्रीमियम परिसंपत्तियों तक स्थायी पहुंच",
    pt: "Acesso permanente a todos os ativos premium pessoal",
    ko: "모든 개인 프리미엄 자산에 대한 영구적 인 액세스",
    ja: "すべての個人的なプレミアム資産への恒久的なアクセス",
    es: "Acceso permanente a todos los activos de prima personal",
    de: "Permanenter Zugang zu allen persönlichen Premium -Vermögenswerten",
    fr: "Accès permanent à tous les actifs de primes personnels",
    it: "Accesso permanente a tutte le attività premium personali",
    pl: "Stały dostęp do wszystkich osobistych zasobów premium",
    ru: "Постоянный доступ ко всем личным премиальным активам",
    ara: "الوصول الدائم إلى جميع الأصول الشخصية الشخصية",
    ph: "Permanenteng pag -access sa lahat ng mga personal na premium na pag -aari",
    tr: "Tüm kişisel prim varlıklarına kalıcı erişim",
  },
  {
    "en-us": "Download only for enterprise premium members",
    cht: "僅用於企業高級會員",
    vi: "Chỉ tải xuống cho các thành viên cao cấp của Enterprise",
    th: "ดาวน์โหลดเฉพาะสมาชิกระดับพรีเมี่ยมของ Enterprise",
    id: "Unduh hanya untuk anggota premium perusahaan",
    ms: "Muat turun hanya untuk ahli Premium Enterprise",
    hi: "केवल एंटरप्राइज़ प्रीमियम सदस्यों के लिए डाउनलोड करें",
    pt: "Baixe apenas para membros do Enterprise Premium",
    ko: "Enterprise Premium 회원에 대해서만 다운로드하십시오",
    ja: "エンタープライズプレミアムメンバーのみをダウンロードしてください",
    es: "Descargar solo para miembros de Enterprise Premium",
    de: "Download nur für Enterprise Premium -Mitglieder",
    fr: "Télécharger uniquement pour les membres de l'entreprise Premium",
    it: "Scarica solo per i membri di Enterprise Premium",
    pl: "Pobierz tylko dla członków Premium Enterprise",
    ru: "Скачать только для участников Enterprise Premium",
    ara: "قم بتنزيل فقط لأعضاء Enterprise Premium",
    ph: "I -download lamang para sa mga miyembro ng Premium ng Enterprise",
    tr: "Yalnızca Enterprise Premium üyeleri için indirin",
  },
  {
    "en-us": "Upgrade to premium plan and get commercial use license.",
    cht: "升級到高級計劃並獲得商業使用許可。",
    vi: "Nâng cấp lên kế hoạch cao cấp và nhận giấy phép sử dụng thương mại.",
    th: "อัพเกรดเป็นแผนพรีเมี่ยมและรับใบอนุญาตการใช้งานเชิงพาณิชย์",
    id: "Tingkatkan ke Paket Premium dan Dapatkan Lisensi Penggunaan Komersial.",
    ms: "Naik taraf ke pelan premium dan dapatkan lesen penggunaan komersial.",
    hi: "प्रीमियम प्लान में अपग्रेड करें और वाणिज्यिक उपयोग लाइसेंस प्राप्त करें।",
    pt: "Atualize para o Plano Premium e obtenha licença de uso comercial.",
    ko: "프리미엄 계획으로 업그레이드하고 상업용 사용 라이센스를 얻습니다.",
    ja: "プレミアムプランにアップグレードし、商用使用ライセンスを取得します。",
    es: "Actualice al plan premium y obtenga una licencia de uso comercial.",
    de: "Upgrade auf Premium -Plan und eine lizenzige Nutzungslizenz erhalten.",
    fr: "Passez à un plan premium et obtenez une licence d'utilisation commerciale.",
    it: "Aggiorna al piano premium e ottieni la licenza di utilizzo commerciale.",
    pl: "Uaktualnij do planu premium i uzyskaj licencję na użytek komercyjny.",
    ru: "Обновите до премиального плана и получите лицензию на коммерческое использование.",
    ara: "الترقية إلى خطة متميزة والحصول على ترخيص الاستخدام التجاري.",
    ph: "Mag -upgrade sa premium na plano at makakuha ng lisensya sa paggamit ng komersyal.",
    tr: "Premium plana yükseltin ve ticari kullanım lisansı alın.",
  },
  {
    "en-us": "Free assets only",
    cht: "僅免費資產",
    vi: "Chỉ có tài sản miễn phí",
    th: "สินทรัพย์ฟรีเท่านั้น",
    id: "Aset gratis saja",
    ms: "Aset percuma sahaja",
    hi: "केवल नि: शुल्क संपत्ति",
    pt: "Apenas ativos gratuitos",
    ko: "무료 자산 만",
    ja: "無料の資産のみ",
    es: "Solo activos gratis",
    de: "Nur freie Vermögenswerte",
    fr: "Actifs gratuits uniquement",
    it: "Solo beni gratuiti",
    pl: "Tylko wolne aktywa",
    ru: "Только бесплатные активы",
    ara: "أصول مجانية فقط",
    ph: "Libreng mga pag -aari lamang",
    tr: "Yalnızca ücretsiz varlıklar",
  },
  {
    "en-us": "Personal Premium Assets",
    cht: "個人高級資產",
    vi: "Tài sản cao cấp cá nhân",
    th: "สินทรัพย์พรีเมี่ยมส่วนบุคคล",
    id: "Aset premium pribadi",
    ms: "Aset premium peribadi",
    hi: "व्यक्तिगत प्रीमियम परिसंपत्तियां",
    pt: "Ativos premium pessoal",
    ko: "개인 프리미엄 자산",
    ja: "個人的なプレミアム資産",
    es: "Activos de prima personal",
    de: "Persönliche Premium -Vermögenswerte",
    fr: "Actifs de primes personnelles",
    it: "Beni premium personali",
    pl: "Osobiste zasoby premium",
    ru: "Личные премиальные активы",
    ara: "الأصول المميزة الشخصية",
    ph: "Mga personal na premium na pag -aari",
    tr: "Kişisel Premium Varlıklar",
  },
];
const result = {};
const name = [
  "",
  "",
  "",
  "",
  "",
  "",
  "detail_download_desc",
  "detail_download_desc1",
  "detail_download_desc2",
];
export default function HomePage() {
  async function ren() {
    for (let i = a.length; i < text.length; ) {
      const item: string = text[i];
      const res = await pikbestAdminHost.get(
        `/translate?text=${item.replaceAll(" ", "+")}`
      );
      a.push(res.data);
      console.log(a);

      i++;
    }
  }

  function format() {
    a.forEach((item, index) => {
      const langKey =
        name[index] ||
        item["en-us"]
          .toLocaleLowerCase()
          .replaceAll(" ", "_")
          .replaceAll("(", "")
          .replaceAll(")", "")
          .replaceAll(",", "")
          .replaceAll(".", "");

      Object.keys(item).forEach((key) => {
        const val = item[key];

        if (!result[key]) {
          Object.assign(result, { [key]: {} });
        }
        Object.assign(result[key], { [langKey]: val });
      });
    });
    console.log(result);

    Object.keys(result).forEach((item) => {
      let php_array = "";
      Object.keys(result[item]).forEach((k) => {
        php_array += `"${k}"=>"${result[item][k]}",\n`;
      });

      console.log(item, "===>", php_array);
    });
  }

  useEffect(() => {
    // ren();
    format();
  }, []);
  return <div></div>;
}
