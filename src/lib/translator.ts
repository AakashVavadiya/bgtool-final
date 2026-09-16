/**
 * Custom Localization & Translation Engine (100% Client-Side)
 * No External Google Scripts · No Weird Top Banners · Instant & Smooth
 */

export interface TranslationLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  category: "popular" | "indian" | "european" | "asian" | "global";
  region?: string;
}

export const SUPPORTED_WEBSITE_LANGUAGES: TranslationLanguage[] = [
  // ── Popular / Top Global ──────────────────────────────────────────
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", category: "popular", region: "Global / US / UK" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳", category: "indian", region: "India (Gujarat)" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", category: "indian", region: "India (भारत)" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", category: "popular", region: "Spain / Latin America" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", category: "popular", region: "France / Canada" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", category: "popular", region: "Germany / Austria" },
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文", flag: "🇨🇳", category: "popular", region: "China (中国)" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", category: "popular", region: "Japan (日本)" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", category: "popular", region: "Middle East / UAE / Saudi" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", category: "popular", region: "Russia / CIS" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷", category: "popular", region: "Brazil / Portugal" },

  // ── Indian Regional Languages ─────────────────────────────────────
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳", category: "indian", region: "India / Bangladesh" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", category: "indian", region: "India / Sri Lanka" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", category: "indian", region: "India (AP / Telangana)" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳", category: "indian", region: "India (Maharashtra)" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳", category: "indian", region: "India (Karnataka)" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳", category: "indian", region: "India (Kerala)" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳", category: "indian", region: "India (Punjab)" },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰", category: "indian", region: "Pakistan / South Asia" },

  // ── European Languages ────────────────────────────────────────────
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", category: "european", region: "Italy" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱", category: "european", region: "Netherlands / Belgium" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱", category: "european", region: "Poland" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", category: "european", region: "Turkey" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦", category: "european", region: "Ukraine" },
  { code: "ro", name: "Romanian", nativeName: "Română", flag: "🇷🇴", category: "european", region: "Romania" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷", category: "european", region: "Greece" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪", category: "european", region: "Sweden" },
  { code: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿", category: "european", region: "Czech Republic" },
  { code: "da", name: "Danish", nativeName: "Dansk", flag: "🇩🇰", category: "european", region: "Denmark" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", flag: "🇫🇮", category: "european", region: "Finland" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", flag: "🇳🇴", category: "european", region: "Norway" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", flag: "🇭🇺", category: "european", region: "Hungary" },

  // ── Asian & Middle Eastern Languages ──────────────────────────────
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", category: "asian", region: "South Korea (대한민국)" },
  { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文", flag: "🇹🇼", category: "asian", region: "Taiwan / HK" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩", category: "asian", region: "Indonesia" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾", category: "asian", region: "Malaysia" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳", category: "asian", region: "Vietnam" },
  { code: "th", name: "Thai", nativeName: "ภาษาไทย", flag: "🇹🇭", category: "asian", region: "Thailand" },
  { code: "he", name: "Hebrew", nativeName: "עברית", flag: "🇮🇱", category: "asian", region: "Israel" },
  { code: "fa", name: "Persian", nativeName: "فارسی", flag: "🇮🇷", category: "asian", region: "Iran / Middle East" },
  { code: "tl", name: "Tagalog", nativeName: "Filipino", flag: "🇵🇭", category: "asian", region: "Philippines" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪", category: "global", region: "East Africa" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans", flag: "🇿🇦", category: "global", region: "South Africa" },
];

const STORAGE_KEY = "bg_user_selected_language";
const AUTO_DETECTED_KEY = "bg_user_auto_detected_language";

// ── CUSTOM MULTI-LANGUAGE DICTIONARY ─────────────────────────────────────────
export const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  // 1. Gujarati (ગુજરાતી)
  gu: {
    "Home.": "હોમ.",
    "Models.": "મોડલ્સ.",
    "Tools.": "ટૂલ્સ.",
    "Smart Assistant.": "સ્માર્ટ સહાયક.",
    "Pricing.": "કિંમત.",
    "FAQ.": "પ્રશ્નો.",
    "Log in": "લોગ ઇન",
    "Sign up": "સાઇન અપ",
    "Upload Image": "ઇમેજ અપલોડ કરો",
    "Upload an image": "ઇમેજ અપલોડ કરો",
    "Drag and drop image here": "ઇમેજ અહીં ડ્રેગ અને ડ્રોપ કરો",
    "Download": "ડાઉનલોડ કરો",
    "Download File": "ફાઇલ ડાઉનલોડ કરો",
    "Download Result": "પરિણામ ડાઉનલોડ કરો",
    "Download BINARY File": "બાઈનરી ફાઇલ ડાઉનલોડ કરો",
    "Convert another File": "બીજી ફાઇલ કન્વર્ટ કરો",
    "Change Settings": "સેટિંગ્સ બદલો",
    "Open in Code Editor": "કોડ એડિટરમાં ખોલો",
    "Copy Text": "ટેક્સ્ટ કોપી કરો",
    "Extracted Content": "કાઢેલ કન્ટેન્ટ",
    "Website Language": "વેબસાઇટ ભાષા",
    "Switch to English": "English માં બદલો",
    "Popular Languages": "લોકપ્રિય ભાષાઓ",
    "Indian Languages": "ભારતીય ભાષાઓ",
    "All Languages": "બધી ભાષાઓ",
    "Search languages...": "ભાષા શોધો...",
    "Remove Background with AI": "AI સાથે બેકગ્રાઉન્ડ દૂર કરો",
    "Free & Fast": "મફત અને ઝડપી",
    "100% Automatic": "૧૦૦% સ્વચાલિત",
    "No Watermark": "કોઈ વૉટરમાર્ક નથી",
    "Processing Image…": "ઇમેજ પ્રોસેસ થઈ રહી છે…",
    "Enlarge": "મોટું કરો",
    "Hold for Original": "મૂળ જોવા માટે દબાવી રાખો",
    "Showing Original": "મૂળ ઇમેજ બતાવી રહ્યું છે",
    "Change File": "ફાઇલ બદલો",
  },

  // 2. Hindi (हिन्दी)
  hi: {
    "Home.": "होम.",
    "Models.": "मॉडल्स.",
    "Tools.": "टूल्स.",
    "Smart Assistant.": "स्मार्ट असिस्टेंट.",
    "Pricing.": "मूल्य निर्धारण.",
    "FAQ.": "सामान्य प्रश्न.",
    "Log in": "लॉग इन",
    "Sign up": "साइन अप",
    "Upload Image": "इमेज अपलोड करें",
    "Upload an image": "इमेज अपलोड करें",
    "Drag and drop image here": "इमेज यहाँ खींचें और छोड़ें",
    "Download": "डाउनलोड करें",
    "Download File": "फाइल डाउनलोड करें",
    "Download Result": "परिणाम डाउनलोड करें",
    "Download BINARY File": "बाइनरी फ़ाइल डाउनलोड करें",
    "Convert another File": "दूसरी फाइल कन्वर्ट करें",
    "Change Settings": "सेटिंग्स बदलें",
    "Open in Code Editor": "कोड एडिटर में खोलें",
    "Copy Text": "टेक्स्ट कॉपी करें",
    "Extracted Content": "निकाली गई सामग्री",
    "Website Language": "वेबसाइट भाषा",
    "Switch to English": "English में बदलें",
    "Popular Languages": "लोकप्रिय भाषाएं",
    "Indian Languages": "भारतीय भाषाएं",
    "All Languages": "सभी भाषाएं",
    "Search languages...": "भाषा खोजें...",
    "Remove Background with AI": "AI से बैकग्राउंड हटाएं",
    "Free & Fast": "मुफ्त और तेज",
    "100% Automatic": "100% स्वचालित",
    "No Watermark": "कोई वॉटरमार्क नहीं",
    "Processing Image…": "इमेज प्रोसेस हो रही है…",
    "Enlarge": "बड़ा करें",
    "Hold for Original": "मूल देखने के लिए दबाए रखें",
    "Showing Original": "मूल इमेज दिख रही है",
    "Change File": "फाइल बदलें",
  },

  // 3. Spanish (Español)
  es: {
    "Home.": "Inicio.",
    "Models.": "Modelos.",
    "Tools.": "Herramientas.",
    "Smart Assistant.": "Asistente Inteligente.",
    "Pricing.": "Precios.",
    "FAQ.": "Preguntas.",
    "Log in": "Iniciar sesión",
    "Sign up": "Registrarse",
    "Upload Image": "Subir imagen",
    "Upload an image": "Subir una imagen",
    "Drag and drop image here": "Arrastra y suelta tu imagen aquí",
    "Download": "Descargar",
    "Download File": "Descargar archivo",
    "Download Result": "Descargar resultado",
    "Download BINARY File": "Descargar archivo binario",
    "Convert another File": "Convertir otro archivo",
    "Change Settings": "Cambiar configuración",
    "Open in Code Editor": "Abrir en editor de código",
    "Copy Text": "Copiar texto",
    "Extracted Content": "Contenido extraído",
    "Website Language": "Idioma del sitio web",
    "Switch to English": "Cambiar a English",
    "Popular Languages": "Idiomas populares",
    "Indian Languages": "Idiomas de India",
    "All Languages": "Todos los idiomas",
    "Search languages...": "Buscar idiomas...",
    "Remove Background with AI": "Eliminar fondo con IA",
    "Free & Fast": "Gratis y rápido",
    "100% Automatic": "100% Automático",
    "No Watermark": "Sin marca de agua",
    "Processing Image…": "Procesando imagen…",
    "Enlarge": "Ampliar",
    "Hold for Original": "Mantén presionado para original",
    "Showing Original": "Mostrando original",
    "Change File": "Cambiar archivo",
  },

  // 4. French (Français)
  fr: {
    "Home.": "Accueil.",
    "Models.": "Modèles.",
    "Tools.": "Outils.",
    "Smart Assistant.": "Assistant IA.",
    "Pricing.": "Tarifs.",
    "FAQ.": "FAQ.",
    "Log in": "Connexion",
    "Sign up": "S'inscrire",
    "Upload Image": "Téléverser l'image",
    "Upload an image": "Téléverser une image",
    "Drag and drop image here": "Glissez-déposez votre image ici",
    "Download": "Télécharger",
    "Download File": "Télécharger le fichier",
    "Download Result": "Télécharger le résultat",
    "Download BINARY File": "Télécharger fichier binaire",
    "Convert another File": "Convertir un autre fichier",
    "Change Settings": "Modifier les paramètres",
    "Open in Code Editor": "Ouvrir dans l'éditeur de code",
    "Copy Text": "Copier le texte",
    "Extracted Content": "Contenu extrait",
    "Website Language": "Langue du site",
    "Switch to English": "Passer à l'anglais",
    "Popular Languages": "Langues populaires",
    "All Languages": "Toutes les langues",
    "Search languages...": "Rechercher une langue...",
    "Remove Background with AI": "Supprimer le fond avec l'IA",
    "Free & Fast": "Gratuit et rapide",
    "100% Automatic": "100% Automatique",
    "No Watermark": "Sans filigrane",
    "Processing Image…": "Traitement de l'image…",
    "Enlarge": "Agrandir",
    "Hold for Original": "Maintenir pour original",
    "Showing Original": "Original affiché",
    "Change File": "Changer de fichier",
  },

  // 5. German (Deutsch)
  de: {
    "Home.": "Startseite.",
    "Models.": "Modelle.",
    "Tools.": "Werkzeuge.",
    "Smart Assistant.": "KI-Assistent.",
    "Pricing.": "Preise.",
    "FAQ.": "FAQ.",
    "Log in": "Anmelden",
    "Sign up": "Registrieren",
    "Upload Image": "Bild hochladen",
    "Upload an image": "Ein Bild hochladen",
    "Drag and drop image here": "Bild hierher ziehen und ablegen",
    "Download": "Herunterladen",
    "Download File": "Datei herunterladen",
    "Download Result": "Ergebnis herunterladen",
    "Download BINARY File": "Binärdatei herunterladen",
    "Convert another File": "Weitere Datei konvertieren",
    "Change Settings": "Einstellungen ändern",
    "Open in Code Editor": "Im Code-Editor öffnen",
    "Copy Text": "Text kopieren",
    "Extracted Content": "Extrahierter Inhalt",
    "Website Language": "Webseiten-Sprache",
    "Switch to English": "Zu Englisch wechseln",
    "Popular Languages": "Beliebte Sprachen",
    "All Languages": "Alle Sprachen",
    "Search languages...": "Sprachen suchen...",
    "Remove Background with AI": "Hintergrund mit KI entfernen",
    "Free & Fast": "Kostenlos & Schnell",
    "100% Automatic": "100% Automatisch",
    "No Watermark": "Kein Wasserzeichen",
    "Processing Image…": "Bild wird verarbeitet…",
    "Enlarge": "Vergrößern",
    "Hold for Original": "Gedrückt halten für Original",
    "Showing Original": "Original wird angezeigt",
    "Change File": "Datei ändern",
  },

  // 6. Chinese Simplified (简体中文)
  "zh-CN": {
    "Home.": "首页.",
    "Models.": "模型.",
    "Tools.": "工具.",
    "Smart Assistant.": "智能助手.",
    "Pricing.": "定价.",
    "FAQ.": "常见问题.",
    "Log in": "登录",
    "Sign up": "注册",
    "Upload Image": "上传图片",
    "Upload an image": "上传一张图片",
    "Drag and drop image here": "将图片拖放到此处",
    "Download": "下载",
    "Download File": "下载文件",
    "Download Result": "下载结果",
    "Download BINARY File": "下载二进制文件",
    "Convert another File": "转换另一个文件",
    "Change Settings": "更改设置",
    "Open in Code Editor": "在代码编辑器中打开",
    "Copy Text": "复制文本",
    "Extracted Content": "提取的内容",
    "Website Language": "网站语言",
    "Switch to English": "切换到英文",
    "Popular Languages": "热门语言",
    "All Languages": "所有语言",
    "Search languages...": "搜索语言...",
    "Remove Background with AI": "使用 AI 抠图去除背景",
    "Free & Fast": "免费且快速",
    "100% Automatic": "100% 全自动",
    "No Watermark": "无水印",
    "Processing Image…": "正在处理图片…",
    "Enlarge": "放大查看",
    "Hold for Original": "按住查看原图",
    "Showing Original": "正在显示原图",
    "Change File": "更改文件",
  },

  // 7. Japanese (日本語)
  ja: {
    "Home.": "ホーム.",
    "Models.": "モデル.",
    "Tools.": "ツール.",
    "Smart Assistant.": "スマートアシスタント.",
    "Pricing.": "料金.",
    "FAQ.": "よくある質問.",
    "Log in": "ログイン",
    "Sign up": "新規登録",
    "Upload Image": "画像をアップロード",
    "Upload an image": "画像をアップロードする",
    "Drag and drop image here": "画像をここにドラッグ＆ドロップ",
    "Download": "ダウンロード",
    "Download File": "ファイルをダウンロード",
    "Download Result": "結果をダウンロード",
    "Download BINARY File": "バイナリファイルをダウンロード",
    "Convert another File": "別のファイルを変換",
    "Change Settings": "設定を変更",
    "Open in Code Editor": "コードエディタで開く",
    "Copy Text": "テキストをコピー",
    "Extracted Content": "抽出されたコンテンツ",
    "Website Language": "ウェブサイトの言語",
    "Switch to English": "英語に戻す",
    "Popular Languages": "人気の言語",
    "All Languages": "すべての言語",
    "Search languages...": "言語を検索...",
    "Remove Background with AI": "AIで背景を自動削除",
    "Free & Fast": "高速かつ無料",
    "100% Automatic": "100% 自動処理",
    "No Watermark": "透かしなし",
    "Processing Image…": "画像を処理中…",
    "Enlarge": "拡大表示",
    "Hold for Original": "長押しで元画像を表示",
    "Showing Original": "元画像を表示中",
    "Change File": "ファイルを変更",
  },

  // 8. Arabic (العربية)
  ar: {
    "Home.": "الرئيسية.",
    "Models.": "النماذج.",
    "Tools.": "الأدوات.",
    "Smart Assistant.": "المساعد الذكي.",
    "Pricing.": "الأسعار.",
    "FAQ.": "الأسئلة الشائعة.",
    "Log in": "تسجيل الدخول",
    "Sign up": "إنشاء حساب",
    "Upload Image": "تحميل الصورة",
    "Upload an image": "تحميل صورة",
    "Drag and drop image here": "اسحب الصورة وأفلتها هنا",
    "Download": "تنزيل",
    "Download File": "تنزيل الملف",
    "Download Result": "تنزيل النتيجة",
    "Download BINARY File": "تنزيل ملف ثنائي",
    "Convert another File": "تحويل ملف آخر",
    "Change Settings": "تغيير الإعدادات",
    "Open in Code Editor": "فتح في محرر الكود",
    "Copy Text": "نسخ النص",
    "Extracted Content": "المحتوى المستخرج",
    "Website Language": "لغة الموقع",
    "Switch to English": "التبديل إلى الإنجليزية",
    "Popular Languages": "اللغات الشائعة",
    "All Languages": "جميع اللغات",
    "Search languages...": "البحث عن لغة...",
    "Remove Background with AI": "إزالة الخلفية بالذكاء الاصطناعي",
    "Free & Fast": "مجاني وسريع",
    "100% Automatic": "100% تلقائي",
    "No Watermark": "بدون علامة مائية",
    "Processing Image…": "جارٍ معالجة الصورة…",
    "Enlarge": "تكبير",
    "Hold for Original": "اضغط باستمرار للأصلية",
    "Showing Original": "عرض الصورة الأصلية",
    "Change File": "تغيير الملف",
  },

  // 9. Russian (Русский)
  ru: {
    "Home.": "Главная.",
    "Models.": "Модели.",
    "Tools.": "Инструменты.",
    "Smart Assistant.": "Умный помощник.",
    "Pricing.": "Цены.",
    "FAQ.": "Вопросы и ответы.",
    "Log in": "Войти",
    "Sign up": "Регистрация",
    "Upload Image": "Загрузить изображение",
    "Upload an image": "Загрузить фото",
    "Drag and drop image here": "Перетащите изображение сюда",
    "Download": "Скачать",
    "Download File": "Скачать файл",
    "Download Result": "Скачать результат",
    "Download BINARY File": "Скачать двоичный файл",
    "Convert another File": "Конвертировать другой файл",
    "Change Settings": "Изменить настройки",
    "Open in Code Editor": "Открыть в редакторе кода",
    "Copy Text": "Копировать текст",
    "Extracted Content": "Извлеченный контент",
    "Website Language": "Язык сайта",
    "Switch to English": "Переключить на English",
    "Popular Languages": "Популярные языки",
    "All Languages": "Все языки",
    "Search languages...": "Поиск языка...",
    "Remove Background with AI": "Удалить фон с помощью ИИ",
    "Free & Fast": "Бесплатно и быстро",
    "100% Automatic": "100% Автоматически",
    "No Watermark": "Без водяных знаков",
    "Processing Image…": "Обработка изображения…",
    "Enlarge": "Увеличить",
    "Hold for Original": "Удерживайте для оригинала",
    "Showing Original": "Показан оригинал",
    "Change File": "Сменить файл",
  },

  // 10. Portuguese (Português)
  pt: {
    "Home.": "Início.",
    "Models.": "Modelos.",
    "Tools.": "Ferramentas.",
    "Smart Assistant.": "Assistente Inteligente.",
    "Pricing.": "Preços.",
    "FAQ.": "Perguntas.",
    "Log in": "Entrar",
    "Sign up": "Cadastre-se",
    "Upload Image": "Enviar imagem",
    "Upload an image": "Enviar uma imagem",
    "Drag and drop image here": "Arraste e solte a imagem aqui",
    "Download": "Baixar",
    "Download File": "Baixar arquivo",
    "Download Result": "Baixar resultado",
    "Download BINARY File": "Baixar arquivo binário",
    "Convert another File": "Converter outro arquivo",
    "Change Settings": "Alterar configurações",
    "Open in Code Editor": "Abrir no editor de código",
    "Copy Text": "Copiar texto",
    "Extracted Content": "Conteúdo extraído",
    "Website Language": "Idioma do site",
    "Switch to English": "Mudar para English",
    "Popular Languages": "Idiomas populares",
    "All Languages": "Todos os idiomas",
    "Search languages...": "Pesquisar idiomas...",
    "Remove Background with AI": "Remover fundo com IA",
    "Free & Fast": "Grátis e rápido",
    "100% Automatic": "100% Automático",
    "No Watermark": "Sem marca d'água",
    "Processing Image…": "Processando imagem…",
    "Enlarge": "Ampliar",
    "Hold for Original": "Segure para ver original",
    "Showing Original": "Mostrando original",
    "Change File": "Mudar arquivo",
  },
};

/**
 * Detects user's regional language
 */
export function detectUserRegionLanguage(): { code: string; isAutoDetected: boolean; source: string } {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { code: "en", isAutoDetected: false, source: "default" };
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return { code: saved, isAutoDetected: false, source: "user_preference" };
  }

  const navLangs = navigator.languages || [navigator.language || "en"];
  for (const rawLang of navLangs) {
    const l = rawLang.toLowerCase();
    if (l.startsWith("gu")) return { code: "gu", isAutoDetected: true, source: "browser_locale" };
    if (l.startsWith("hi")) return { code: "hi", isAutoDetected: true, source: "browser_locale" };
    if (l.startsWith("es")) return { code: "es", isAutoDetected: true, source: "browser_locale" };
    if (l.startsWith("fr")) return { code: "fr", isAutoDetected: true, source: "browser_locale" };
    if (l.startsWith("de")) return { code: "de", isAutoDetected: true, source: "browser_locale" };
    if (l.startsWith("zh")) return { code: "zh-CN", isAutoDetected: true, source: "browser_locale" };
    if (l.startsWith("ja")) return { code: "ja", isAutoDetected: true, source: "browser_locale" };
    if (l.startsWith("ar")) return { code: "ar", isAutoDetected: true, source: "browser_locale" };
    if (l.startsWith("ru")) return { code: "ru", isAutoDetected: true, source: "browser_locale" };
    if (l.startsWith("pt")) return { code: "pt", isAutoDetected: true, source: "browser_locale" };
    if (l.startsWith("bn")) return { code: "bn", isAutoDetected: true, source: "browser_locale" };
    if (l.startsWith("ta")) return { code: "ta", isAutoDetected: true, source: "browser_locale" };
    if (l.startsWith("mr")) return { code: "mr", isAutoDetected: true, source: "browser_locale" };
  }

  return { code: "en", isAutoDetected: false, source: "default" };
}

/**
 * Returns current active language code (e.g. 'en', 'gu', 'hi', 'es')
 */
export function getCurrentWebsiteLanguage(): string {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem(STORAGE_KEY) || "en";
}

/**
 * Translates a single text string
 */
export function t(text: string, langCode?: string): string {
  const current = langCode || getCurrentWebsiteLanguage();
  if (current === "en" || !text) return text;
  const dict = UI_TRANSLATIONS[current];
  if (dict && dict[text]) return dict[text]!;
  return text;
}

/**
 * Custom live DOM translator:
 * Recursively updates standard UI text nodes safely without breaking React DOM bindings
 */
export function applyCustomDOMTranslation(langCode: string): void {
  if (typeof document === "undefined") return;

  const dict = UI_TRANSLATIONS[langCode] || {};
  const isEnglish = langCode === "en";

  document.documentElement.lang = langCode;

  // Traverse registered translatable elements
  const elements = document.querySelectorAll<HTMLElement>("button, a, h1, h2, h3, h4, span, label, p");

  elements.forEach((el) => {
    // Skip code editor modal and raw data boxes
    if (el.closest(".notranslate") || el.closest("textarea") || el.closest("pre") || el.closest("code")) {
      return;
    }

    // Only process elements with direct single text node children to preserve React nodes
    if (el.childNodes.length === 1 && el.childNodes[0]?.nodeType === Node.TEXT_NODE) {
      const currentText = el.childNodes[0].textContent?.trim() || "";
      if (!currentText) return;

      if (!el.dataset["origText"]) {
        el.dataset["origText"] = currentText;
      }

      const orig = el.dataset["origText"] || "";
      if (isEnglish) {
        el.childNodes[0].textContent = orig;
      } else if (dict[orig]) {
        el.childNodes[0].textContent = dict[orig]!;
      }
    }
  });
}

/**
 * Switches the website language cleanly
 */
export function setWebsiteLanguage(langCode: string, isManualUserSelection = true): void {
  if (typeof window === "undefined") return;

  const targetCode = langCode || "en";

  if (isManualUserSelection) {
    localStorage.setItem(STORAGE_KEY, targetCode);
  }

  // Apply custom DOM translations
  applyCustomDOMTranslation(targetCode);

  // Dispatch custom event across React components
  window.dispatchEvent(
    new CustomEvent("bg_language_changed", {
      detail: { language: targetCode, isEnglish: targetCode === "en" },
    })
  );
}

/**
 * Initializes the clean custom localization engine
 */
export function initWebsiteTranslator(): void {
  if (typeof window === "undefined") return;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && saved !== "en") {
    setTimeout(() => {
      applyCustomDOMTranslation(saved);
    }, 100);
  }
}
