/**
 * Hybrid Website Localization & Translation Engine
 * Instant Client-Side Dictionary + Invisible Full-Page Auto-Translation (45+ Languages)
 * Zero Annoying Banners · 100% Smooth · React 19 Reconciler Safe
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

// ── CUSTOM MULTI-LANGUAGE DICTIONARY (Instant Client-Side Cache) ─────────────
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
    "Drop image here or paste from clipboard": "ઇમેજ અહીં ડ્રોપ કરો અથવા ક્લિપબોર્ડમાંથી પેસ્ટ કરો",
    "Drop your image here or browse files": "તમારી ઇમેજ અહીં મૂકો અથવા ફાઇલ પસંદ કરો",
    "Remove Background from Image for Free": "ઇમેજમાંથી બેકગ્રાઉન્ડ મફતમાં દૂર કરો",
    "Remove Background with AI": "AI સાથે બેકગ્રાઉન્ડ દૂર કરો",
    "Remove Background": "બેકગ્રાઉન્ડ દૂર કરો",
    "Free & Fast": "મફત અને ઝડપી",
    "100% Automatic": "૧૦૦% સ્વચાલિત",
    "No Watermark": "કોઈ વૉટરમાર્ક નથી",
    "Processing Image…": "ઇમેજ પ્રોસેસ થઈ રહી છે…",
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
    "Switch to English (Original)": "English માં પાછા ફરો (મૂળ)",
    "Popular Languages": "લોકપ્રિય ભાષાઓ",
    "Indian Languages": "ભારતીય ભાષાઓ",
    "All Languages": "બધી ભાષાઓ",
    "Search languages...": "ભાષા શોધો...",
    "Enlarge": "મોટું કરો",
    "Hold for Original": "મૂળ જોવા માટે દબાવી રાખો",
    "Showing Original": "મૂળ ઇમેજ બતાવી રહ્યું છે",
    "Change File": "ફાઇલ બદલો",
    "Batch Mode (4K)": "બેચ મોડ (4K)",
    "AI Tools & Shortcuts": "AI ટૂલ્સ અને શોર્ટકટ્સ",
    "AI Models Suite": "AI મોડલ્સ સંગ્રહ",
    "Plans & Pricing": "પ્લાન્સ અને કિંમત",
    "Support & Legal": "સહાય અને કાનૂની",
    "Background Remover (4K)": "બેકગ્રાઉન્ડ રીમુવર (4K)",
    "Rotate & Flip Image": "ઇમેજ ફેરવો અને ફ્લિપ કરો",
    "Watermark & Eraser": "વૉટરમાર્ક અને ઇરેઝર",
    "Clean & 4K Upscale": "ક્લીન અને 4K અપસ્કેલ",
    "Convert PNG, JPG, WebP": "PNG, JPG, WebP કન્વર્ટ કરો",
    "Try Karudi 1.0 Prime": "કરૂડી 1.0 પ્રાઇમ અજમાવો",
    "Zero File Storage Guarantee": "ઝીરો ફાઇલ સ્ટોરેજ ગેરંટી",
    "Sub-Second Latency": "એક સેકન્ડથી ઓછો સમય",
    "4K HD Lossless Exports": "4K HD ઉચ્ચ ગુણવત્તા એક્સપોર્ટ",
    "All 5 AI Models Online • 99.9% Uptime": "બધા 5 AI મોડલ્સ ઓનલાઇન • 99.9% અપટાઇમ",
    "Stay ahead with AI image processing releases": "AI ઇમેજ પ્રોસેસિંગમાં આગળ રહો",
    "Subscribe": "સબ્સ્ક્રાઇબ કરો",
    "Joined": "જોડાયા",
    "Terms of Service": "સેવાની શરતો",
    "Privacy Notice": "ગોપનીયતા નીતિ",
    "Contact": "સંપર્ક",
    "Terms & Conditions": "નિયમો અને શરતો",
    "Privacy Policy": "ગોપનીયતા નીતિ",
    "Contact Us & Support": "અમારો સંપર્ક કરો",
    "General FAQs": "સામાન્ય પ્રશ્નોત્તરી",
    "Model Technical Specs": "મોડલ ટેકનિકલ વિગતો",
    "Need enterprise high-volume batch API?": "એન્ટરપ્રાઇઝ હાઇ-વોલ્યુમ બેચ API જોઈએ છે?",
    "Contact Team →": "ટીમનો સંપર્ક કરો →",
    "Language Switcher": "ભાષા પસંદગી",
    "Select your preferred language": "તમારી પસંદગીની ભાષા પસંદ કરો",
    "Restore original language": "મૂળ ભાષા પુનઃસ્થાપિત કરો",
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
    "Drop image here or paste from clipboard": "इमेज यहाँ छोड़ें या क्लिपबोर्ड से पेस्ट करें",
    "Drop your image here or browse files": "अपनी इमेज यहाँ डालें या फ़ाइल चुनें",
    "Remove Background from Image for Free": "इमेज से बैकग्राउंड मुफ्त में हटाएं",
    "Remove Background with AI": "AI से बैकग्राउंड हटाएं",
    "Remove Background": "बैकग्राउंड हटाएं",
    "Free & Fast": "मुफ्त और तेज",
    "100% Automatic": "100% स्वचालित",
    "No Watermark": "कोई वॉटरमार्क नहीं",
    "Processing Image…": "इमेज प्रोसेस हो रही है…",
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
    "Switch to English (Original)": "English में वापस जाएं (मूल)",
    "Popular Languages": "लोकप्रिय भाषाएं",
    "Indian Languages": "भारतीय भाषाएं",
    "All Languages": "सभी भाषाएं",
    "Search languages...": "भाषा खोजें...",
    "Enlarge": "बड़ा करें",
    "Hold for Original": "मूल देखने के लिए दबाए रखें",
    "Showing Original": "मूल इमेज दिख रही है",
    "Change File": "फाइल बदलें",
    "Batch Mode (4K)": "बैच मोड (4K)",
    "AI Tools & Shortcuts": "AI टूल्स और शॉर्टकट्स",
    "AI Models Suite": "AI मॉडल्स सुइट",
    "Plans & Pricing": "प्लान्स और कीमतें",
    "Support & Legal": "सपोर्ट और लीगल",
    "Background Remover (4K)": "बैकग्राउंड रिमूवर (4K)",
    "Rotate & Flip Image": "इमेज घुमाएं और पलटें",
    "Watermark & Eraser": "वॉटरमार्क और इरेज़र",
    "Clean & 4K Upscale": "क्लीन और 4K अपस्केल",
    "Convert PNG, JPG, WebP": "PNG, JPG, WebP कन्वर्ट करें",
    "Try Karudi 1.0 Prime": "करूडी 1.0 प्राइम आज़माएं",
    "Zero File Storage Guarantee": "जीरो फाइल स्टोरेज गारंटी",
    "Sub-Second Latency": "एक सेकंड से भी कम समय",
    "4K HD Lossless Exports": "4K HD दोषरहित निर्यात",
    "All 5 AI Models Online • 99.9% Uptime": "सभी 5 AI मॉडल ऑनलाइन • 99.9% अपटाइम",
    "Stay ahead with AI image processing releases": "AI इमेज प्रोसेसिंग अपडेट्स से जुड़े रहें",
    "Subscribe": "सब्सक्राइब करें",
    "Joined": "जुड़ गए",
    "Terms of Service": "सेवा की शर्तें",
    "Privacy Notice": "गोपनीयता सूचना",
    "Contact": "संपर्क",
    "Terms & Conditions": "नियम एवं शर्तें",
    "Privacy Policy": "गोपनीयता नीति",
    "Contact Us & Support": "हमसे संपर्क करें",
    "General FAQs": "सामान्य प्रश्न",
    "Model Technical Specs": "मॉडल तकनीकी विवरण",
    "Need enterprise high-volume batch API?": "एंटरप्राइज़ बैच API की आवश्यकता है?",
    "Contact Team →": "टीम से संपर्क करें →",
    "Language Switcher": "भाषा परिवर्तक",
    "Select your preferred language": "अपनी पसंदीदा भाषा चुनें",
    "Restore original language": "मूल भाषा पुनर्स्थापित करें",
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
    "Drop image here or paste from clipboard": "Arrastra la imagen aquí o pega desde el portapapeles",
    "Remove Background from Image for Free": "Eliminar fondo de imagen gratis",
    "Remove Background with AI": "Eliminar fondo con IA",
    "Remove Background": "Eliminar fondo",
    "Free & Fast": "Gratis y rápido",
    "100% Automatic": "100% Automático",
    "No Watermark": "Sin marca de agua",
    "Download": "Descargar",
    "Download File": "Descargar archivo",
    "Download Result": "Descargar resultado",
    "Change File": "Cambiar archivo",
    "Switch to English (Original)": "Cambiar a English (Original)",
    "Language Switcher": "Selector de idioma",
    "Select your preferred language": "Selecciona tu idioma preferido",
    "Restore original language": "Restaurar idioma original",
    "AI Tools & Shortcuts": "Herramientas IA y accesos directos",
    "Zero File Storage Guarantee": "Garantía de cero almacenamiento de archivos",
    "Sub-Second Latency": "Latencia menor a un segundo",
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
    "Drop image here or paste from clipboard": "Déposez l'image ici ou collez depuis le presse-papiers",
    "Remove Background from Image for Free": "Supprimer le fond d'une image gratuitement",
    "Remove Background with AI": "Supprimer le fond avec l'IA",
    "Remove Background": "Supprimer le fond",
    "Free & Fast": "Gratuit et rapide",
    "100% Automatic": "100% Automatique",
    "No Watermark": "Sans filigrane",
    "Download": "Télécharger",
    "Download File": "Télécharger le fichier",
    "Download Result": "Télécharger le résultat",
    "Change File": "Changer de fichier",
    "Switch to English (Original)": "Passer à l'anglais (Original)",
    "Language Switcher": "Sélecteur de langue",
    "Select your preferred language": "Sélectionnez votre langue préférée",
    "Restore original language": "Restaurer la langue d'origine",
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
    "Remove Background from Image for Free": "Hintergrundbild kostenlos entfernen",
    "Remove Background with AI": "Hintergrund mit KI entfernen",
    "Remove Background": "Hintergrund entfernen",
    "Free & Fast": "Kostenlos & Schnell",
    "100% Automatic": "100% Automatisch",
    "No Watermark": "Kein Wasserzeichen",
    "Download": "Herunterladen",
    "Download File": "Datei herunterladen",
    "Download Result": "Ergebnis herunterladen",
    "Switch to English (Original)": "Zu Englisch wechseln (Original)",
    "Language Switcher": "Sprachauswahl",
    "Select your preferred language": "Wählen Sie Ihre bevorzugte Sprache",
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
    "Remove Background from Image for Free": "免费一键去除图片背景",
    "Remove Background with AI": "使用 AI 抠图去除背景",
    "Remove Background": "去除背景",
    "Free & Fast": "免费且快速",
    "100% Automatic": "100% 全自动",
    "No Watermark": "无水印",
    "Download": "下载",
    "Download File": "下载文件",
    "Switch to English (Original)": "切换到英文 (原语言)",
    "Language Switcher": "语言切换器",
    "Select your preferred language": "选择您偏好的语言",
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
    "Remove Background from Image for Free": "画像の背景を無料で自動削除",
    "Remove Background with AI": "AIで背景を自動削除",
    "Remove Background": "背景を削除",
    "Free & Fast": "高速かつ無料",
    "100% Automatic": "100% 自動処理",
    "No Watermark": "透かしなし",
    "Download": "ダウンロード",
    "Download File": "ファイルをダウンロード",
    "Switch to English (Original)": "英語に戻す (オリジナル)",
    "Language Switcher": "言語切り替え",
    "Select your preferred language": "ご希望の言語を選択してください",
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
    "Remove Background from Image for Free": "إزالة خلفية الصورة مجاناً",
    "Remove Background with AI": "إزالة الخلفية بالذكاء الاصطناعي",
    "Remove Background": "إزالة الخلفية",
    "Free & Fast": "مجاني وسريع",
    "100% Automatic": "100% تلقائي",
    "No Watermark": "بدون علامة مائية",
    "Download": "تنزيل",
    "Switch to English (Original)": "التبديل إلى الإنجليزية (الأصلية)",
    "Language Switcher": "تبديل اللغة",
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
    "Remove Background from Image for Free": "Удалить фон с фото бесплатно",
    "Remove Background with AI": "Удалить фон с помощью ИИ",
    "Remove Background": "Удалить фон",
    "Free & Fast": "Бесплатно и быстро",
    "100% Automatic": "100% Автоматически",
    "No Watermark": "Без водяных знаков",
    "Download": "Скачать",
    "Switch to English (Original)": "Переключить на английский",
    "Language Switcher": "Переключатель языка",
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
    "Remove Background from Image for Free": "Remover fundo de imagem grátis",
    "Remove Background with AI": "Remover fundo com IA",
    "Remove Background": "Remover fundo",
    "Free & Fast": "Grátis e rápido",
    "100% Automatic": "100% Automático",
    "No Watermark": "Sem marca d'água",
    "Download": "Baixar",
    "Switch to English (Original)": "Mudar para inglês (Original)",
    "Language Switcher": "Seletor de idioma",
  },

  // 11. Bengali (বাংলা)
  bn: {
    "Home.": "হোম.",
    "Models.": "মডেল.",
    "Tools.": "টুলস.",
    "Smart Assistant.": "স্মার্ট সহকারী.",
    "Pricing.": "মূল্য নির্ধারণ.",
    "FAQ.": "সাধারণ প্রশ্ন.",
    "Log in": "লগ ইন",
    "Sign up": "সাইন আপ",
    "Upload Image": "ছবি আপলোড করুন",
    "Remove Background from Image for Free": "বিনামূল্যে ছবির ব্যাকগ্রাউন্ড সরান",
    "Remove Background with AI": "AI দিয়ে ব্যাকগ্রাউন্ড সরান",
    "Download": "ডাউনলোড করুন",
    "Switch to English (Original)": "ইংরেজিতে ফিরে যান",
  },

  // 12. Tamil (தமிழ்)
  ta: {
    "Home.": "முகப்பு.",
    "Models.": "மாதிரிகள்.",
    "Tools.": "கருவிகள்.",
    "Smart Assistant.": "ஸ்மார்ட் உதவியாளர்.",
    "Pricing.": "விலை விவரம்.",
    "FAQ.": "கேள்விகள்.",
    "Log in": "உள்நுழைக",
    "Sign up": "பதிவு செய்க",
    "Upload Image": "படத்தை பதிவேற்றவும்",
    "Remove Background from Image for Free": "படத்தின் பின்னணியை இலவசமாக நீக்குங்கள்",
    "Remove Background with AI": "AI மூலம் பின்னணியை நீக்குங்கள்",
    "Download": "பதிவிறக்குங்கள்",
    "Switch to English (Original)": "ஆங்கிலத்திற்கு மாறவும்",
  },

  // 13. Telugu (తెలుగు)
  te: {
    "Home.": "హోమ్.",
    "Models.": "మోడల్స్.",
    "Tools.": "టూల్స్.",
    "Smart Assistant.": "స్మార్ట్ అసిస్టెంట్.",
    "Pricing.": "ధరలు.",
    "FAQ.": "తరచుగా అడిగే ప్రశ్నలు.",
    "Log in": "లాగిన్",
    "Sign up": "సైన్ అప్",
    "Upload Image": "చిత్రాన్ని అప్‌లోడ్ చేయండి",
    "Remove Background from Image for Free": "చిత్రం నుండి బ్యాక్‌గ్రౌండ్‌ను ఉచితంగా తొలగించండి",
    "Download": "డౌన్‌లోడ్ చేయండి",
    "Switch to English (Original)": "ఇంగ్లీష్‌కి మారండి",
  },

  // 14. Marathi (मराठी)
  mr: {
    "Home.": "मुख्यपृष्ठ.",
    "Models.": "मॉडेल्स.",
    "Tools.": "टूल्स.",
    "Smart Assistant.": "स्मार्ट सहाय्यक.",
    "Pricing.": "किंमती.",
    "FAQ.": "नेहमी विचारले जाणारे प्रश्न.",
    "Log in": "लॉग इन करा",
    "Sign up": "साइन अप करा",
    "Upload Image": "इमेज अपलोड करा",
    "Remove Background from Image for Free": "इमेजचा बॅकग्राउंड मोफत काढा",
    "Download": "डाउनलोड करा",
    "Switch to English (Original)": "इंग्रजीवर परत जा",
  },
};

/**
 * Global WeakMap for original text nodes to avoid memory leaks and safely revert
 */
const origNodeTextMap = new WeakMap<Text, string>();

/**
 * Patch React 19 Node prototypes to prevent removeChild / insertBefore crashes
 * caused when Google Translate wraps DOM text nodes in <font> tags.
 */
function patchReactNodePrototypes(): void {
  if (typeof window === "undefined" || (window as any).__bg_node_patched) return;
  (window as any).__bg_node_patched = true;

  if (typeof Node !== "undefined" && Node.prototype) {
    const origRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child.parentNode !== this) {
        if (child.parentNode) {
          return child.parentNode.removeChild(child) as T;
        }
        return child;
      }
      return origRemoveChild.call(this, child) as T;
    };

    const origInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(newNode: T, refNode: Node | null): T {
      if (refNode && refNode.parentNode !== this) {
        if (refNode.parentNode) {
          return refNode.parentNode.insertBefore(newNode, refNode) as T;
        }
        return newNode;
      }
      return origInsertBefore.call(this, newNode, refNode) as T;
    };
  }
}

/**
 * Sets Google Translate cookie cleanly across root and hostname
 */
function setGoogleTranslateCookie(langCode: string): void {
  if (typeof document === "undefined") return;
  const target = langCode === "en" ? "" : `/en/${langCode}`;
  const host = window.location.hostname;

  if (langCode === "en") {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + host + ";";
    if (host && host !== "localhost" && !host.match(/^(\d+\.){3}\d+$/)) {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + host + ";";
    }
  } else {
    document.cookie = `googtrans=${target}; path=/`;
    if (host && host !== "localhost" && !host.match(/^(\d+\.){3}\d+$/)) {
      document.cookie = `googtrans=${target}; domain=.${host}; path=/`;
      document.cookie = `googtrans=${target}; domain=${host}; path=/`;
    }
  }
}

/**
 * Triggers Google Translate select box (.goog-te-combo) to change language
 */
function triggerGoogleTranslateCombo(langCode: string): boolean {
  if (typeof document === "undefined") return false;
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (combo) {
    const val = langCode === "en" ? "en" : langCode;
    if (combo.value !== val) {
      combo.value = val;
      combo.dispatchEvent(new Event("change"));
    }
    return true;
  }
  return false;
}

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
    if (l.startsWith("te")) return { code: "te", isAutoDetected: true, source: "browser_locale" };
    if (l.startsWith("mr")) return { code: "mr", isAutoDetected: true, source: "browser_locale" };
    if (l.startsWith("pa")) return { code: "pa", isAutoDetected: true, source: "browser_locale" };
    if (l.startsWith("ur")) return { code: "ur", isAutoDetected: true, source: "browser_locale" };
    if (l.startsWith("it")) return { code: "it", isAutoDetected: true, source: "browser_locale" };
    if (l.startsWith("ko")) return { code: "ko", isAutoDetected: true, source: "browser_locale" };
  }

  return { code: "en", isAutoDetected: false, source: "default" };
}

/**
 * Returns current active language code (e.g. 'en', 'gu', 'hi', 'es')
 */
export function getCurrentWebsiteLanguage(): string {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return saved;

  const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z\-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return "en";
}

/**
 * Translates a single text string via local dictionary
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
 * Recursively updates standard UI text nodes safely using TreeWalker without breaking React bindings
 */
export function applyCustomDOMTranslation(langCode: string): void {
  if (typeof document === "undefined" || !document.body) return;

  const dict = UI_TRANSLATIONS[langCode] || {};
  const isEnglish = langCode === "en";

  document.documentElement.lang = langCode;

  try {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        const tag = parent.tagName.toLowerCase();
        if (["script", "style", "textarea", "pre", "code"].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }

        // Skip elements explicitly marked notranslate (skip if parent has .notranslate and is not html/body)
        if (parent.closest(".notranslate:not(html):not(body)")) {
          return NodeFilter.FILTER_REJECT;
        }

        const text = node.nodeValue?.trim();
        if (!text || text.length === 0) {
          return NodeFilter.FILTER_SKIP;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodesToProcess: Text[] = [];
    let node = walker.nextNode();
    while (node) {
      nodesToProcess.push(node as Text);
      node = walker.nextNode();
    }

    for (const textNode of nodesToProcess) {
      let orig = origNodeTextMap.get(textNode);
      if (!orig) {
        orig = textNode.nodeValue || "";
        origNodeTextMap.set(textNode, orig);
      }

      if (isEnglish) {
        if (textNode.nodeValue !== orig) {
          textNode.nodeValue = orig;
        }
      } else {
        const trimmed = orig.trim();
        if (dict[trimmed]) {
          const leadingSpace = orig.match(/^\s*/)?.[0] || "";
          const trailingSpace = orig.match(/\s*$/)?.[0] || "";
          const translated = leadingSpace + dict[trimmed] + trailingSpace;
          if (textNode.nodeValue !== translated) {
            textNode.nodeValue = translated;
          }
        }
      }
    }
  } catch (e) {
    console.warn("DOM translation walk warning:", e);
  }
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

  document.documentElement.lang = targetCode;

  // Handle switching back to English
  if (targetCode === "en") {
    setGoogleTranslateCookie("en");
    triggerGoogleTranslateCombo("en");
    applyCustomDOMTranslation("en");

    window.dispatchEvent(
      new CustomEvent("bg_language_changed", {
        detail: { language: "en", isEnglish: true },
      })
    );

    // If external translation injected font tags, a clean reload restores pristine DOM
    if (document.querySelector("font[color]") || document.querySelector(".goog-text-highlight")) {
      setTimeout(() => window.location.reload(), 150);
    }
    return;
  }

  // Set Google Translate cookie for full page automated translation
  setGoogleTranslateCookie(targetCode);

  // Apply custom local DOM translations immediately for instant response
  applyCustomDOMTranslation(targetCode);

  // Trigger Google Translate select element if loaded
  if (!triggerGoogleTranslateCombo(targetCode)) {
    // Retry finding .goog-te-combo for a few seconds if still loading
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (triggerGoogleTranslateCombo(targetCode) || attempts > 25) {
        clearInterval(interval);
      }
    }, 200);
  }

  // Dispatch custom event across React components
  window.dispatchEvent(
    new CustomEvent("bg_language_changed", {
      detail: { language: targetCode, isEnglish: false },
    })
  );
}

/**
 * Initializes the clean custom localization & auto-translation engine
 */
export function initWebsiteTranslator(): void {
  if (typeof window === "undefined") return;

  // Step 1: Patch React 19 node prototypes to prevent any DOM mutation crashes
  patchReactNodePrototypes();

  // Step 2: Ensure Google Translate container element exists
  if (!document.getElementById("google_translate_element")) {
    const div = document.createElement("div");
    div.id = "google_translate_element";
    div.style.display = "none";
    div.className = "notranslate";
    div.setAttribute("aria-hidden", "true");
    document.body.appendChild(div);
  }

  // Step 3: Setup Google Translate Callback
  (window as any).googleTranslateElementInit = function () {
    try {
      if ((window as any).google?.translate?.TranslateElement) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            autoDisplay: false,
            layout: (window as any).google.translate?.TranslateElement?.InlineLayout?.SIMPLE || 0,
          },
          "google_translate_element"
        );

        // Once initialized, sync with active user language
        const current = getCurrentWebsiteLanguage();
        if (current && current !== "en") {
          setTimeout(() => {
            triggerGoogleTranslateCombo(current);
          }, 300);
        }
      }
    } catch (err) {
      console.warn("Google translate element init warning:", err);
    }
  };

  // Step 4: Dynamically inject Google Translate script if not present
  if (!document.getElementById("google-translate-script")) {
    const s = document.createElement("script");
    s.id = "google-translate-script";
    s.type = "text/javascript";
    s.async = true;
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.onerror = () => {
      // Local dictionary remains 100% functional even if external script is blocked
      console.info("Online translator script unavailable; local dictionary active.");
    };
    document.head.appendChild(s);
  }

  // Step 5: Check saved language and apply local dictionary immediately
  const saved = getCurrentWebsiteLanguage();
  if (saved && saved !== "en") {
    setGoogleTranslateCookie(saved);
    setTimeout(() => {
      applyCustomDOMTranslation(saved);
      triggerGoogleTranslateCombo(saved);
    }, 50);
  }
}
