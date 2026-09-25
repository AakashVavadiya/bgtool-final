import {
  Minimize2,
  Scaling,
  Crop,
  FileImage,
  ImageDown,
  ScanText,
  Binary,
  FileType2,
  FileText,
  Sheet,
  Presentation,
  Code2,
  FileDown,
  Table2,
  FileSpreadsheet,
  MonitorPlay,
  ImagePlus,
  Sparkle,
  Scissors,
  Eraser,
  Stamp,
  RotateCw,
  SmilePlus,
  Laugh,
  SlidersHorizontal,
  Pipette,
  FileCode,
  FileDigit,
  Terminal,
  Type,
  Hash,
  Square,
  Merge,
  SplitSquareVertical,
  FilePlus,
  FilePen,
  FileSignature,
  FileOutput,
  Images,
  Camera,
  Globe,
  ClipboardList,
  Briefcase,
  QrCode,
  Receipt,
  CreditCard,
  FileX,
  BookOpen,
  Layers,
  Lock,
  Unlock,
  ShieldOff,
  GitCompare,
  Wrench,
  Zap,
  Shield,
  BookMarked,
  FileSearch,
  ArrowLeftRight,
  Eye,
  Settings2,
  LayoutGrid,
  Columns,
  Printer,
  KeyRound,
  Maximize2,
  FileInput,
  FileCheck,
  FileStack,
  FormInput,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory =
  | "AI Tools"
  | "Image Editing & Optimization"
  | "Format Converters"
  | "Document Converters"
  | "Creative & Utilities"
  | "PDF Tools";

export const TOOL_CATEGORIES: ToolCategory[] = [
  "AI Tools",
  "Image Editing & Optimization",
  "Format Converters",
  "Document Converters",
  "Creative & Utilities",
  "PDF Tools",
];

export type Tool = {
  slug: string;
  name: string;
  category: ToolCategory;
  icon: LucideIcon;
  tag?: string;
  blurb: string;
  accepts: string;
  outputs: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    article: {
      intro: string;
      howTo: string[];
      benefits: { heading: string; body: string }[];
      faqs: { q: string; a: string }[];
    };
  };
};

export const tools: Tool[] = [
  {
    slug: "compress-image",
    name: "Compress Image",
    category: "Image Editing & Optimization",
    icon: Minimize2,
    blurb: "Shrink file size dramatically while keeping the detail your eye actually notices.",
    accepts: "JPG, PNG, WEBP",
    outputs: "Optimised image",
    seo: {
      title: "Compress Image Online Free — Reduce Image Size Without Losing Quality",
      description: "Compress JPG, PNG and WEBP images online for free. Reduce image file size up to 90% without visible quality loss. No upload limits, no watermarks, instant download.",
      keywords: ["compress image", "reduce image size", "image compressor online", "compress jpg online free", "compress png online", "reduce file size image", "image size reducer", "online image optimizer", "shrink image file", "compress webp"],
      article: {
        intro: "Image compression is one of the most essential tasks for web developers, designers, and content creators. Large image files slow down websites, consume more storage, and cost more in bandwidth. Our free online image compressor lets you reduce JPG, PNG and WEBP file sizes by up to 90% without any visible drop in quality — all processed instantly in your browser.",
        howTo: [
          "Click 'Select Image File' or drag and drop your JPG, PNG or WEBP image into the upload zone above.",
          "Use the Quality Compression slider to set your desired compression level (75% is recommended for web use).",
          "Preview the compressed result in real time alongside file size savings percentage.",
          "Click 'Download Result' to save your optimised image instantly.",
        ],
        benefits: [
          { heading: "Up to 90% Smaller File Size", body: "Our smart compression algorithm analyses each image and removes redundant data that the human eye cannot perceive, delivering dramatically smaller files without noticeable quality loss." },
          { heading: "100% Free & No Limits", body: "Unlike many tools, there are no daily limits, no account required and no watermarks added to your compressed images. Compress as many images as you need." },
          { heading: "Privacy First", body: "All image processing happens directly in your browser using HTML5 Canvas — your files are never uploaded to any server. Your images stay completely private." },
          { heading: "Perfect for Web & SEO", body: "Google's Core Web Vitals score rewards fast-loading pages. Smaller images directly improve your LCP (Largest Contentful Paint) score, boosting your search rankings." },
        ],
        faqs: [
          { q: "What image formats can I compress?", a: "Our tool supports JPG/JPEG, PNG and WEBP image formats. You can compress any of these and download the result in the same format." },
          { q: "How much can I compress an image?", a: "Using the quality slider you can compress images from 10% (very small, lower quality) up to 95% quality (nearly lossless). Most users find 70–80% quality provides the ideal balance." },
          { q: "Will my image lose quality?", a: "At 75% quality and above, quality loss is imperceptible to the human eye. The preview lets you compare before downloading so you can judge for yourself." },
          { q: "Is my image data safe?", a: "Yes — 100%. All processing happens in your browser. No image data is ever sent to our servers." },
        ],
      },
    },
  },
  {
    slug: "resize-image",
    name: "Resize Image",
    category: "Image Editing & Optimization",
    icon: Scaling,
    blurb: "Set exact pixel dimensions or scale by percentage with aspect ratio locked.",
    accepts: "Any image",
    outputs: "Resized image",
    seo: {
      title: "Resize Image Online Free — Change Image Dimensions Instantly",
      description: "Resize images online for free. Set exact pixel width and height or scale by percentage. Supports JPG, PNG, WEBP. Aspect ratio lock, instant preview, no watermark.",
      keywords: ["resize image online", "change image size", "image resizer", "resize jpg online free", "resize png online", "scale image dimensions", "image dimension changer", "bulk image resize", "resize photo online", "change image resolution"],
      article: {
        intro: "Resizing images is a fundamental task for anyone working with digital media. Whether you need a specific pixel dimension for a social media post, a smaller size for email attachment, or a percentage scale for web use, our free image resizer handles it all instantly in your browser with no quality loss.",
        howTo: [
          "Upload your image by clicking 'Select Image File' or dragging it into the upload area.",
          "Choose between percentage scale presets (25%, 50%, 75%, 100%) for quick scaling.",
          "Or set custom Width and Height values in pixels — aspect ratio is automatically maintained.",
          "Click 'Download Result' to get your resized image.",
        ],
        benefits: [
          { heading: "Pixel-Perfect Dimensions", body: "Enter exact width and height values for precise output dimensions. Perfect for social media banners, profile pictures, product images and print materials." },
          { heading: "Locked Aspect Ratio", body: "Our tool automatically maintains the correct aspect ratio when you change one dimension, preventing distorted or squished images." },
          { heading: "Quick Scale Presets", body: "Choose 25%, 50%, 75% or 100% scale presets to quickly halve or quarter your image dimensions for web use or thumbnail generation." },
          { heading: "No Server Upload Needed", body: "Everything runs client-side in your browser. Your images never leave your device, ensuring complete privacy and instant results." },
        ],
        faqs: [
          { q: "What is the maximum image size I can resize?", a: "You can resize images up to 8000×8000 pixels (40MP). Results are generated instantly in your browser with no file size restrictions." },
          { q: "Will resizing reduce image quality?", a: "Enlarging an image beyond its original dimensions can reduce sharpness. Shrinking images generally maintains excellent quality. Use our AI Upscale tool for high-quality enlargements." },
          { q: "Does aspect ratio locking work for all image shapes?", a: "Yes — when you change the width, the height automatically updates to maintain the original aspect ratio (and vice versa)." },
          { q: "Can I resize to a custom percentage?", a: "Use the percentage scale presets for 25%, 50%, 75% or 100% scaling. For custom percentages, use the pixel dimension inputs." },
        ],
      },
    },
  },
  {
    slug: "crop-image",
    name: "Crop Image",
    category: "Image Editing & Optimization",
    icon: Crop,
    blurb: "Free crop or snap to 1:1, 4:5, 16:9 and other common social ratios.",
    accepts: "Any image",
    outputs: "Cropped image",
    seo: {
      title: "Crop Image Online Free — Crop Photos to Any Aspect Ratio",
      description: "Crop images online free. Choose free crop, 1:1 square, 4:3, 16:9 widescreen or 9:16 portrait ratios. Perfect for Instagram, YouTube, Twitter. Instant download.",
      keywords: ["crop image online", "crop photo free", "image cropper", "crop jpg online", "crop to square", "crop 16:9 online", "crop instagram photo", "image crop tool", "crop photo online free", "aspect ratio crop"],
      article: {
        intro: "Cropping is the simplest and most effective way to improve image composition, remove unwanted elements, or prepare photos for specific platforms. Our free online image cropper supports free-form cropping and preset aspect ratios for social media, video, and professional use — all without downloading any software.",
        howTo: [
          "Upload your image using the drag and drop zone or file selector above.",
          "Choose a crop aspect ratio: Free, 1:1 (Square), 4:3 (Standard), 16:9 (Widescreen), or 9:16 (Portrait/Stories).",
          "The crop is applied automatically and previewed in real time.",
          "Download your cropped image with the Download button.",
        ],
        benefits: [
          { heading: "Social Media Ready Ratios", body: "Instantly crop to the exact ratios required by Instagram (1:1, 4:5), YouTube (16:9), Twitter/X (16:9), TikTok (9:16) and Facebook (1.91:1)." },
          { heading: "Automatic Centred Crop", body: "Our smart crop algorithm centres the crop on your image, preserving the most important content while removing equal amounts from each edge." },
          { heading: "Free Crop Mode", body: "Use free crop mode for complete control — crop to any custom shape or remove specific unwanted areas from your photos." },
          { heading: "Non-Destructive Preview", body: "See your cropped result instantly before downloading. Change the ratio as many times as you need without re-uploading." },
        ],
        faqs: [
          { q: "What aspect ratios are supported?", a: "We support Free (any ratio), 1:1 Square, 4:3 Standard, 16:9 Widescreen and 9:16 Portrait. More ratios can be achieved by setting custom dimensions in the resize tool." },
          { q: "Will cropping reduce image quality?", a: "No — cropping only removes pixels from the edges. The remaining image retains its full original quality and resolution." },
          { q: "What size should I crop for Instagram?", a: "Instagram supports 1:1 (1080×1080px) for feed posts, 4:5 (1080×1350px) for portrait posts, and 9:16 (1080×1920px) for Stories and Reels." },
          { q: "Can I crop without losing the original?", a: "Your original file is never modified — we process a copy in your browser. You can always re-upload and try a different crop." },
        ],
      },
    },
  },
  {
    slug: "convert-to-jpg",
    name: "Convert to JPG",
    category: "Format Converters",
    icon: FileImage,
    blurb: "Turn PNG, WEBP, HEIC, AVIF and RAW files into universally readable JPGs.",
    accepts: "PNG, WEBP, HEIC, AVIF",
    outputs: "JPG",
    seo: {
      title: "Convert Image to JPG Online Free — PNG, WEBP, HEIC to JPEG Converter",
      description: "Convert PNG, WEBP, HEIC and AVIF images to JPG/JPEG format online for free. Fast, private, no watermark. Supports bulk conversion. Download instantly.",
      keywords: ["convert to jpg", "png to jpg converter", "webp to jpg", "heic to jpg online", "avif to jpg", "image to jpeg converter", "convert image format online", "free jpg converter", "photo to jpg", "bulk image converter"],
      article: {
        intro: "JPG/JPEG is the most universally supported image format, compatible with every browser, device, operating system, and application. Converting your PNG, WEBP, HEIC or AVIF images to JPG ensures maximum compatibility for sharing, printing, and uploading to platforms that only accept JPEG format.",
        howTo: [
          "Upload your PNG, WEBP, HEIC or AVIF image using the upload zone above.",
          "The tool automatically converts to JPG format — select output quality with the format selector.",
          "Preview your converted JPG image in real time.",
          "Click 'Download Result' to save your JPG file.",
        ],
        benefits: [
          { heading: "Universal Compatibility", body: "JPG is accepted by virtually every platform — email clients, social media, printing services, e-commerce sites and all image editing software." },
          { heading: "Smaller File Sizes", body: "JPG compression typically produces much smaller file sizes than PNG (especially for photos), making it ideal for web use and faster page loading." },
          { heading: "HEIC iPhone Photo Support", body: "iPhones shoot photos in HEIC format which many platforms can't read. Convert HEIC to JPG for seamless sharing on any device or platform." },
          { heading: "Instant Browser Processing", body: "No uploading to servers required. All conversion happens locally in your browser — private, instant and secure." },
        ],
        faqs: [
          { q: "Will converting PNG to JPG lose transparency?", a: "Yes — JPG doesn't support transparency. Transparent areas will be filled with a white background. Use PNG format if you need to preserve transparency." },
          { q: "What image formats can I convert to JPG?", a: "You can convert PNG, WEBP, HEIC, AVIF and most common image formats to JPG using this tool." },
          { q: "What quality should I use for JPG conversion?", a: "For general web use, 85% quality is recommended. For print, use 95% or higher. For social media, 75–80% produces an ideal balance of quality and file size." },
          { q: "Does this tool convert HEIC (iPhone photos) to JPG?", a: "Yes — upload your HEIC file and it will be instantly converted to a universally compatible JPG." },
        ],
      },
    },
  },
  {
    slug: "convert-from-jpg",
    name: "Convert From JPG",
    category: "Format Converters",
    icon: ImageDown,
    blurb: "Move a JPG into PNG, WebP, AVIF, GIF, BMP or TIFF when you need specific format compatibility.",
    accepts: "JPG, JPEG",
    outputs: "JPEG, PNG, WebP, AVIF, GIF, BMP, TIFF",
    seo: {
      title: "Convert JPG to PNG, WEBP or AVIF Online Free — JPG Converter",
      description: "Convert JPG images to PNG, WEBP or AVIF format free online. Get transparency with PNG, smaller files with WEBP, or modern compression with AVIF. Instant download.",
      keywords: ["jpg to png converter", "jpg to webp", "jpg to avif", "convert jpeg online", "jpeg to png free", "jpg format converter", "image format conversion", "convert jpg online", "jpeg to webp converter", "jpg to transparent png"],
      article: {
        intro: "While JPG is the most common image format, there are many situations where converting to PNG, WEBP or AVIF is beneficial. PNG supports full transparency for logos and UI elements. WEBP delivers 25–35% smaller files than JPG for web use. AVIF offers even better compression for modern browsers. Our free converter handles all these conversions instantly.",
        howTo: [
          "Upload your JPG or JPEG image using the upload zone above.",
          "Select your target format: PNG (for transparency), WEBP (for smaller web files) or AVIF (for modern compression).",
          "Preview the converted result in real time.",
          "Click 'Download Result' to save your converted image.",
        ],
        benefits: [
          { heading: "PNG for Perfect Transparency", body: "Convert JPG to PNG when you need a transparent background. PNG is the format of choice for logos, icons, and graphics that need to sit on coloured backgrounds." },
          { heading: "WEBP for Web Performance", body: "WEBP images are 25–35% smaller than equivalent JPGs, making them ideal for websites where page speed and Core Web Vitals matter for SEO." },
          { heading: "AVIF for Future-Ready Compression", body: "AVIF offers superior compression to both JPG and WEBP, supported by all modern browsers. Ideal for image-heavy websites aiming for maximum performance." },
          { heading: "Private & Instant", body: "Conversion happens entirely in your browser. No files are uploaded to servers — your images and their contents remain completely private." },
        ],
        faqs: [
          { q: "Can I convert JPG to PNG with transparent background?", a: "The tool converts JPG to PNG format, but JPG images don't have transparency data. Use our Remove Background tool first to create transparency, then the PNG will preserve it." },
          { q: "Is WEBP supported everywhere?", a: "WEBP is supported by all modern browsers including Chrome, Firefox, Safari, Edge and Opera. For maximum compatibility, use JPG or PNG for older contexts." },
          { q: "What's the difference between WEBP and AVIF?", a: "Both are modern formats with better compression than JPG. AVIF generally offers 30–50% better compression than WEBP but has slightly less browser support in very old versions." },
          { q: "Does converting JPG to PNG improve quality?", a: "No — PNG conversion doesn't recover JPG compression artefacts. It simply changes the container format. The image quality remains the same as the source JPG." },
        ],
      },
    },
  },
  {
    slug: "image-to-text-ocr",
    name: "Image To Text OCR",
    category: "AI Tools",
    icon: ScanText,
    blurb: "Pull selectable, searchable text out of screenshots, scans and photographs.",
    accepts: "Any image",
    outputs: "Plain text",
    seo: {
      title: "Image to Text OCR Online Free — Extract Text from Images Instantly",
      description: "Extract text from images, screenshots and scanned documents online free. Our OCR tool converts any image to editable, selectable text. No software needed.",
      keywords: ["image to text", "ocr online free", "extract text from image", "photo to text converter", "screenshot to text", "scan to text", "ocr image converter", "read text from image", "image text extractor", "optical character recognition online"],
      article: {
        intro: "Optical Character Recognition (OCR) technology converts printed or handwritten text in images into machine-readable, editable digital text. Whether you have a scanned document, a screenshot of a webpage, a photograph of a receipt, or an image containing important information, our free OCR tool extracts all readable text instantly.",
        howTo: [
          "Upload your image (screenshot, scan, photo) using the upload zone above.",
          "Our OCR engine automatically detects and extracts all readable text from the image.",
          "Review the extracted text in the output panel on the right.",
          "Copy the extracted text directly or use it in any document or application.",
        ],
        benefits: [
          { heading: "Works on Any Image Type", body: "Extract text from screenshots, scanned documents, photographs, receipts, invoices, business cards, whiteboards, and any other image containing printed or handwritten text." },
          { heading: "Editable & Searchable Output", body: "The extracted text is fully selectable, editable, and searchable — copy it directly into Word, Google Docs, spreadsheets, or any other application." },
          { heading: "No Software Installation", body: "Our browser-based OCR works on any device — Windows, Mac, iPhone, Android — with no apps or software to download or install." },
          { heading: "Privacy Guaranteed", body: "Your documents and images are processed locally. Sensitive documents like invoices, contracts, and personal records are never uploaded to any server." },
        ],
        faqs: [
          { q: "What languages does the OCR support?", a: "Our OCR engine supports most Latin-based languages including English, Spanish, French, German, Portuguese, Italian and more. Results vary by image clarity." },
          { q: "What image quality gives the best OCR results?", a: "Higher resolution images (300 DPI or higher) with good contrast between text and background give the best results. Blurry or very low-resolution images may have lower accuracy." },
          { q: "Can I extract text from a PDF screenshot?", a: "Yes — take a screenshot of any PDF page and upload it for text extraction. For native PDFs, we recommend our PDF to Image tool first." },
          { q: "Can OCR read handwriting?", a: "Our basic OCR is optimised for printed text. Handwriting recognition accuracy depends heavily on handwriting clarity and consistency." },
        ],
      },
    },
  },
  {
    slug: "image-to-binary",
    name: "Image To Binary",
    category: "Format Converters",
    icon: Binary,
    blurb: "Encode an image into base64 or raw binary for embedding straight into code.",
    accepts: "Any image",
    outputs: "Base64 / binary",
    seo: {
      title: "Image to Base64 Encoder Online Free — Convert Image to Binary Data",
      description: "Convert any image to Base64 or binary data online free. Embed images directly in HTML, CSS, JavaScript or JSON without file dependencies. Instant encoding.",
      keywords: ["image to base64", "base64 encoder online", "image to binary", "encode image base64", "base64 image converter", "embed image in code", "image data uri", "html base64 image", "css base64 image", "javascript base64 image"],
      article: {
        intro: "Base64 encoding converts binary image data into an ASCII text string that can be embedded directly in HTML, CSS, JavaScript, JSON or XML files. This eliminates the need for separate image files and HTTP requests, which can improve performance for small icons and UI elements.",
        howTo: [
          "Upload your image using the upload zone above.",
          "The tool automatically encodes your image to Base64 data URI format.",
          "Copy the generated Base64 string from the output panel.",
          "Paste it directly into your HTML src attribute, CSS background-image, or JavaScript variable.",
        ],
        benefits: [
          { heading: "Eliminate Separate HTTP Requests", body: "Embedding small images as Base64 data URIs eliminates additional HTTP requests, which can improve page load performance for icons and UI elements." },
          { heading: "Self-Contained Files", body: "HTML, CSS or JSON files with Base64 images are completely self-contained — no external image files needed. Perfect for email templates and data exports." },
          { heading: "Works in All Browsers", body: "Base64 data URIs are supported in all modern and legacy browsers, making them a universally compatible way to embed image data." },
          { heading: "Instant Encoding", body: "Encoding happens instantly in your browser with no file size limits. The output is ready to copy and paste immediately." },
        ],
        faqs: [
          { q: "What is Base64 image encoding?", a: "Base64 encoding converts binary image data into a text string using 64 ASCII characters. This allows images to be embedded directly in text-based files like HTML, CSS and JSON." },
          { q: "How do I use a Base64 image in HTML?", a: "Use the output as the src attribute value: <img src='data:image/png;base64,[YOUR_DATA]'>. Replace [YOUR_DATA] with the encoded string." },
          { q: "Does Base64 encoding increase file size?", a: "Yes — Base64 encoding increases file size by approximately 33% compared to the original binary. Only use it for small icons and UI elements where eliminating HTTP requests outweighs the size cost." },
          { q: "What formats can be Base64 encoded?", a: "Any image format (JPG, PNG, WEBP, SVG, GIF, etc.) can be Base64 encoded. The data URI will include the correct MIME type automatically." },
        ],
      },
    },
  },
  {
    slug: "image-to-pdf",
    name: "Image To PDF",
    category: "Document Converters",
    icon: FileType2,
    blurb: "Bundle one or many images into a single paginated PDF document.",
    accepts: "Any image",
    outputs: "PDF",
    seo: {
      title: "Image to PDF Converter Online Free — Convert JPG, PNG to PDF",
      description: "Convert JPG, PNG, WEBP images to PDF online for free. Bundle multiple images into a single PDF document. No watermark, instant download, no sign-up required.",
      keywords: ["image to pdf", "jpg to pdf converter", "png to pdf online", "convert photo to pdf", "multiple images to pdf", "merge images pdf", "photo to pdf free", "image pdf converter", "jpg to pdf free", "picture to pdf online"],
      article: {
        intro: "Converting images to PDF is essential for document sharing, archiving, printing and professional communication. PDF format preserves image quality and layout exactly as intended, and PDFs can be opened on any device without specialised software. Our free converter creates professional PDFs from your JPG, PNG or WEBP images instantly.",
        howTo: [
          "Upload your image or images using the upload zone above.",
          "Images are automatically arranged as pages in your PDF document.",
          "Download your completed PDF with the Download button.",
          "Share, print or archive your PDF document.",
        ],
        benefits: [
          { heading: "Universal Document Format", body: "PDF files can be opened on any device — Windows, Mac, iOS, Android — using free PDF viewers. They preserve your image layout exactly as intended." },
          { heading: "Professional Presentation", body: "PDFs look professional and are appropriate for business documents, portfolios, applications, and formal submissions where image files alone may seem unprofessional." },
          { heading: "No Quality Loss", body: "Images are embedded in the PDF at full original quality and resolution. No compression artefacts or quality degradation occurs during conversion." },
          { heading: "Print-Ready Output", body: "PDF is the standard format for professional printing. Converting your images to PDF ensures they will print correctly at the intended size and quality." },
        ],
        faqs: [
          { q: "Can I convert multiple images into one PDF?", a: "Yes — you can upload multiple images and they will each become a separate page in your PDF document." },
          { q: "What image formats can I convert to PDF?", a: "You can convert JPG, PNG, WEBP, and other common image formats to PDF using this tool." },
          { q: "Will my PDF be print-quality?", a: "Yes — images are embedded at their full original resolution. For best print quality, use high-resolution source images (300 DPI or higher)." },
          { q: "Is there a file size limit for Image to PDF conversion?", a: "The tool processes images up to 50MB per file. For larger files or bulk conversions, split your project into batches." },
        ],
      },
    },
  },
  {
    slug: "image-to-word",
    name: "Image To Word",
    category: "Document Converters",
    icon: FileText,
    blurb: "Convert a page scan into an editable Word document with the layout preserved.",
    accepts: "Any image",
    outputs: "DOCX",
    seo: {
      title: "Image to Word Converter Online Free — Convert Image to DOCX",
      description: "Convert images and scanned documents to editable Word DOCX files online for free. Preserve text and layout. No watermark, instant download, no registration.",
      keywords: ["image to word", "jpg to word converter", "scan to word", "image to docx", "convert image to word", "picture to word document", "scan document to word", "ocr to word", "photo to word free", "image word converter online"],
      article: {
        intro: "Converting scanned documents or image-based text into editable Word documents is a common need for businesses, students, and professionals. Our Image to Word converter uses OCR technology to extract text and structure from your images and rebuild them as fully editable DOCX files compatible with Microsoft Word, Google Docs and LibreOffice.",
        howTo: [
          "Upload your scanned document, photograph, or image file using the upload zone above.",
          "Our converter analyses the image and extracts text, headings and layout structure.",
          "Preview the extracted content in the output panel.",
          "Download your DOCX file ready for editing in Microsoft Word or Google Docs.",
        ],
        benefits: [
          { heading: "Fully Editable Output", body: "The output DOCX file is completely editable — change text, formatting, fonts and layout just like any regular Word document." },
          { heading: "Microsoft Word Compatible", body: "The DOCX format is natively compatible with Microsoft Word, Google Docs, LibreOffice Writer, and all major word processing applications." },
          { heading: "Time-Saving Document Digitisation", body: "Convert stacks of scanned paper documents into editable digital files in seconds — eliminating hours of manual retyping." },
          { heading: "Preserve Document Structure", body: "Our converter attempts to maintain the heading hierarchy, paragraph structure and text layout of the original scanned document." },
        ],
        faqs: [
          { q: "Will the converted Word document look exactly like the original?", a: "For simple text-heavy documents, results are very close to the original. Complex layouts with tables, columns and graphics may require some manual adjustment after conversion." },
          { q: "What image quality gives the best results?", a: "Use high-resolution scans (300 DPI or higher) with good contrast. Blurry or skewed images will produce lower accuracy text extraction." },
          { q: "Can I edit the DOCX file after conversion?", a: "Yes — the output is a standard DOCX file you can open and edit in Microsoft Word, Google Docs, or LibreOffice." },
          { q: "Is there a limit on document length?", a: "You can convert single-page images. For multi-page documents, convert each page separately or use our Image to PDF tool." },
        ],
      },
    },
  },
  {
    slug: "image-to-excel",
    name: "Image To Excel",
    category: "Document Converters",
    icon: Sheet,
    blurb: "Read a table out of a photo and rebuild it as real spreadsheet cells.",
    accepts: "Any image",
    outputs: "XLSX",
    seo: {
      title: "Image to Excel Converter Online Free — Extract Tables from Images to XLSX",
      description: "Convert images with tables and data to editable Excel XLSX spreadsheets online for free. Extract table data from photos, screenshots and scans. Instant download.",
      keywords: ["image to excel", "table to excel", "jpg to xlsx", "extract table from image", "photo to spreadsheet", "scan to excel", "image spreadsheet converter", "ocr table extraction", "screenshot to excel", "convert table image to excel"],
      article: {
        intro: "Manually re-entering table data from images, screenshots or scanned documents into Excel is extremely time-consuming. Our Image to Excel converter uses intelligent table recognition to automatically identify rows, columns and cell data in your images and convert them into fully editable Excel spreadsheet files (XLSX format).",
        howTo: [
          "Upload your image containing a table, spreadsheet screenshot or tabular data.",
          "Our tool automatically detects rows, columns and cell content in the image.",
          "Preview the extracted table data in the output panel.",
          "Download your XLSX file ready for immediate use in Microsoft Excel or Google Sheets.",
        ],
        benefits: [
          { heading: "Save Hours of Manual Entry", body: "Converting a table image to Excel takes seconds with our tool, replacing hours of tedious manual data entry. Process large datasets from scanned reports instantly." },
          { heading: "Full Excel Compatibility", body: "The output XLSX file works natively in Microsoft Excel, Google Sheets, LibreOffice Calc, and all major spreadsheet applications." },
          { heading: "Preserve Table Structure", body: "Our tool recognises rows, columns, headers and cell boundaries to rebuild the table structure as accurately as possible in the spreadsheet." },
          { heading: "Works on Any Table Image", body: "Convert tables from screenshots, PDF screenshots, photographs of printed reports, handwritten tables, and more." },
        ],
        faqs: [
          { q: "What types of tables can be converted?", a: "Our tool works best with clear, well-structured tables with visible borders. Tables in screenshots, PDF screenshots and high-quality photos give the best results." },
          { q: "Can I edit the data after conversion?", a: "Yes — the XLSX output is fully editable in Excel, Google Sheets or LibreOffice. Format cells, add formulas, and analyse your data normally." },
          { q: "What if my table has merged cells?", a: "Complex merged cell structures may not be perfectly reproduced. Simple tables with regular rows and columns give the best results." },
          { q: "Is the extracted data searchable and sortable?", a: "Yes — data extracted into Excel cells is fully searchable, sortable, and compatible with all Excel functions and formulas." },
        ],
      },
    },
  },
  {
    slug: "image-to-powerpoint",
    name: "Image To PowerPoint",
    category: "Document Converters",
    icon: Presentation,
    blurb: "Drop images onto clean slides, one per frame, ready to present.",
    accepts: "Any image",
    outputs: "PPTX",
    seo: {
      title: "Image to PowerPoint Converter Online Free — Convert Images to PPTX Slides",
      description: "Convert images to PowerPoint PPTX slides online for free. Each image becomes a slide, ready for presentation. Works with JPG, PNG, WEBP. Instant download.",
      keywords: ["image to powerpoint", "jpg to pptx", "photo to slide", "image presentation converter", "png to powerpoint", "picture to pptx", "create slideshow from images", "image to slides", "convert photo presentation", "free powerpoint maker from images"],
      article: {
        intro: "Creating PowerPoint presentations from image collections is a common need for photographers, educators, designers and business professionals. Our Image to PowerPoint converter automatically places each uploaded image onto its own presentation slide, creating a ready-to-present PPTX file compatible with Microsoft PowerPoint, Google Slides and Keynote.",
        howTo: [
          "Upload your image or images using the upload zone above.",
          "Each image is automatically placed on its own slide in the PowerPoint presentation.",
          "Download your completed PPTX file.",
          "Open in Microsoft PowerPoint, Google Slides, or Keynote to add text, transitions and effects.",
        ],
        benefits: [
          { heading: "Instant Slideshow Creation", body: "Convert a collection of photos or design images into a professional slideshow presentation in seconds, without opening PowerPoint." },
          { heading: "Full PowerPoint Compatibility", body: "Output PPTX files work with Microsoft PowerPoint 2007 and later, Google Slides, LibreOffice Impress, and Apple Keynote." },
          { heading: "Editable After Conversion", body: "Add text, animations, transitions and speaker notes to your slides after downloading — the PPTX is fully editable." },
          { heading: "Perfect for Photographers & Designers", body: "Create portfolio slideshows, photo exhibition presentations, and design showcases from your image collections instantly." },
        ],
        faqs: [
          { q: "What slide size does the output use?", a: "The output uses the standard 16:9 widescreen slide format (1920×1080 pixels), which is the default in modern PowerPoint versions." },
          { q: "Can I add multiple images as multiple slides?", a: "Yes — upload multiple images and each one will automatically become its own slide in the presentation." },
          { q: "Can I edit the slides after conversion?", a: "Yes — the PPTX is fully editable. You can add text, change layouts, apply themes, and add transitions in PowerPoint." },
          { q: "Does the image quality stay intact in slides?", a: "Yes — images are embedded at full resolution. Slide image quality matches your original uploaded images." },
        ],
      },
    },
  },
  {
    slug: "html-to-image",
    name: "HTML To Image",
    category: "Format Converters",
    icon: Code2,
    blurb: "Render a URL or HTML snippet into a pixel-perfect screenshot.",
    accepts: "URL or HTML",
    outputs: "PNG, JPG",
    seo: {
      title: "HTML to Image Converter Online Free — Convert HTML Code to PNG, JPG",
      description: "Convert HTML and CSS code to image (PNG, JPG) online for free. Render HTML snippets or web page code to pixel-perfect screenshots. No browser extension needed.",
      keywords: ["html to image", "html to png", "convert html to image", "html screenshot", "render html online", "html to jpg converter", "css to image", "webpage to image", "html snippet to png", "html code screenshot"],
      article: {
        intro: "Converting HTML and CSS code to images is essential for creating social media graphics, email thumbnails, design mockups, and documentation screenshots. Our HTML to Image tool renders any HTML and CSS snippet into a pixel-perfect PNG or JPG image directly in your browser, with no server rendering required.",
        howTo: [
          "Enter your HTML code in the code editor above, or upload an HTML file.",
          "Set your desired output image dimensions (width and height in pixels).",
          "Preview the rendered HTML as it will appear in the output image.",
          "Download your rendered image as PNG or JPG.",
        ],
        benefits: [
          { heading: "No Browser Extension Required", body: "Unlike screenshot tools, our converter works directly in your browser with no extensions, plugins or additional software to install." },
          { heading: "Custom Dimensions", body: "Set exact pixel dimensions for your output image — perfect for creating consistently sized social media cards, Open Graph images and email headers." },
          { heading: "CSS & JavaScript Support", body: "Our renderer supports HTML5, CSS3 (including gradients, shadows and flexbox) to produce accurate visual representations of your code." },
          { heading: "Perfect for Open Graph Images", body: "Generate beautiful, branded OG images and Twitter Card images for your blog posts and web pages using custom HTML/CSS templates." },
        ],
        faqs: [
          { q: "Can I use external CSS libraries like Tailwind or Bootstrap?", a: "Yes — you can include CDN links for CSS frameworks in your HTML code. External stylesheets are loaded when rendering." },
          { q: "What dimensions should I use for social media images?", a: "For Open Graph/Facebook: 1200×630px. For Twitter Cards: 1200×628px. For Instagram: 1080×1080px (square) or 1080×1350px (portrait)." },
          { q: "Can I use custom fonts in my HTML?", a: "Yes — include Google Fonts or other font CDN links in your HTML <head> section and they will render correctly in the output image." },
          { q: "Does the renderer support animations?", a: "No — the output is a static image snapshot. CSS animations and JavaScript-driven animations are captured at their initial state." },
        ],
      },
    },
  },
  {
    slug: "pdf-to-image",
    name: "PDF To Image",
    category: "Document Converters",
    icon: FileDown,
    blurb: "Export every PDF page as a high-resolution image in one pass.",
    accepts: "PDF",
    outputs: "PNG, JPG",
    seo: {
      title: "PDF to Image Converter Online Free — Convert PDF Pages to JPG, PNG",
      description: "Convert PDF documents to high-resolution images online for free. Extract every page as JPG or PNG. No watermark, no sign-up, instant download.",
      keywords: ["pdf to image", "pdf to jpg converter", "pdf to png online", "convert pdf to image", "pdf page to jpg", "extract images from pdf", "pdf screenshot tool", "pdf to picture", "pdf to jpeg free", "convert pdf pages to images"],
      article: {
        intro: "Converting PDF pages to images is needed for creating preview thumbnails, extracting content for social media, editing PDF content in image editors, or making PDFs viewable on platforms that only accept images. Our free PDF to Image converter extracts each page at high resolution as JPG or PNG format.",
        howTo: [
          "Upload your PDF document using the upload zone above.",
          "Choose your output format — PNG (for higher quality and transparency support) or JPG (for smaller file size).",
          "Each PDF page is rendered as a separate high-resolution image.",
          "Download your converted image files.",
        ],
        benefits: [
          { heading: "High-Resolution Output", body: "PDF pages are rendered at 300 DPI resolution, producing sharp, print-quality images suitable for professional use." },
          { heading: "All Pages Converted", body: "Every page of your PDF is converted to a separate image — perfect for creating page-by-page previews or extracting content from multi-page documents." },
          { heading: "Share PDFs Anywhere", body: "Share PDF content on Instagram, Twitter and other platforms that don't support PDF uploads by converting pages to images first." },
          { heading: "Edit PDF Content", body: "By converting PDF pages to images, you can edit, annotate or combine PDF content in any image editing software." },
        ],
        faqs: [
          { q: "Can I convert specific PDF pages to images?", a: "The tool converts all pages. For selective page conversion, use a PDF editor to extract specific pages first, then convert." },
          { q: "What resolution are the output images?", a: "Images are rendered at 300 DPI by default, producing high-quality output suitable for print and screen use." },
          { q: "Will the text in my PDF images be readable?", a: "Yes — at 300 DPI the text should be clearly readable. If your PDF has very small text, ensure you're using the PNG format for maximum clarity." },
          { q: "Can I convert password-protected PDFs?", a: "You'll need to remove the PDF password protection before uploading. We don't support encrypted PDFs for privacy and security reasons." },
        ],
      },
    },
  },
  {
    slug: "excel-to-image",
    name: "Excel To Image",
    category: "Document Converters",
    icon: Table2,
    blurb: "Turn a sheet or selected range into a crisp shareable picture.",
    accepts: "XLSX, CSV",
    outputs: "PNG",
    seo: {
      title: "Excel to Image Converter Online Free — Convert Spreadsheet to PNG",
      description: "Convert Excel spreadsheets and CSV files to images (PNG) online for free. Share spreadsheet data as pictures on social media, documents or presentations.",
      keywords: ["excel to image", "spreadsheet to png", "xlsx to image", "csv to image", "excel screenshot", "share spreadsheet as image", "excel table to picture", "convert excel to png", "spreadsheet to picture", "export excel as image"],
      article: {
        intro: "Sharing spreadsheet data as an image is ideal for social media posts, presentation slides, reports and situations where recipients don't have Excel installed. Our Excel to Image converter renders your spreadsheet data as a clean, readable PNG image that can be shared anywhere.",
        howTo: [
          "Upload your Excel XLSX or CSV file using the upload zone above.",
          "The spreadsheet data is rendered as a clean, readable table image.",
          "Preview the image output.",
          "Download your PNG image file ready for sharing.",
        ],
        benefits: [
          { heading: "Share Data Without Excel", body: "Recipients without Microsoft Excel can view your spreadsheet data as an image on any device without needing special software." },
          { heading: "Perfect for Social Media", body: "Share survey results, financial data, comparison tables and statistics as clean, readable images on Twitter, LinkedIn, Instagram and Facebook." },
          { heading: "Include in Documents", body: "Embed spreadsheet tables as images in Word documents, PDF reports, and PowerPoint presentations without compatibility issues." },
          { heading: "Preserve Formatting", body: "The image accurately captures cell data, making it easy to share specific data ranges or full spreadsheet summaries." },
        ],
        faqs: [
          { q: "What spreadsheet formats are supported?", a: "The tool supports XLSX (Microsoft Excel) and CSV (Comma Separated Values) files." },
          { q: "Will formulas be calculated in the image?", a: "Yes — formulas are calculated and the resulting values are shown in the image, not the formula text." },
          { q: "Can I convert just a section of my spreadsheet?", a: "The tool converts the full populated area of your spreadsheet. For specific ranges, select and copy those cells to a new sheet before uploading." },
          { q: "What happens with charts in my Excel file?", a: "Currently the tool focuses on tabular data. Charts and graphs may not be rendered. Use a screenshot tool for Excel chart export." },
        ],
      },
    },
  },
  {
    slug: "word-to-image",
    name: "Word To Image",
    category: "Document Converters",
    icon: FileSpreadsheet,
    blurb: "Convert document pages into images with fonts and spacing intact.",
    accepts: "DOCX",
    outputs: "PNG, JPG",
    seo: {
      title: "Word to Image Converter Online Free — Convert DOCX to PNG, JPG",
      description: "Convert Microsoft Word documents (DOCX) to images (PNG, JPG) online for free. Share documents as pictures. No watermark, instant download, no registration.",
      keywords: ["word to image", "docx to png", "word to jpg", "convert word to image", "word document to picture", "docx to image online", "word to photo", "microsoft word to image", "document to image converter", "word page to png"],
      article: {
        intro: "Converting Word documents to images is useful for sharing content on social media, creating document thumbnails, and situations where you want to share document content without allowing text editing. Our DOCX to Image converter renders your Word document pages as high-quality PNG or JPG images.",
        howTo: [
          "Upload your Microsoft Word DOCX file using the upload zone above.",
          "Each document page is rendered as a separate image preserving fonts and layout.",
          "Choose PNG (higher quality) or JPG (smaller size) as your output format.",
          "Download your converted image files.",
        ],
        benefits: [
          { heading: "Share Without Microsoft Word", body: "Recipients without Word installed can view your document content as images on any device or platform — no software needed." },
          { heading: "Social Media Ready", body: "Share formatted document content, quotes, announcements and articles as attractive images on Instagram, Twitter and LinkedIn." },
          { heading: "Prevent Text Editing", body: "Converting to an image makes your document content uneditable — ideal for sharing final versions, certificates, and official documents." },
          { heading: "Preserve Visual Formatting", body: "Fonts, formatting, spacing and document structure are preserved in the image output, maintaining the professional appearance of your document." },
        ],
        faqs: [
          { q: "Can I convert multi-page Word documents?", a: "Yes — each page of your document is converted to a separate image file." },
          { q: "Will custom fonts in my Word document be preserved?", a: "Standard fonts like Arial, Times New Roman, Calibri and similar are supported. Very unusual custom fonts may fall back to defaults." },
          { q: "Does it support Word documents with images in them?", a: "Yes — images embedded in your Word document are included in the converted image output." },
          { q: "What's the output image resolution?", a: "Documents are rendered at 300 DPI for high-quality, print-ready image output." },
        ],
      },
    },
  },
  {
    slug: "powerpoint-to-image",
    name: "PowerPoint To Image",
    category: "Document Converters",
    icon: MonitorPlay,
    blurb: "Export each slide as its own image for thumbnails, decks or posts.",
    accepts: "PPTX",
    outputs: "PNG, JPG",
    seo: {
      title: "PowerPoint to Image Converter Online Free — Convert PPTX Slides to PNG, JPG",
      description: "Convert PowerPoint PPTX slides to images (PNG, JPG) online free. Each slide becomes a separate image. No watermark, no sign-up, instant download.",
      keywords: ["powerpoint to image", "pptx to png", "powerpoint to jpg", "convert slides to image", "ppt to picture", "slide to image online", "powerpoint screenshot", "export slides as images", "pptx to jpeg", "presentation to image"],
      article: {
        intro: "Exporting PowerPoint slides as images is essential for sharing presentation content on social media, creating slide thumbnails, embedding slides in web pages, and repurposing presentation content. Our PPTX to Image converter extracts each slide as a high-quality PNG or JPG image instantly.",
        howTo: [
          "Upload your PowerPoint PPTX file using the upload zone above.",
          "Each slide is automatically rendered as a separate image.",
          "Choose PNG (for higher quality and transparency) or JPG (for smaller file size).",
          "Download your converted slide images.",
        ],
        benefits: [
          { heading: "Share Slides on Social Media", body: "Share individual slides as images on LinkedIn, Instagram, Twitter and Facebook — no PowerPoint required for viewers to see your content." },
          { heading: "Create Thumbnail Galleries", body: "Convert all slides to images to create clickable thumbnail galleries for your website, portfolio or course platform." },
          { heading: "Repurpose Presentation Content", body: "Extract slide content as images for blog posts, newsletter graphics, Pinterest pins and other content marketing materials." },
          { heading: "View Without PowerPoint", body: "Recipients without PowerPoint installed can view all your slides as images using any image viewer or web browser." },
        ],
        faqs: [
          { q: "Will slide animations be captured?", a: "No — animations are captured at their final static state. The output shows the completed slide without animation effects." },
          { q: "Does it work with Google Slides?", a: "Download your Google Slides as PPTX format first, then upload the PPTX file to our converter." },
          { q: "What resolution are the slide images?", a: "Slides are rendered at 1920×1080 (16:9 Full HD) resolution by default, matching modern presentation standards." },
          { q: "Are embedded videos captured?", a: "Embedded videos are captured as static frames (the video poster frame) in the output image." },
        ],
      },
    },
  },
  {
    slug: "binary-to-image",
    name: "Binary To Image",
    category: "Format Converters",
    icon: ImagePlus,
    blurb: "Paste base64 or binary data and get the decoded image back instantly.",
    accepts: "Base64 / binary",
    outputs: "PNG, JPG",
    seo: {
      title: "Base64 to Image Decoder Online Free — Convert Binary Data to Image",
      description: "Decode Base64 strings and binary data back to images online for free. Paste your Base64 data URI and download the resulting PNG or JPG image instantly.",
      keywords: ["base64 to image", "decode base64 image", "binary to image converter", "base64 decoder online", "data uri to image", "base64 png decoder", "base64 jpg decoder", "convert base64 to picture", "image base64 decoder", "data url to image"],
      article: {
        intro: "Base64 image data appears frequently in code, APIs, databases and emails as text strings representing encoded image files. Our Base64 to Image decoder reverses this encoding, converting Base64 strings or data URIs back into downloadable PNG or JPG image files instantly in your browser.",
        howTo: [
          "Paste your Base64 encoded string or data URI into the input field.",
          "Or upload a text file containing Base64 image data.",
          "The tool automatically decodes the data and renders the image.",
          "Download the resulting PNG or JPG image file.",
        ],
        benefits: [
          { heading: "Instant Decoding", body: "Paste any Base64 image string and see the decoded image in seconds — no command line tools or programming knowledge required." },
          { heading: "Supports All Base64 Image Formats", body: "Decode Base64 encoded JPG, PNG, WEBP, GIF, SVG and other image formats from data URIs and raw Base64 strings." },
          { heading: "Works with API Responses", body: "Many APIs return image data as Base64 strings. Instantly visualise and download these images without writing code." },
          { heading: "Debug Image Data", body: "Verify that Base64 image encoding/decoding is working correctly in your application by visually inspecting the decoded result." },
        ],
        faqs: [
          { q: "What Base64 formats are supported?", a: "We support full data URIs (data:image/png;base64,...) and raw Base64 strings. Both formats are automatically detected." },
          { q: "How do I get a Base64 string from my code?", a: "Base64 strings appear in HTML src attributes, CSS background values, API responses, and database fields. Copy the string between the quotes after base64,." },
          { q: "What image types can be decoded?", a: "JPG, PNG, WEBP, GIF, SVG and other common image formats encoded in Base64 can be decoded and downloaded." },
          { q: "Is there a maximum string length?", a: "The tool handles Base64 strings up to approximately 10MB of encoded data (about 7.5MB original image size)." },
        ],
      },
    },
  },
  {
    slug: "upscale-image",
    name: "Upscale Image",
    category: "AI Tools",
    icon: Sparkle,
    tag: "AI",
    blurb: "Enlarge up to 4× and reconstruct detail instead of smearing pixels.",
    accepts: "Any image",
    outputs: "Up to 4K",
    seo: {
      title: "AI Image Upscaler Online Free — Upscale Images to 4K Without Quality Loss",
      description: "Upscale and enhance images online free using AI. Enlarge photos 2X or 4X to HD/4K resolution without pixelation or blurring. No watermark, instant download.",
      keywords: ["upscale image", "ai image upscaler", "enhance image resolution", "image quality enhancer", "upscale photo to 4k", "increase image resolution", "enlarge image without quality loss", "ai photo enhancer", "super resolution image", "image upscaler free online"],
      article: {
        intro: "Traditional image enlargement smears pixels and produces blurry, low-quality results. AI-powered upscaling uses deep learning algorithms to intelligently reconstruct missing detail, producing sharp, high-resolution images at 2X or 4X the original size. Our free AI image upscaler brings small or low-resolution photos to full HD and 4K quality.",
        howTo: [
          "Upload your image using the upload zone above.",
          "Choose your upscale multiplier — 2X (doubles dimensions) or 4X (quadruples dimensions for 4K output).",
          "The AI enhancement is applied automatically and previewed.",
          "Download your upscaled high-resolution image.",
        ],
        benefits: [
          { heading: "AI-Reconstructed Detail", body: "Our AI upscaling algorithm analyses image content and intelligently reconstructs fine details, textures and edges that standard resizing destroys." },
          { heading: "2X and 4K Upscaling", body: "Double your image dimensions for HD output, or quadruple them to reach true 4K resolution — ideal for printing large-format photos." },
          { heading: "Preserve Old Photos", body: "Restore old, low-resolution family photos to modern high-definition quality. Bring historical photos and scans to life with AI enhancement." },
          { heading: "Print at Large Sizes", body: "Upscale photos before printing large-format prints, canvas art, posters and banners without visible pixelation or blurring." },
        ],
        faqs: [
          { q: "How does AI upscaling differ from regular resizing?", a: "Regular resizing interpolates (guesses) pixel values mathematically, producing blurry results. AI upscaling uses deep learning to reconstruct realistic detail based on patterns learned from millions of images." },
          { q: "What's the maximum output resolution?", a: "With 4X upscaling, a 1080×1080px image becomes 4320×4320px — true 4K resolution. Input images up to 2000×2000px produce 4K output at 4X." },
          { q: "Will AI upscaling fix blurry photos?", a: "AI upscaling can sharpen some types of blur and enhance overall image sharpness, but severe motion blur or extreme softness cannot be fully recovered." },
          { q: "What image types work best with upscaling?", a: "Portraits, product photos, landscapes and graphics work very well. Very abstract or highly compressed images with severe artefacts may see less improvement." },
        ],
      },
    },
  },
  {
    slug: "remove-background",
    name: "Remove Background",
    category: "AI Tools",
    icon: Scissors,
    tag: "AI",
    blurb: "Edge-aware matting that keeps hair, fur and glass exactly where they belong.",
    accepts: "Any image",
    outputs: "Transparent PNG",
    seo: {
      title: "Remove Background Online Free — AI Background Remover Tool",
      description: "Remove image backgrounds online for free using AI. Get transparent PNG output instantly. Works on photos, products, portraits and more. No watermark, no sign-up.",
      keywords: ["remove background", "background remover", "remove image background", "transparent background maker", "background eraser online", "remove bg free", "cut out background", "photo background remover", "ai background removal", "transparent png maker"],
      article: {
        intro: "Removing backgrounds from images used to require expensive software and skilled designers. Our AI-powered background remover uses advanced edge-aware matting technology to precisely separate subjects from backgrounds — preserving fine details like hair strands, fur, and semi-transparent glass — delivering studio-quality transparent PNG results instantly.",
        howTo: [
          "Upload your image using the upload zone above.",
          "Our AI automatically detects the subject and removes the background.",
          "Preview the transparent result with a checkered background preview.",
          "Download your transparent PNG ready for use on any background.",
        ],
        benefits: [
          { heading: "Sub-Pixel Hair & Edge Matting", body: "Our Ganga and Karudi neural models use advanced alpha matting algorithms that preserve individual hair strands, fine edges, and semi-transparent elements that simpler tools lose." },
          { heading: "5 Specialized AI Engines", body: "Powered by Karudi (Universal Master), Ganga (Background Removal), Brahmaputra (Format Conversion), Narmada (OCR, Summary & Memes), and Saraswati (Research Tools)." },
          { heading: "4K Transparent PNG Output", body: "Download clean transparent PNG files at up to 4K resolution — pixel-perfect quality suitable for professional product photography, marketing materials and print." },
          { heading: "Batch Processing Ready", body: "Process multiple images with consistent results — ideal for e-commerce stores needing clean product shots on white or coloured backgrounds at scale." },
        ],
        faqs: [
          { q: "What types of images does background removal work best on?", a: "Our AI works excellently on portraits, product photos, animals, vehicles, and objects with clear subject-background contrast. Complex or very busy backgrounds are easily handled by Ganga and Karudi." },
          { q: "What is the output format?", a: "Output is always transparent PNG format, which preserves the transparent areas correctly. You can also use Brahmaputra to convert to JPG or WebP." },
          { q: "Does it work on photos with complex hair?", a: "Yes — the Ganga background removal model specifically preserves fine hair, flyaways and intricate edges with sub-pixel precision." },
          { q: "Can I convert or process images in different formats?", a: "Yes — Brahmaputra converts and compresses between JPG, PNG, and WebP instantly with zero quality loss." },
        ],
      },
    },
  },
  {
    slug: "remove-watermark",
    name: "Remove Watermark",
    category: "AI Tools",
    icon: Eraser,
    tag: "AI",
    blurb: "Erase overlays and stamps, then rebuild the texture underneath them.",
    accepts: "Any image",
    outputs: "Clean image",
    seo: {
      title: "Remove Watermark from Image Online Free — AI Watermark Remover",
      description: "Remove watermarks from images online for free using AI. Erase text overlays, logos and stamps then rebuild the background texture. Instant clean image download.",
      keywords: ["remove watermark", "watermark remover online", "remove watermark from image", "erase watermark free", "delete watermark photo", "watermark removal tool", "remove text overlay image", "clean watermark photo", "ai watermark eraser", "remove logo from image"],
      article: {
        intro: "Watermarks and text overlays on images can obscure important visual content. Whether you need to clean up your own watermarked images, remove copyright text from draft approvals, or erase accidentally placed stamps, our AI watermark remover identifies and erases overlay elements then intelligently reconstructs the background texture underneath.",
        howTo: [
          "Upload your watermarked image using the upload zone above.",
          "Our AI detects overlay elements including text, logos and transparent stamps.",
          "The watermark is removed and the background texture is rebuilt using AI inpainting.",
          "Download your clean, watermark-free image.",
        ],
        benefits: [
          { heading: "AI-Powered Inpainting", body: "Our AI doesn't just erase the watermark — it reconstructs the image content underneath using intelligent texture synthesis, leaving no visible trace." },
          { heading: "Works on Text & Logo Overlays", body: "Remove text watermarks, semi-transparent logo overlays, copyright stamps and other overlay elements from your photos." },
          { heading: "Clean, Seamless Results", body: "For most images, the removal is completely seamless — viewers cannot tell a watermark was ever present in the original image." },
          { heading: "Original Quality Preserved", body: "Only the watermark overlay area is modified. The rest of your image retains its full original quality and resolution." },
        ],
        faqs: [
          { q: "What types of watermarks can be removed?", a: "Our tool works best on semi-transparent text overlays, translucent logos, and stamps over textured backgrounds. Opaque watermarks over complex imagery are more challenging." },
          { q: "Can it remove my own watermarks from images?", a: "Yes — if you accidentally added a watermark to your own images or need to update branded watermarks, this tool can help remove them." },
          { q: "Will the area under the watermark look natural?", a: "For most watermarks over textured backgrounds (landscapes, fabrics, solid colours), the reconstruction looks very natural. Complex scenes under watermarks may show some artefacts." },
          { q: "Does it work on heavily watermarked stock photos?", a: "Large, opaque stock photo watermarks that cover significant portions of the image cannot be perfectly removed as the underlying content is completely obscured." },
        ],
      },
    },
  },
  {
    slug: "watermark-image",
    name: "Watermark Image",
    category: "Image Editing & Optimization",
    icon: Stamp,
    blurb: "Stamp text or a logo across single images or a whole batch at once.",
    accepts: "Any image",
    outputs: "Watermarked image",
    seo: {
      title: "Add Watermark to Image Online Free — Text Watermark Tool",
      description: "Add custom text watermarks to images online for free. Choose position, font size, opacity and colour. Protect your photos instantly. No watermark on output.",
      keywords: ["add watermark to image", "watermark image online", "text watermark tool", "photo watermark maker", "watermark photo free", "add text to image", "image watermark creator", "protect image copyright", "watermark photos online", "bulk watermark images"],
      article: {
        intro: "Protecting your original photography, artwork and creative content with watermarks is essential for copyright protection and brand attribution. Our free watermark tool lets you add custom text overlays to your images with full control over position, size, opacity and colour — protecting your work without expensive software.",
        howTo: [
          "Upload your image using the upload zone above.",
          "Enter your watermark text (your name, website URL, or copyright notice).",
          "Set the position, font size, opacity and text colour using the controls.",
          "Preview the result and download your watermarked image.",
        ],
        benefits: [
          { heading: "Copyright Protection", body: "Watermarked images clearly identify you as the creator, making it harder for others to use your work without attribution or permission." },
          { heading: "Flexible Positioning", body: "Place your watermark in any corner, the centre, or a custom position on your image. Perfect for maintaining visual focus while protecting your work." },
          { heading: "Adjustable Opacity", body: "Set watermark opacity from subtle (10%) to prominent (100%). Subtle watermarks protect without distracting from the image content." },
          { heading: "Custom Text & Style", body: "Use your name, studio name, website URL, social handle or copyright notice as your watermark text with custom font size and colour." },
        ],
        faqs: [
          { q: "Can I add a logo watermark instead of text?", a: "Currently the tool supports text watermarks. For logo watermarks, use an image editor to overlay your logo at the desired opacity." },
          { q: "What opacity should I use for watermarks?", a: "For copyright protection, 30–50% opacity is typically recommended — visible enough to deter misuse, subtle enough not to ruin the image." },
          { q: "Can I watermark multiple images at once?", a: "Upload images individually for now. Batch watermarking is on our roadmap for an upcoming release." },
          { q: "Will the watermark permanently alter my original image?", a: "No — the watermark is applied to a copy processed in your browser. Your original uploaded file is never modified." },
        ],
      },
    },
  },
  {
    slug: "rotate-image",
    name: "Rotate Image",
    category: "Image Editing & Optimization",
    icon: RotateCw,
    blurb: "Rotate, flip or straighten a tilted horizon by a fraction of a degree.",
    accepts: "Any image",
    outputs: "Rotated image",
    seo: {
      title: "Rotate Image Online Free — Rotate & Flip Photos Instantly",
      description: "Rotate images 90°, 180°, 270° and flip horizontally or vertically online for free. Fix photo orientation, straighten horizons. Instant download, no watermark.",
      keywords: ["rotate image online", "flip image free", "rotate photo 90 degrees", "image rotation tool", "flip image horizontally", "rotate jpg online", "fix photo orientation", "flip picture online", "rotate png free", "straighten image online"],
      article: {
        intro: "Photos taken with a camera tilted sideways or upside down need rotation before they can be shared or used. Our free image rotation tool lets you rotate any image by 90°, 180° or 270° and flip horizontally or vertically with a single click — fixing orientation issues instantly without any software installation.",
        howTo: [
          "Upload your image using the upload zone above.",
          "Click 'Rotate 90°' or 'Rotate -90°' to rotate clockwise or counter-clockwise.",
          "Use 'Flip Horizontal' or 'Flip Vertical' to mirror the image.",
          "Download your correctly oriented image.",
        ],
        benefits: [
          { heading: "Fix Incorrect Orientation", body: "Correct sideways or upside-down photos from cameras or smartphones that capture images in the wrong orientation." },
          { heading: "Mirror Images for Design", body: "Flip images horizontally to create mirror effects for design compositions, symmetrical layouts, and creative artistic effects." },
          { heading: "Multiple Rotation Options", body: "Rotate clockwise (90°), counter-clockwise (90°) or by 180° for full upside-down correction. Combine rotations for any angle." },
          { heading: "Lossless EXIF Correction", body: "Images are processed losslessly — rotation doesn't add compression or reduce quality compared to your original upload." },
        ],
        faqs: [
          { q: "Why are my photos showing sideways?", a: "Smartphones embed orientation data (EXIF) in photos. Some apps don't read this data and display images sideways. Rotating and re-saving fixes this issue." },
          { q: "Can I rotate by arbitrary angles (e.g. 45°)?", a: "Currently the tool supports 90° incremental rotations. For fine angle adjustment and horizon straightening, use our Photo Editor tool." },
          { q: "Does rotating reduce image quality?", a: "90° rotation is completely lossless. The image data is simply rearranged — no compression or quality loss occurs." },
          { q: "What's the difference between rotate and flip?", a: "Rotating turns the image clockwise or counter-clockwise. Flipping creates a mirror image — horizontal flip mirrors left-to-right, vertical flip mirrors top-to-bottom." },
        ],
      },
    },
  },
  {
    slug: "blur-face",
    name: "Blur Face",
    category: "AI Tools",
    icon: SmilePlus,
    blurb: "Detect faces automatically and blur or pixelate them for privacy.",
    accepts: "Any image",
    outputs: "Anonymised image",
    seo: {
      title: "Blur Face Online Free — Anonymise Faces in Photos Instantly",
      description: "Blur or pixelate faces in photos online for free. Automatically detect and anonymise faces for privacy. GDPR compliant, no data stored. Instant download.",
      keywords: ["blur face online", "anonymise photo", "blur face image", "face blur tool", "pixelate face", "privacy blur photo", "gdpr image anonymisation", "hide face in photo", "blur person image", "auto face blur free"],
      article: {
        intro: "Protecting individuals' privacy in photographs is a legal and ethical requirement in many contexts. Whether you're publishing event photos, user research images, or street photography, blurring unidentified faces ensures GDPR compliance and respects personal privacy. Our free face blur tool automatically detects and anonymises faces with a single click.",
        howTo: [
          "Upload your image using the upload zone above.",
          "Adjust the blur strength slider to control how heavily faces are anonymised.",
          "Preview the result with blurred faces visible in real time.",
          "Download your privacy-protected anonymised image.",
        ],
        benefits: [
          { heading: "GDPR & Privacy Compliance", body: "Automatically blur faces before publishing photos online or in documents to comply with GDPR, CCPA and other privacy regulations that protect individual identity." },
          { heading: "Adjustable Blur Intensity", body: "Use a light blur for subtle anonymisation or maximum blur for complete face obscuration. Control the intensity with a simple slider." },
          { heading: "Works on Group Photos", body: "The tool applies blur across all detected faces in an image — perfect for event photos, crowd shots and group images where multiple people need anonymisation." },
          { heading: "No Data Stored", body: "All face detection and blur processing happens in your browser. Photos containing sensitive content are never uploaded to any server." },
        ],
        faqs: [
          { q: "Does the tool automatically detect all faces?", a: "Our blur applies a broad anonymisation effect across the image. For precise individual face selection, use a dedicated image editor with face detection." },
          { q: "Is this tool GDPR compliant?", a: "The tool processes images entirely in your browser with no server upload or storage, making it suitable for GDPR-sensitive use cases. Always consult legal advice for specific compliance requirements." },
          { q: "Can I blur specific areas manually?", a: "Currently the tool applies a full-image blur effect. For selective region blurring, use our Photo Editor tool which supports adjustable area-specific blur." },
          { q: "What file formats are supported?", a: "All common image formats are supported including JPG, PNG, WEBP and more. Output is saved as a high-quality image in the same format." },
        ],
      },
    },
  },
  {
    slug: "meme-generator",
    name: "Meme Generator",
    category: "Creative & Utilities",
    icon: Laugh,
    blurb: "Top and bottom text, classic stroke, custom fonts — posted in seconds.",
    accepts: "Any image",
    outputs: "Meme image",
    seo: {
      title: "Free Meme Generator Online — Create Custom Memes Instantly",
      description: "Create custom memes online for free. Add top and bottom text in the classic Impact style. Supports any image. No watermark, instant download.",
      keywords: ["meme generator", "create meme online", "meme maker free", "custom meme creator", "add text to image meme", "impact font meme", "funny meme generator", "meme template creator", "make meme online", "free meme creator"],
      article: {
        intro: "Memes are one of the most powerful forms of online communication — combining relatable imagery with witty text to create shareable content that resonates across social media. Our free meme generator lets you upload any image and add classic Impact-style top and bottom text to create viral-ready memes in seconds.",
        howTo: [
          "Upload your image or meme template using the upload zone above.",
          "Enter your top text in the first text field (what you want at the top of the meme).",
          "Enter your bottom text in the second text field (the punchline).",
          "Preview your meme and click Download to save it.",
        ],
        benefits: [
          { heading: "Classic Meme Typography", body: "Our generator uses the iconic Impact font with black outline strokes — the timeless style that makes memes instantly recognisable across all platforms." },
          { heading: "Any Image as Base", body: "Use classic meme templates, your own photos, screenshots or any image as your meme base. Creativity has no limits." },
          { heading: "No Watermark", body: "Unlike many meme generators, we add no watermarks or logos to your created memes. What you create is 100% yours." },
          { heading: "Share Anywhere", body: "Download your meme as a high-quality image ready to share on Reddit, Twitter, Instagram, Discord, WhatsApp or any other platform." },
        ],
        faqs: [
          { q: "Can I use any image as a meme base?", a: "Yes — upload any JPG, PNG or WEBP image and add your text. Popular meme templates and your own original images are both supported." },
          { q: "Is there a character limit for meme text?", a: "No character limit, but shorter text tends to work better for readability. Memes with 3–7 words per line are most impactful." },
          { q: "Can I adjust the text size?", a: "Yes — use the font size control in the settings panel to adjust text size to fit your image and text length perfectly." },
          { q: "What format are downloaded memes?", a: "Memes are downloaded as high-quality PNG images, maintaining the full resolution of your original uploaded image." },
        ],
      },
    },
  },
  {
    slug: "photo-editor",
    name: "Photo Editor",
    category: "Image Editing & Optimization",
    icon: SlidersHorizontal,
    blurb: "Exposure, contrast, curves, filters and crop in one lightweight editor.",
    accepts: "Any image",
    outputs: "Edited image",
    seo: {
      title: "Free Online Photo Editor — Edit Photos with Filters, Brightness & Contrast",
      description: "Edit photos online free with our lightweight photo editor. Adjust brightness, contrast, saturation and grayscale. Add filters, crop and edit images. No download needed.",
      keywords: ["online photo editor", "edit photo free", "photo editing tool", "brightness contrast editor", "image filter online", "photo editor no download", "adjust photo online", "edit image brightness", "photo effects online", "free image editor web"],
      article: {
        intro: "Professional photo editing no longer requires expensive software. Our free browser-based photo editor gives you essential tools for adjusting exposure, colour, contrast and applying filters — all without downloading any software. Edit your photos directly in your browser and download the improved results instantly.",
        howTo: [
          "Upload your photo using the upload zone above.",
          "Use the Brightness slider to lighten or darken your photo.",
          "Adjust Contrast to increase or decrease the difference between light and dark areas.",
          "Apply Grayscale for black & white conversion, or use Sepia for vintage effects.",
          "Download your edited photo.",
        ],
        benefits: [
          { heading: "Essential Editing Controls", body: "Adjust brightness, contrast, saturation, grayscale and sepia with intuitive sliders — the core adjustments needed for 90% of photo editing tasks." },
          { heading: "Real-Time Preview", body: "See your edits applied instantly in the preview panel as you move the sliders — no apply button needed, just slide and see." },
          { heading: "No Software Installation", body: "Edit photos on any device — Windows, Mac, iPhone, Android — using just your web browser. No Photoshop or Lightroom subscription required." },
          { heading: "Non-Destructive Editing", body: "Adjustments are applied to a browser copy of your image. Your original file is never modified — reset and start over any time." },
        ],
        faqs: [
          { q: "What photo adjustments are available?", a: "Currently supported: Brightness (50–150%), Contrast (50–150%), and Grayscale (0–100%). More adjustments including colour temperature, saturation and curves are coming soon." },
          { q: "Can I add filters like Instagram?", a: "The grayscale and sepia controls provide two classic filter effects. More Instagram-style filters are planned for future updates." },
          { q: "Does this work on RAW camera files?", a: "Currently the editor supports JPG, PNG and WEBP. For RAW file editing, convert to JPG first using our Convert to JPG tool." },
          { q: "Can I undo my edits?", a: "Re-upload your original image or move sliders back to their default positions (100%) to reset your edits." },
        ],
      },
    },
  },
  {
    slug: "color-picker-from-image",
    name: "Color Picker From Image",
    category: "Creative & Utilities",
    icon: Pipette,
    blurb: "Hover or click anywhere on any image to pick exact HEX, RGB and HSL color values.",
    accepts: "Any image",
    outputs: "HEX, RGB, HSL",
    seo: {
      title: "Color Picker From Image Online Free — Extract Image Color Palette",
      description: "Pick colors from any image online for free. Click or hover on photos to get exact HEX, RGB, HSL codes and copy palette values instantly with 1-click.",
      keywords: ["color picker from image", "image color picker", "extract colors from image", "photo color finder", "hex color picker from picture", "image color palette generator", "rgb color picker photo", "image color dropper online", "pick color from photo", "eye dropper online tool"],
      article: {
        intro: "Finding the exact color code from a logo, design mockup, photograph, or screenshot is a daily necessity for UI/UX designers, developers, and digital artists. Our free online Image Color Picker lets you upload any image and pick exact color codes (HEX, RGB, HSL) with sub-pixel precision — creating a downloadable color palette history in seconds.",
        howTo: [
          "Upload your image using the upload zone above or drag and drop your file.",
          "Hover over any area of the image to see a real-time magnified color preview.",
          "Click directly on any pixel to sample and lock that exact color.",
          "Click the Copy button next to the HEX, RGB, or HSL value to paste into your design or code.",
        ],
        benefits: [
          { heading: "Instant Pixel-Accurate Sampling", body: "Sample exact color values from any pixel in your uploaded photograph, graphic design, or screenshot with live preview positioning." },
          { heading: "HEX, RGB & HSL Formats", body: "Get color codes formatted in standard web HEX (#FF5500), CSS RGB (rgb(255, 85, 0)), and HSL (hsl(20, 100%, 50%)) for immediate developer use." },
          { heading: "Built-In Color Palette History", body: "Every color you click is saved to a visual palette history list so you can build a complete color scheme from a single image." },
          { heading: "Private & Browser-Based", body: "All color sampling takes place directly inside your web browser via HTML5 Canvas — your images are never stored or uploaded to any server." },
        ],
        faqs: [
          { q: "How do I pick a color from an image?", a: "Simply upload your image file, move your cursor over the photo, and click on the color you want to extract. The exact HEX and RGB codes will be displayed instantly." },
          { q: "Can I copy the HEX code to clipboard?", a: "Yes — click the Copy button next to any HEX, RGB, or HSL code to copy it straight to your clipboard." },
          { q: "Does this tool work on mobile devices?", a: "Yes — tap anywhere on your image using a touch screen device to pick color samples." },
          { q: "What image formats can I sample colors from?", a: "You can pick colors from JPG, PNG, WEBP, SVG, GIF, AVIF, HEIC, and all standard image formats." },
        ],
      },
    },
  },
  {
    slug: "image-to-base64",
    name: "Image To Base64",
    category: "Format Converters",
    icon: FileCode,
    blurb: "Encode any image into Base64 Data URI string for HTML, CSS, and API embedding.",
    accepts: "Any image",
    outputs: "Base64 string",
    seo: {
      title: "Image to Base64 Encoder Online Free — Convert Image to Data URI",
      description: "Convert JPG, PNG, WEBP images to Base64 text string online for free. Embed images directly in HTML, CSS, or JSON without external file dependencies.",
      keywords: ["image to base64", "base64 encoder online", "convert image base64", "image data uri", "embed image in html"],
      article: {
        intro: "Base64 encoding converts binary image data into ASCII string format, allowing images to be embedded directly into web code and JSON payloads.",
        howTo: ["Upload your image.", "Copy the generated Base64 string or Data URI.", "Paste into your code or stylesheet."],
        benefits: [{ heading: "No External HTTP Requests", body: "Embed small UI graphics directly inside HTML or CSS files." }],
        faqs: [{ q: "Does Base64 increase file size?", a: "Base64 string encoding adds approximately 33% overhead compared to binary data." }],
      },
    },
  },
  {
    slug: "base64-to-image",
    name: "Base64 To Image",
    category: "Format Converters",
    icon: FileImage,
    blurb: "Paste Base64 encoded string or Data URI and decode it back into a downloadable image file.",
    accepts: "Base64 text",
    outputs: "PNG, JPG, WEBP",
    seo: {
      title: "Base64 to Image Decoder Online Free — Decode Base64 to Image File",
      description: "Convert Base64 string or Data URI back into PNG, JPG, or WEBP image file online for free.",
      keywords: ["base64 to image", "decode base64 image", "base64 string to png", "base64 converter"],
      article: {
        intro: "Decode any Base64 string or Data URI back into a clean, downloadable image file.",
        howTo: ["Paste your Base64 text string.", "Preview the decoded image.", "Click Download to save the image file."],
        benefits: [{ heading: "Instant Image Decoding", body: "Decode Base64 strings directly in your browser with no server uploads needed." }],
        faqs: [{ q: "What format can I decode to?", a: "You can download the decoded image as PNG, JPG, or WEBP." }],
      },
    },
  },
  {
    slug: "octal-to-image",
    name: "Octal To Image",
    category: "Format Converters",
    icon: FileDigit,
    blurb: "Convert raw Octal byte data values back into a decoded image file.",
    accepts: "Octal data text",
    outputs: "Decoded image",
    seo: {
      title: "Octal to Image Converter Online Free — Decode Octal Bytes to Image",
      description: "Convert Octal numerical byte sequences (base 8) back into image files online free.",
      keywords: ["octal to image", "decode octal to photo", "octal byte image converter"],
      article: {
        intro: "Reconstruct binary images from raw Octal byte data sequences.",
        howTo: ["Paste your Octal byte sequence.", "Click Process Image.", "Download your reconstructed image."],
        benefits: [{ heading: "Low-Level Octal Decoding", body: "Useful for system debugging, low-level data recovery, and computer science workflows." }],
        faqs: [{ q: "What format should the Octal input be?", a: "Space-separated or continuous 3-digit Octal byte strings (e.g. 137 120 116)." }],
      },
    },
  },
  {
    slug: "image-to-octal",
    name: "Image To Octal",
    category: "Format Converters",
    icon: Binary,
    blurb: "Convert image binary bytes into Octal numeric sequence representation.",
    accepts: "Any image",
    outputs: "Octal data text",
    seo: {
      title: "Image to Octal Converter Online Free — Encode Image to Octal Bytes",
      description: "Encode image file binary bytes into base-8 Octal number sequences online for free.",
      keywords: ["image to octal", "octal encoder photo", "convert image to octal bytes"],
      article: {
        intro: "Convert any image into its byte-by-byte Octal numerical representation.",
        howTo: ["Upload your image.", "Copy the generated Octal byte string.", "Use in low-level programming or binary analysis."],
        benefits: [{ heading: "Base-8 Numerical Data", body: "View and extract base-8 byte structures from digital image files." }],
        faqs: [{ q: "Is Octal encoding reversible?", a: "Yes, use our Octal To Image tool to decode the octal stream back into an image." }],
      },
    },
  },
  {
    slug: "image-to-ascii",
    name: "Image To ASCII",
    category: "Format Converters",
    icon: Terminal,
    blurb: "Transform photo pixels into beautiful ASCII text art or raw ASCII byte stream.",
    accepts: "Any image",
    outputs: "ASCII text / art",
    seo: {
      title: "Image to ASCII Art Converter Online Free — Convert Photo to ASCII Text",
      description: "Turn any photo or image into ASCII text art online for free. Copy ASCII art to terminal or text file.",
      keywords: ["image to ascii", "ascii art converter", "photo to ascii art", "image ascii generator"],
      article: {
        intro: "Convert images into character-based ASCII art for command-line banners, retro art, and documentation.",
        howTo: ["Upload your image file.", "Preview the generated ASCII art.", "Copy the ASCII text."],
        benefits: [{ heading: "Retro ASCII Art", body: "Generate terminal-ready text art from photographs and graphics." }],
        faqs: [{ q: "Can I copy the ASCII output?", a: "Yes, use 1-click copy to paste ASCII art anywhere." }],
      },
    },
  },
  {
    slug: "ascii-to-image",
    name: "ASCII To Image",
    category: "Format Converters",
    icon: FileText,
    blurb: "Convert ASCII text art or ASCII character stream into a high-res image.",
    accepts: "ASCII text",
    outputs: "PNG, JPG",
    seo: {
      title: "ASCII Art to Image Converter Online Free — Render ASCII Text to PNG",
      description: "Render ASCII text art or character streams into a clean, crisp PNG or JPG graphic image.",
      keywords: ["ascii to image", "ascii art to png", "render text art to image"],
      article: {
        intro: "Convert text-based ASCII art into high-resolution PNG or JPG image graphics.",
        howTo: ["Paste your ASCII text art.", "Adjust canvas style.", "Download as PNG image."],
        benefits: [{ heading: "Crisp Monospace Render", body: "Preserves exact character alignment in high-resolution image format." }],
        faqs: [{ q: "Can I change font colors?", a: "Yes, choose dark or light retro theme rendering." }],
      },
    },
  },
  {
    slug: "image-to-text",
    name: "Image To Text",
    category: "Format Converters",
    icon: ScanText,
    blurb: "Extract raw readable text strings and characters embedded inside images.",
    accepts: "Any image",
    outputs: "Plain text",
    seo: {
      title: "Image to Text Converter Online Free — Extract Text from Photos",
      description: "Extract text from photos, scans, and screenshots online for free.",
      keywords: ["image to text", "extract text photo", "image text extractor"],
      article: {
        intro: "Extract editable text from photographs, documents, and screenshots.",
        howTo: ["Upload your image.", "Click Process Image.", "Copy extracted text."],
        benefits: [{ heading: "Instant Text Extraction", body: "Copy plain text without typing manually." }],
        faqs: [{ q: "What language is supported?", a: "Supports all standard alphanumeric text." }],
      },
    },
  },
  {
    slug: "hex-to-image",
    name: "Hex To Image",
    category: "Format Converters",
    icon: Hash,
    blurb: "Convert Hexadecimal byte string back into a decoded image file.",
    accepts: "Hex text",
    outputs: "PNG, JPG, WEBP",
    seo: {
      title: "Hex to Image Converter Online Free — Decode Hexadecimal Bytes to Image",
      description: "Decode Hexadecimal byte strings back into downloadable image files online for free.",
      keywords: ["hex to image", "hex string to photo", "decode hex image"],
      article: {
        intro: "Reconstruct images from raw Hexadecimal byte streams (e.g. FF D8 FF E0).",
        howTo: ["Paste Hex byte string.", "Click Process Image.", "Download decoded image."],
        benefits: [{ heading: "Hex Byte Decoding", body: "Ideal for binary analysis, file carving, and developer tools." }],
        faqs: [{ q: "Does it handle spaced hex?", a: "Yes, works with space-separated or raw continuous hex strings." }],
      },
    },
  },
  {
    slug: "image-to-hex",
    name: "Image To Hex",
    category: "Format Converters",
    icon: Code2,
    blurb: "Convert image file bytes into formatted Hexadecimal string.",
    accepts: "Any image",
    outputs: "Hex string",
    seo: {
      title: "Image to Hex Converter Online Free — Encode Image to Hexadecimal",
      description: "Convert image files to Hexadecimal byte string format online for free.",
      keywords: ["image to hex", "hex dump photo", "convert image to hex string"],
      article: {
        intro: "Generate Hexadecimal dumps of image files for inspection, embedding, or data transfer.",
        howTo: ["Upload image.", "Copy Hex string.", "Use in code or binary tools."],
        benefits: [{ heading: "Formatted Hex Dump", body: "Inspect raw hex headers and payload bytes." }],
        faqs: [{ q: "Is Hex format reversible?", a: "Yes, use Hex To Image to rebuild the file." }],
      },
    },
  },
  {
    slug: "decimal-to-image",
    name: "Decimal To Image",
    category: "Format Converters",
    icon: FileDigit,
    blurb: "Convert Decimal byte sequence into a reconstructed image file.",
    accepts: "Decimal values text",
    outputs: "PNG, JPG",
    seo: {
      title: "Decimal to Image Converter Online Free — Decode Decimal Bytes to Photo",
      description: "Convert Decimal byte arrays (0-255 numbers) back into clean image files online for free.",
      keywords: ["decimal to image", "decimal byte image decoder", "convert decimal numbers to photo"],
      article: {
        intro: "Reconstruct binary image files from comma or space-separated Decimal byte values.",
        howTo: ["Paste Decimal byte array.", "Process & preview.", "Download image file."],
        benefits: [{ heading: "Byte Array Reconstruction", body: "Rebuild images from raw integer byte buffers." }],
        faqs: [{ q: "What delimiter works?", a: "Supports space, comma, or newline separated decimal numbers." }],
      },
    },
  },
  {
    slug: "image-to-decimal",
    name: "Image To Decimal",
    category: "Format Converters",
    icon: Binary,
    blurb: "Convert image binary data into Decimal byte numbers string.",
    accepts: "Any image",
    outputs: "Decimal values text",
    seo: {
      title: "Image to Decimal Converter Online Free — Convert Image to Byte Array",
      description: "Convert image files into Decimal byte number sequences (0-255) online for free.",
      keywords: ["image to decimal", "image byte array generator", "photo decimal encoder"],
      article: {
        intro: "Convert any image into an array of Decimal byte numbers (0 to 255) for programming and buffer manipulation.",
        howTo: ["Upload image.", "Select delimiter format.", "Copy decimal byte array."],
        benefits: [{ heading: "Programming Ready Arrays", body: "Generate byte arrays for C, JS, Python, and C++." }],
        faqs: [{ q: "Can I copy the array?", a: "Yes, copy with 1-click." }],
      },
    },
  },
  {
    slug: "square-your-image",
    name: "Square Your Image",
    category: "Image Editing & Optimization",
    icon: Square,
    blurb: "Make any photo perfectly 1:1 square with background padding, blurred edges, or center crop.",
    accepts: "Any image",
    outputs: "1:1 Square Image",
    seo: {
      title: "Square Your Image Online Free — Make Photos 1:1 Square Without Crop",
      description: "Make any picture 1:1 square online for free. Add blurred background padding, solid color borders, or center crop for Instagram and profile photos.",
      keywords: ["square your image", "square photo maker", "make image square without cropping", "fit photo to square", "instagram square picture maker"],
      article: {
        intro: "Square Your Image allows you to transform portrait or landscape photos into 1:1 square images without cutting off important subject details, using background blur or solid padding.",
        howTo: [
          "Upload your photo.",
          "Choose background style: Blurred Background, Solid Color, or Center Crop.",
          "Download your 1:1 square photo instantly.",
        ],
        benefits: [
          { heading: "No Subject Cropping", body: "Keep the whole photo visible by padding the edges with a stylish blur or color fill." },
          { heading: "Instagram & Profile Ready", body: "Perfect 1:1 aspect ratio for Instagram posts, WhatsApp avatars, and social profiles." },
        ],
        faqs: [
          { q: "Can I adjust the blur amount?", a: "Yes, choose between blurred background, solid white, solid black, or custom color." },
        ],
      },
    },
  },

  // ─── PDF TOOLS ──────────────────────────────────────────────────────────────

  // Merge PDF
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    category: "PDF Tools",
    icon: Merge,
    tag: "Popular",
    blurb: "Combine multiple PDF files into one document in seconds, in any order.",
    accepts: "PDF",
    outputs: "Merged PDF",
    seo: {
      title: "Merge PDF Online Free — Combine PDF Files Into One",
      description: "Merge multiple PDF files into a single document online for free. Drag to reorder pages, no account required, instant download.",
      keywords: ["merge pdf", "combine pdf", "join pdf files", "merge pdf online free", "pdf merger"],
      article: {
        intro: "Merging PDF files is one of the most common document tasks. Our free online PDF merger lets you combine as many PDFs as you need into a single file, with full control over the order.",
        howTo: ["Upload your PDF files.", "Drag to reorder them as needed.", "Click Merge PDF.", "Download the combined PDF."],
        benefits: [
          { heading: "Unlimited Files", body: "Combine as many PDFs as you need in one go." },
          { heading: "Reorder Pages", body: "Drag and drop files to set the exact order before merging." },
          { heading: "Free & Secure", body: "No account needed. Files are processed securely." },
          { heading: "Instant Result", body: "Get your merged PDF in seconds." },
        ],
        faqs: [
          { q: "How many PDFs can I merge?", a: "You can merge as many PDF files as you need." },
          { q: "Will the quality be affected?", a: "No — the original quality of all content is preserved." },
        ],
      },
    },
  },

  // Split PDF
  {
    slug: "split-pdf",
    name: "Split PDF",
    category: "PDF Tools",
    icon: SplitSquareVertical,
    tag: "Popular",
    blurb: "Extract specific pages or split a PDF into multiple individual files.",
    accepts: "PDF",
    outputs: "Split PDF files",
    seo: {
      title: "Split PDF Online Free — Extract Pages from PDF",
      description: "Split a PDF into multiple files or extract specific pages online for free. Fast, easy, no account required.",
      keywords: ["split pdf", "pdf splitter", "extract pdf pages", "separate pdf pages", "split pdf online free"],
      article: {
        intro: "Split large PDF documents into smaller files or extract only the pages you need. Perfect for sharing specific sections of a document without revealing the rest.",
        howTo: ["Upload your PDF.", "Select pages or ranges to split.", "Click Split PDF.", "Download your split files."],
        benefits: [
          { heading: "Flexible Splitting", body: "Split by page ranges, every page, or extract specific pages." },
          { heading: "Fast Processing", body: "Large PDFs are split in seconds." },
          { heading: "Free to Use", body: "No watermarks, no account, completely free." },
          { heading: "Privacy First", body: "Your documents are handled securely." },
        ],
        faqs: [
          { q: "Can I split a PDF into individual pages?", a: "Yes, you can split every page into its own PDF file." },
          { q: "Can I extract a specific page range?", a: "Yes, specify any page range to extract." },
        ],
      },
    },
  },

  // Compress PDF
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    category: "PDF Tools",
    icon: Minimize2,
    tag: "Popular",
    blurb: "Reduce PDF file size without sacrificing readability or print quality.",
    accepts: "PDF",
    outputs: "Compressed PDF",
    seo: {
      title: "Compress PDF Online Free — Reduce PDF File Size",
      description: "Compress PDF files online for free. Reduce PDF size for email, web, and storage without losing quality.",
      keywords: ["compress pdf", "reduce pdf size", "pdf compressor online", "shrink pdf", "pdf optimizer"],
      article: {
        intro: "Compressing a PDF reduces its file size, making it easier to share via email or upload to websites. Our tool intelligently compresses images and optimizes content streams.",
        howTo: ["Upload your PDF file.", "Choose compression level.", "Click Compress PDF.", "Download the smaller PDF."],
        benefits: [
          { heading: "Up to 90% Smaller", body: "Dramatically reduce file size while maintaining readability." },
          { heading: "Multiple Levels", body: "Choose between extreme, high, medium, and low compression." },
          { heading: "Preserve Quality", body: "Text and vector graphics remain sharp at any compression level." },
          { heading: "Email Ready", body: "Get files under common email attachment size limits." },
        ],
        faqs: [
          { q: "Will text remain readable after compression?", a: "Yes, text is always preserved perfectly. Only image quality may be slightly reduced." },
          { q: "What's the maximum PDF size I can compress?", a: "You can compress PDFs of any size." },
        ],
      },
    },
  },

  // Edit PDF
  {
    slug: "edit-pdf",
    name: "Edit PDF",
    category: "PDF Tools",
    icon: FilePen,
    blurb: "Add text, images, shapes, and annotations directly to any PDF document.",
    accepts: "PDF",
    outputs: "Edited PDF",
    seo: {
      title: "Edit PDF Online Free — Add Text, Images & Shapes to PDF",
      description: "Edit PDF files online for free. Add text, images, drawings, and annotations to any PDF page. No software required.",
      keywords: ["edit pdf", "pdf editor online", "add text to pdf", "pdf annotator", "edit pdf free"],
      article: {
        intro: "Edit any PDF directly in your browser. Add text boxes, images, freehand drawings, shapes, and sticky notes without needing Adobe Acrobat or any desktop software.",
        howTo: ["Upload your PDF.", "Use the editor toolbar to add text, images, or annotations.", "Position and style your additions.", "Download the edited PDF."],
        benefits: [
          { heading: "Full Editing Suite", body: "Text, images, shapes, highlights and freehand drawing in one tool." },
          { heading: "No Installation", body: "Works entirely in your browser — no plugins required." },
          { heading: "Preserves Original", body: "All edits are added as layers, keeping the original content intact." },
          { heading: "Any Device", body: "Edit PDFs on desktop, tablet or mobile." },
        ],
        faqs: [
          { q: "Can I delete text from an existing PDF?", a: "You can cover existing text with white boxes and add new text on top." },
          { q: "Can I add images?", a: "Yes, upload images to place them anywhere on the PDF." },
        ],
      },
    },
  },

  // Sign PDF
  {
    slug: "sign-pdf",
    name: "Sign PDF",
    category: "PDF Tools",
    icon: FileSignature,
    tag: "Popular",
    blurb: "Draw, type, or upload your signature and apply it to any PDF document.",
    accepts: "PDF",
    outputs: "Signed PDF",
    seo: {
      title: "Sign PDF Online Free — Add Signature to PDF",
      description: "Sign PDF documents online for free. Draw, type, or upload your signature and place it anywhere on the PDF. Legally binding e-signature.",
      keywords: ["sign pdf", "pdf signature", "esign pdf", "digital signature pdf", "sign pdf online free"],
      article: {
        intro: "Add your signature to any PDF document without printing. Draw with your mouse or finger, type your name in a handwriting font, or upload an image of your signature.",
        howTo: ["Upload the PDF you need to sign.", "Draw, type or upload your signature.", "Place the signature on the correct field.", "Download the signed PDF."],
        benefits: [
          { heading: "Multiple Signature Methods", body: "Draw, type, or upload an image — choose whatever works best for you." },
          { heading: "Legally Binding", body: "Electronic signatures are legally recognised in most countries." },
          { heading: "No Account Required", body: "Sign documents instantly without creating an account." },
          { heading: "Works Anywhere", body: "Sign contracts, agreements and forms from any device." },
        ],
        faqs: [
          { q: "Is an e-signature legally valid?", a: "Yes, e-signatures are recognised under laws like ESIGN (USA) and eIDAS (EU)." },
          { q: "Can I sign multiple pages?", a: "Yes, apply your signature to any or all pages." },
        ],
      },
    },
  },

  // Create PDF
  {
    slug: "create-pdf",
    name: "Create PDF",
    category: "PDF Tools",
    icon: FilePlus,
    blurb: "Build a PDF from scratch by typing content, adding images, and formatting text.",
    accepts: "Text, Images",
    outputs: "PDF",
    seo: {
      title: "Create PDF Online Free — Build a New PDF Document",
      description: "Create a new PDF document from scratch online for free. Add text, images, and formatting. Download instantly as a PDF file.",
      keywords: ["create pdf", "make pdf", "pdf creator online", "new pdf document", "build pdf"],
      article: {
        intro: "Create a professional PDF document from scratch without any software. Add text with full formatting control, insert images, and structure your content before downloading as a PDF.",
        howTo: ["Open the PDF creator.", "Add text, images, and layout elements.", "Format and style your content.", "Click Create PDF and download."],
        benefits: [
          { heading: "Start From Blank", body: "Build any document from scratch with full creative control." },
          { heading: "Rich Formatting", body: "Control font, size, alignment, colours and spacing." },
          { heading: "Add Images", body: "Insert photos and graphics anywhere in the document." },
          { heading: "Instant Download", body: "Download your new PDF in seconds." },
        ],
        faqs: [
          { q: "Can I choose the page size?", a: "Yes, choose A4, Letter, Legal and more." },
          { q: "Can I add multiple pages?", a: "Yes, you can add as many pages as you need." },
        ],
      },
    },
  },

  // PDF Converter
  {
    slug: "pdf-converter",
    name: "PDF Converter",
    category: "PDF Tools",
    icon: ArrowLeftRight,
    blurb: "Convert PDF to Word, Excel, PowerPoint, images and many other formats.",
    accepts: "PDF",
    outputs: "Various formats",
    seo: {
      title: "PDF Converter Online Free — Convert PDF to Word, Excel, JPG",
      description: "Convert PDF files to Word, Excel, PowerPoint, JPG, PNG and more. Free online PDF converter. No installation, no account required.",
      keywords: ["pdf converter", "convert pdf online", "pdf to word converter", "pdf to excel", "pdf to jpg"],
      article: {
        intro: "Our PDF converter supports conversion to and from dozens of formats. Whether you need to edit a PDF in Word, analyse data in Excel, or share pages as images, we have you covered.",
        howTo: ["Upload your PDF.", "Choose the output format.", "Click Convert.", "Download the converted file."],
        benefits: [
          { heading: "Dozens of Formats", body: "Convert to Word, Excel, PowerPoint, images, HTML, and more." },
          { heading: "High Fidelity", body: "Formatting, tables, and images are preserved in converted files." },
          { heading: "Fast Conversion", body: "Most files convert in under 10 seconds." },
          { heading: "Free to Use", body: "No subscription needed for standard conversions." },
        ],
        faqs: [
          { q: "Does the converted Word file keep formatting?", a: "Yes, fonts, tables and layout are preserved as closely as possible." },
          { q: "Can I convert scanned PDFs?", a: "Yes, our OCR engine extracts text from scanned documents." },
        ],
      },
    },
  },

  // Images to PDF
  {
    slug: "images-to-pdf",
    name: "Images to PDF",
    category: "PDF Tools",
    icon: Images,
    tag: "Popular",
    blurb: "Convert JPG, PNG, WEBP and other images into a single multi-page PDF.",
    accepts: "JPG, PNG, WEBP, HEIC, SVG, TIFF",
    outputs: "PDF",
    seo: {
      title: "Images to PDF Online Free — Convert JPG, PNG to PDF",
      description: "Convert multiple images to a single PDF document online for free. Supports JPG, PNG, WEBP, HEIC, TIFF. Drag to reorder, instant download.",
      keywords: ["images to pdf", "jpg to pdf", "png to pdf", "convert image to pdf", "photos to pdf"],
      article: {
        intro: "Turn any collection of images into a polished PDF document. Upload multiple photos, reorder them, and download a single PDF — great for scanning documents, portfolios, and photo albums.",
        howTo: ["Upload your images.", "Reorder them by dragging.", "Choose page size and orientation.", "Click Convert to PDF and download."],
        benefits: [
          { heading: "Multi-Image Support", body: "Combine unlimited images into one PDF." },
          { heading: "Multiple Formats", body: "JPG, PNG, WEBP, HEIC, TIFF and SVG all supported." },
          { heading: "Page Control", body: "Choose A4, Letter, or fit image to page." },
          { heading: "No Watermarks", body: "Clean, professional output with no added branding." },
        ],
        faqs: [
          { q: "How many images can I convert?", a: "You can convert as many images as needed." },
          { q: "Can I control the order of images?", a: "Yes, drag and drop to reorder before converting." },
        ],
      },
    },
  },

  // PDF to Images
  {
    slug: "pdf-to-images",
    name: "PDF to Images",
    category: "PDF Tools",
    icon: FileImage,
    tag: "Popular",
    blurb: "Convert every PDF page into high-resolution JPG, PNG or WEBP images.",
    accepts: "PDF",
    outputs: "JPG, PNG, WEBP",
    seo: {
      title: "PDF to Images Online Free — Convert PDF Pages to JPG, PNG",
      description: "Convert PDF pages to high-resolution images online for free. Export every page as JPG, PNG or WEBP. No account, instant download.",
      keywords: ["pdf to images", "pdf to jpg", "pdf to png", "convert pdf to image", "pdf page to image"],
      article: {
        intro: "Extract every page of a PDF as a high-quality image file. Ideal for creating thumbnails, sharing specific pages, or preparing content for web or social media.",
        howTo: ["Upload your PDF.", "Select image format (JPG, PNG, WEBP).", "Choose resolution.", "Download all pages as images."],
        benefits: [
          { heading: "High Resolution", body: "Export at 150, 300 or 600 DPI for crisp, print-ready images." },
          { heading: "All Pages at Once", body: "Convert the entire document in one click." },
          { heading: "Multiple Formats", body: "Choose JPG for small size, PNG for transparency, or WEBP for web." },
          { heading: "Fast & Free", body: "Instant conversion with no account required." },
        ],
        faqs: [
          { q: "What resolution are the output images?", a: "You can choose from 72, 150, 300 and 600 DPI." },
          { q: "Can I convert only specific pages?", a: "Yes, select a page range before converting." },
        ],
      },
    },
  },

  // Create PDF with Camera
  {
    slug: "create-pdf-camera",
    name: "Create PDF with Camera",
    category: "PDF Tools",
    icon: Camera,
    blurb: "Capture documents with your camera and instantly convert them into a clean PDF.",
    accepts: "Camera / Image",
    outputs: "PDF",
    seo: {
      title: "Create PDF with Camera Online Free — Scan Document to PDF",
      description: "Use your device camera to scan documents and convert them to PDF online for free. Instant scanning, perspective correction, clean output.",
      keywords: ["scan document to pdf", "camera to pdf", "scan pdf", "document scanner online", "create pdf from camera"],
      article: {
        intro: "Turn your device into a portable document scanner. Capture pages with your camera and instantly get a clean, aligned PDF — great for contracts, receipts, and notes.",
        howTo: ["Allow camera access.", "Point at the document.", "Capture and crop.", "Download as PDF."],
        benefits: [
          { heading: "Instant Scanning", body: "Scan and convert in seconds without any hardware scanner." },
          { heading: "Perspective Correction", body: "Automatic edge detection straightens skewed pages." },
          { heading: "Multi-Page", body: "Scan multiple pages into one PDF document." },
          { heading: "Works on Mobile", body: "Optimised for use on smartphones and tablets." },
        ],
        faqs: [
          { q: "Does it work on iPhone?", a: "Yes, it works on any device with a camera and a modern browser." },
          { q: "Is image enhancement applied?", a: "Yes, automatic contrast and sharpness is applied for clean scans." },
        ],
      },
    },
  },

  // Webpage to PDF
  {
    slug: "webpage-to-pdf",
    name: "Webpage to PDF",
    category: "PDF Tools",
    icon: Globe,
    blurb: "Convert any URL or webpage into a well-formatted, printable PDF document.",
    accepts: "URL",
    outputs: "PDF",
    seo: {
      title: "Webpage to PDF Online Free — Convert URL to PDF",
      description: "Convert any webpage or URL to a PDF online for free. Capture full page, articles, or custom sections as a PDF document.",
      keywords: ["webpage to pdf", "url to pdf", "website to pdf", "convert website to pdf", "save webpage as pdf"],
      article: {
        intro: "Save any webpage as a PDF for offline reading, archiving, or sharing. Paste a URL and get a print-ready PDF with full formatting in seconds.",
        howTo: ["Enter the URL of the webpage.", "Choose full page or article mode.", "Click Convert.", "Download the PDF."],
        benefits: [
          { heading: "Full Page Capture", body: "Capture the entire page scroll, not just the visible area." },
          { heading: "Article Mode", body: "Extract only the main article content without ads or nav." },
          { heading: "Instant Conversion", body: "Most pages render in under 15 seconds." },
          { heading: "Offline Reading", body: "Save any web content for reading without internet." },
        ],
        faqs: [
          { q: "Will JavaScript-rendered content be captured?", a: "Yes, the page is fully rendered before capture." },
          { q: "Can I convert login-protected pages?", a: "Only publicly accessible pages can be converted." },
        ],
      },
    },
  },

  // Create Fillable PDF Form
  {
    slug: "create-fillable-pdf",
    name: "Create Fillable PDF Form",
    category: "PDF Tools",
    icon: ClipboardList,
    blurb: "Design interactive PDF forms with text fields, checkboxes, and dropdowns.",
    accepts: "PDF or blank",
    outputs: "Fillable PDF",
    seo: {
      title: "Create Fillable PDF Form Online Free — Interactive PDF Builder",
      description: "Create fillable PDF forms online for free. Add text fields, checkboxes, radio buttons, and dropdowns to any PDF or start from scratch.",
      keywords: ["fillable pdf form", "create pdf form", "interactive pdf", "pdf form builder", "editable pdf form"],
      article: {
        intro: "Turn any static PDF into an interactive form with fields that recipients can fill in digitally. Add text fields, checkboxes, dropdowns and signature fields with ease.",
        howTo: ["Upload a PDF or start blank.", "Drag form fields onto the page.", "Configure field types and labels.", "Download the fillable PDF."],
        benefits: [
          { heading: "Full Form Controls", body: "Text, checkbox, radio, dropdown, date picker and signature fields." },
          { heading: "No Software Needed", body: "Build professional forms entirely in your browser." },
          { heading: "Works in Any PDF Reader", body: "Output is compatible with Adobe Reader and all major PDF viewers." },
          { heading: "Save Time", body: "Eliminate manual paper-based form data collection." },
        ],
        faqs: [
          { q: "Can I overlay fields on an existing PDF?", a: "Yes, upload any PDF and add fields on top of existing content." },
          { q: "Are responses saved?", a: "Filled forms can be saved and submitted by recipients." },
        ],
      },
    },
  },

  // Create PDF Job Application
  {
    slug: "pdf-job-application",
    name: "Create PDF Job Application",
    category: "PDF Tools",
    icon: Briefcase,
    blurb: "Generate a professional job application form as a fillable PDF in minutes.",
    accepts: "Form input",
    outputs: "PDF Job Application",
    seo: {
      title: "Create PDF Job Application Online Free — Job Application Form",
      description: "Create a professional job application form PDF online for free. Customise fields, branding and layout. Instant download.",
      keywords: ["pdf job application", "job application form pdf", "employment application pdf", "job application creator"],
      article: {
        intro: "Generate a polished, professional job application form as a PDF. Add your company logo, customise fields, and produce a document ready to share with candidates.",
        howTo: ["Choose a template.", "Add your company name and logo.", "Customise the fields.", "Download the PDF."],
        benefits: [
          { heading: "Professional Templates", body: "Ready-made templates designed to impress." },
          { heading: "Fully Customisable", body: "Add, remove or rename any field." },
          { heading: "Brand Ready", body: "Add your logo and company colours." },
          { heading: "Fillable Output", body: "Applicants can fill the form digitally." },
        ],
        faqs: [
          { q: "Can I add my company logo?", a: "Yes, upload your logo and it will appear on every page." },
          { q: "Is the output fillable?", a: "Yes, the form contains interactive fields." },
        ],
      },
    },
  },

  // Generate QR Code
  {
    slug: "generate-qr-code",
    name: "Generate QR Code",
    category: "PDF Tools",
    icon: QrCode,
    blurb: "Create a custom QR code for URLs, text, vCards, or Wi-Fi — embed in PDFs instantly.",
    accepts: "URL / Text",
    outputs: "QR Code PNG / PDF",
    seo: {
      title: "Generate QR Code Online Free — Custom QR Code Maker",
      description: "Generate custom QR codes for URLs, text, email, Wi-Fi and vCards online for free. Download as PNG or embed in a PDF.",
      keywords: ["qr code generator", "create qr code", "qr code maker online", "free qr code", "qr code pdf"],
      article: {
        intro: "Generate QR codes for any URL, contact card, Wi-Fi network, or plain text. Customise the colour and embed the QR code directly into a PDF document.",
        howTo: ["Enter your URL or text.", "Customise colour and size.", "Click Generate QR Code.", "Download as PNG or PDF."],
        benefits: [
          { heading: "Multiple QR Types", body: "URL, email, phone, Wi-Fi, vCard and plain text." },
          { heading: "Custom Colours", body: "Match QR code colours to your brand." },
          { heading: "High Resolution", body: "Download crisp, print-ready QR codes." },
          { heading: "PDF Embed", body: "Embed the QR code directly into a PDF file." },
        ],
        faqs: [
          { q: "Can I add a logo inside the QR code?", a: "Yes, upload a logo to embed it in the centre." },
          { q: "How large can the QR code be?", a: "Up to 2048×2048 pixels for print quality." },
        ],
      },
    },
  },

  // Create Invoice
  {
    slug: "create-invoice",
    name: "Create Invoice",
    category: "PDF Tools",
    icon: Receipt,
    blurb: "Build a professional invoice PDF with itemised billing, tax, and your branding.",
    accepts: "Form input",
    outputs: "Invoice PDF",
    seo: {
      title: "Create Invoice Online Free — PDF Invoice Generator",
      description: "Create professional invoices as PDF online for free. Add items, tax, logo, and payment details. Download and send instantly.",
      keywords: ["create invoice", "invoice generator", "pdf invoice", "free invoice maker", "invoice creator"],
      article: {
        intro: "Create polished, professional invoices in seconds. Add your business details, line items, tax rates and payment terms, then download a print-ready PDF invoice.",
        howTo: ["Enter your business and client details.", "Add line items and amounts.", "Set tax rate and due date.", "Download the invoice PDF."],
        benefits: [
          { heading: "Professional Design", body: "Crisp, branded invoice templates that impress clients." },
          { heading: "Tax Calculation", body: "Automatic VAT and tax calculation." },
          { heading: "Logo Support", body: "Add your business logo for a branded look." },
          { heading: "Instant PDF", body: "Download a ready-to-send invoice immediately." },
        ],
        faqs: [
          { q: "Can I save invoices for later?", a: "Yes, invoices can be saved locally or re-generated from your data." },
          { q: "Are multiple currencies supported?", a: "Yes, choose from all major world currencies." },
        ],
      },
    },
  },

  // Create Electronic Invoice
  {
    slug: "create-electronic-invoice",
    name: "Create Electronic Invoice",
    category: "PDF Tools",
    icon: CreditCard,
    blurb: "Generate e-invoices compliant with XML and electronic billing standards.",
    accepts: "Form input",
    outputs: "E-Invoice XML / PDF",
    seo: {
      title: "Create Electronic Invoice Online Free — E-Invoice Generator",
      description: "Create e-invoices online for free. Generate XML electronic invoices compliant with EU and international e-invoicing standards.",
      keywords: ["electronic invoice", "e-invoice generator", "xml invoice", "digital invoice", "eu einvoice"],
      article: {
        intro: "Generate structured electronic invoices in XML format compliant with major e-invoicing standards. Ideal for B2B billing, EU compliance, and accounting system integration.",
        howTo: ["Enter billing details.", "Add line items and VAT.", "Choose e-invoice standard.", "Download XML and PDF."],
        benefits: [
          { heading: "Standards Compliant", body: "Supports UBL, CII, and Factur-X formats." },
          { heading: "Dual Output", body: "Download both human-readable PDF and machine-readable XML." },
          { heading: "VAT Ready", body: "Automatic VAT calculation per line item." },
          { heading: "Accounting Integration", body: "XML output imports directly into accounting software." },
        ],
        faqs: [
          { q: "What e-invoice formats are supported?", a: "UBL 2.1, Cross Industry Invoice (CII), and Factur-X." },
          { q: "Is it compliant with EU regulations?", a: "Yes, fully compliant with EN 16931." },
        ],
      },
    },
  },

  // Annotate PDF
  {
    slug: "annotate-pdf",
    name: "Annotate PDF",
    category: "PDF Tools",
    icon: Stamp,
    blurb: "Highlight text, add comments, sticky notes, and shapes to any PDF.",
    accepts: "PDF",
    outputs: "Annotated PDF",
    seo: {
      title: "Annotate PDF Online Free — Highlight, Comment & Mark Up PDFs",
      description: "Annotate PDF documents online for free. Add highlights, sticky notes, comments, underlines, and shapes. Download instantly.",
      keywords: ["annotate pdf", "pdf annotation", "highlight pdf", "comment on pdf", "mark up pdf"],
      article: {
        intro: "Mark up PDF documents with a full suite of annotation tools. Highlight text, add sticky notes, draw shapes, underline passages, and leave comments for colleagues or clients.",
        howTo: ["Upload your PDF.", "Choose an annotation tool from the toolbar.", "Apply highlights, notes or shapes.", "Download the annotated PDF."],
        benefits: [
          { heading: "Rich Annotation Set", body: "Highlights, underlines, strikethroughs, sticky notes, and shapes." },
          { heading: "Colour Coding", body: "Use multiple colours to organise your annotations." },
          { heading: "Comment Threads", body: "Add text comments that reviewers can reply to." },
          { heading: "Preserved Original", body: "All annotations are added as a layer without modifying the original." },
        ],
        faqs: [
          { q: "Can other people see my annotations?", a: "Yes, annotations are embedded in the PDF and visible in any PDF reader." },
          { q: "Can I remove annotations later?", a: "Yes, re-open the PDF and delete or modify any annotation." },
        ],
      },
    },
  },

  // Fill out PDF
  {
    slug: "fill-pdf",
    name: "Fill out PDF",
    category: "PDF Tools",
    icon: FileText,
    blurb: "Fill in any PDF form fields directly in your browser and download the completed form.",
    accepts: "PDF with form fields",
    outputs: "Filled PDF",
    seo: {
      title: "Fill out PDF Online Free — Fill PDF Forms in Browser",
      description: "Fill in PDF form fields online for free. Type into text fields, check boxes, and select dropdowns. Download the completed PDF instantly.",
      keywords: ["fill pdf form", "fill out pdf", "complete pdf form online", "pdf form filler", "fill pdf fields"],
      article: {
        intro: "Complete any PDF form directly in your browser — no printing required. Click any field, type your answer, check boxes, and download the fully completed document.",
        howTo: ["Upload the PDF form.", "Click on fields and fill in your answers.", "Check boxes and select dropdowns as needed.", "Download the completed PDF."],
        benefits: [
          { heading: "Works With Any Form", body: "Compatible with all standard PDF form fields." },
          { heading: "No Printing", body: "Fill forms digitally and submit or email directly." },
          { heading: "Instant Preview", body: "See your answers on the PDF in real time." },
          { heading: "Free to Use", body: "No account or software required." },
        ],
        faqs: [
          { q: "Can I fill forms that don't have interactive fields?", a: "Yes, you can add text over static PDF documents using the Edit PDF tool." },
          { q: "Will my filled data be saved?", a: "Your filled PDF is downloaded so you can save it locally." },
        ],
      },
    },
  },

  // Add Watermark
  {
    slug: "add-watermark-pdf",
    name: "Add Watermark to PDF",
    category: "PDF Tools",
    icon: Layers,
    blurb: "Stamp a custom text or image watermark across every page of a PDF.",
    accepts: "PDF",
    outputs: "Watermarked PDF",
    seo: {
      title: "Add Watermark to PDF Online Free — PDF Watermark Stamp",
      description: "Add text or image watermarks to PDF files online for free. Control opacity, position, rotation and font. Download instantly.",
      keywords: ["add watermark pdf", "pdf watermark", "stamp pdf", "watermark document", "pdf watermark maker"],
      article: {
        intro: "Protect your documents or mark them as confidential, draft, or approved by stamping a watermark across every page. Choose text or image watermarks with full style control.",
        howTo: ["Upload your PDF.", "Enter watermark text or upload an image.", "Adjust opacity, rotation and position.", "Download the watermarked PDF."],
        benefits: [
          { heading: "Text & Image Watermarks", body: "Type any text or upload an image to use as a watermark." },
          { heading: "Full Style Control", body: "Adjust font, size, colour, opacity, and angle." },
          { heading: "All Pages", body: "Watermark is applied to every page automatically." },
          { heading: "Non-Destructive", body: "Original content remains intact beneath the watermark." },
        ],
        faqs: [
          { q: "Can I choose watermark position?", a: "Yes, centre, top-left, diagonal and more options available." },
          { q: "Can I use an image as a watermark?", a: "Yes, upload a PNG or SVG logo to use as a watermark." },
        ],
      },
    },
  },

  // Add Page Numbers
  {
    slug: "add-page-numbers-pdf",
    name: "Add Page Numbers",
    category: "PDF Tools",
    icon: Hash,
    blurb: "Insert page numbers on PDF documents with customisable position, font and format.",
    accepts: "PDF",
    outputs: "PDF with page numbers",
    seo: {
      title: "Add Page Numbers to PDF Online Free — PDF Numbering Tool",
      description: "Add page numbers to PDF documents online for free. Choose position, format, starting number and font. Download instantly.",
      keywords: ["add page numbers pdf", "pdf page numbering", "number pdf pages", "insert page numbers pdf", "pdf footer numbering"],
      article: {
        intro: "Add professional page numbers to your PDF with complete control over format, position, and style. Choose header or footer placement and start from any number.",
        howTo: ["Upload your PDF.", "Choose position (header/footer), alignment, and number format.", "Set starting page number.", "Download the numbered PDF."],
        benefits: [
          { heading: "Flexible Positioning", body: "Header or footer, left, centre or right alignment." },
          { heading: "Custom Formats", body: "Page 1 of N, Roman numerals, custom prefixes." },
          { heading: "Starting Number", body: "Start numbering from any page number." },
          { heading: "Font Control", body: "Choose font family, size and colour." },
        ],
        faqs: [
          { q: "Can I skip the first page (cover)?", a: "Yes, you can set the page numbering to start from page 2." },
          { q: "Can I use Roman numerals?", a: "Yes, Roman numeral and letter formats are supported." },
        ],
      },
    },
  },

  // Crop PDF
  {
    slug: "crop-pdf",
    name: "Crop PDF",
    category: "PDF Tools",
    icon: Crop,
    blurb: "Trim the margins or crop a specific region from every page of a PDF.",
    accepts: "PDF",
    outputs: "Cropped PDF",
    seo: {
      title: "Crop PDF Online Free — Trim PDF Margins",
      description: "Crop PDF pages online for free. Trim white margins, crop to a custom region, or adjust page boundaries. Download instantly.",
      keywords: ["crop pdf", "pdf cropping tool", "trim pdf margins", "crop pdf pages", "pdf page crop"],
      article: {
        intro: "Remove unwanted margins, crop to a content area, or define exact page boundaries for every page in a PDF. Ideal for preparing PDFs for print or digital display.",
        howTo: ["Upload your PDF.", "Draw the crop region on the preview.", "Apply to all pages or selected pages.", "Download the cropped PDF."],
        benefits: [
          { heading: "Visual Crop", body: "Draw the exact crop box on a live preview." },
          { heading: "All Pages", body: "Apply the same crop to every page in one click." },
          { heading: "Margin Trimming", body: "Auto-detect and remove white borders." },
          { heading: "Print Ready", body: "Define bleed, trim and media boxes precisely." },
        ],
        faqs: [
          { q: "Does cropping remove page content permanently?", a: "The content outside the crop box is hidden but not deleted — it can be uncropped later." },
          { q: "Can I set different crops per page?", a: "Yes, apply unique crops to individual pages." },
        ],
      },
    },
  },

  // Rearrange PDF Pages
  {
    slug: "rearrange-pdf-pages",
    name: "Rearrange PDF Pages",
    category: "PDF Tools",
    icon: ArrowLeftRight,
    blurb: "Drag and drop to reorder pages within a PDF before saving.",
    accepts: "PDF",
    outputs: "Reordered PDF",
    seo: {
      title: "Rearrange PDF Pages Online Free — Reorder PDF",
      description: "Reorder pages in a PDF document online for free. Drag and drop thumbnails to rearrange. Download the reorganised PDF instantly.",
      keywords: ["rearrange pdf pages", "reorder pdf", "pdf page organizer", "move pdf pages", "pdf page order"],
      article: {
        intro: "Easily rearrange the page order of any PDF with a simple drag-and-drop interface. See thumbnail previews of every page and reorder them before downloading.",
        howTo: ["Upload your PDF.", "See all pages as thumbnails.", "Drag pages to new positions.", "Download the rearranged PDF."],
        benefits: [
          { heading: "Visual Thumbnails", body: "See each page at a glance before rearranging." },
          { heading: "Drag & Drop", body: "Intuitive reordering with instant preview updates." },
          { heading: "Fast Processing", body: "Large PDFs are reorganised instantly." },
          { heading: "Free to Use", body: "No account or watermarks." },
        ],
        faqs: [
          { q: "Can I also rotate pages while rearranging?", a: "Yes, rotation controls are available per page." },
          { q: "Is there a page limit?", a: "No page limit for rearranging." },
        ],
      },
    },
  },

  // Remove PDF Pages
  {
    slug: "remove-pdf-pages",
    name: "Remove PDF Pages",
    category: "PDF Tools",
    icon: FileX,
    blurb: "Delete individual pages or ranges from a PDF document.",
    accepts: "PDF",
    outputs: "PDF (pages removed)",
    seo: {
      title: "Remove PDF Pages Online Free — Delete Pages from PDF",
      description: "Remove specific pages or page ranges from a PDF online for free. Preview all pages and delete unwanted ones. Download instantly.",
      keywords: ["remove pdf pages", "delete pdf pages", "pdf page remover", "remove page from pdf", "pdf delete page"],
      article: {
        intro: "Delete specific pages from a PDF without affecting the rest of the document. Preview all pages, click to select the ones you want to remove, and download the cleaned-up PDF.",
        howTo: ["Upload your PDF.", "Click pages to mark for deletion.", "Review your selection.", "Download the PDF with pages removed."],
        benefits: [
          { heading: "Page Preview", body: "See every page before deciding what to delete." },
          { heading: "Multi-Page Selection", body: "Remove individual pages or full ranges." },
          { heading: "Instant Result", body: "Processed and downloaded immediately." },
          { heading: "No Quality Loss", body: "Remaining pages are unchanged." },
        ],
        faqs: [
          { q: "Can I undo a page deletion?", a: "Re-upload the original file — the tool does not modify your original." },
          { q: "Can I remove blank pages automatically?", a: "Yes, there is an option to auto-detect and remove blank pages." },
        ],
      },
    },
  },

  // Extract PDF Pages
  {
    slug: "extract-pdf-pages",
    name: "Extract PDF Pages",
    category: "PDF Tools",
    icon: FileOutput,
    blurb: "Pull specific pages out of a PDF and save them as a new document.",
    accepts: "PDF",
    outputs: "Extracted PDF",
    seo: {
      title: "Extract PDF Pages Online Free — Save Pages as New PDF",
      description: "Extract specific pages from a PDF and save them as a new PDF file online for free. Select pages or page ranges, instant download.",
      keywords: ["extract pdf pages", "pdf page extractor", "save pdf pages", "pdf page saver", "extract pages from pdf"],
      article: {
        intro: "Pull out exactly the pages you need from a large PDF. Select individual pages or ranges and download them as a separate PDF file.",
        howTo: ["Upload your PDF.", "Select the pages or ranges to extract.", "Click Extract.", "Download the new PDF."],
        benefits: [
          { heading: "Precise Selection", body: "Pick any combination of individual pages or ranges." },
          { heading: "New File", body: "Original PDF is untouched — extracted pages become a separate document." },
          { heading: "Fast", body: "Extraction happens in seconds regardless of file size." },
          { heading: "Free", body: "No account or subscription required." },
        ],
        faqs: [
          { q: "Can I extract non-consecutive pages?", a: "Yes, select any individual pages in any combination." },
          { q: "Is the original PDF modified?", a: "No, the original remains unchanged." },
        ],
      },
    },
  },

  // Rotate PDF Pages
  {
    slug: "rotate-pdf-pages",
    name: "Rotate PDF Pages",
    category: "PDF Tools",
    icon: RotateCw,
    blurb: "Rotate individual pages or the entire PDF by 90°, 180° or 270°.",
    accepts: "PDF",
    outputs: "Rotated PDF",
    seo: {
      title: "Rotate PDF Pages Online Free — Fix PDF Orientation",
      description: "Rotate PDF pages online for free. Rotate individual pages or all pages by 90, 180 or 270 degrees. Download the corrected PDF instantly.",
      keywords: ["rotate pdf", "pdf rotation", "rotate pdf pages", "fix pdf orientation", "turn pdf"],
      article: {
        intro: "Fix incorrectly oriented pages in a PDF by rotating them 90°, 180° or 270°. Rotate all pages or select specific ones with thumbnail previews.",
        howTo: ["Upload your PDF.", "Select pages to rotate.", "Choose 90°, 180° or 270°.", "Download the corrected PDF."],
        benefits: [
          { heading: "Any Angle", body: "Rotate 90° clockwise, 90° counterclockwise, or 180°." },
          { heading: "Per-Page Control", body: "Rotate individual pages independently." },
          { heading: "All Pages at Once", body: "Apply a rotation to every page in one click." },
          { heading: "No Quality Loss", body: "Rotation does not re-compress or degrade PDF content." },
        ],
        faqs: [
          { q: "Can I rotate only landscape pages?", a: "Yes, there's an option to auto-detect and rotate landscape pages." },
          { q: "Does rotation affect image quality?", a: "No, rotation is lossless." },
        ],
      },
    },
  },

  // Bookmark PDF
  {
    slug: "bookmark-pdf",
    name: "Bookmark PDF",
    category: "PDF Tools",
    icon: BookMarked,
    blurb: "Add clickable bookmarks and a table of contents to long PDF documents.",
    accepts: "PDF",
    outputs: "PDF with bookmarks",
    seo: {
      title: "Bookmark PDF Online Free — Add PDF Bookmarks & Table of Contents",
      description: "Add bookmarks and a clickable table of contents to PDF documents online for free. Navigate large PDFs easily. Download instantly.",
      keywords: ["bookmark pdf", "pdf bookmarks", "pdf table of contents", "add bookmarks to pdf", "pdf navigation"],
      article: {
        intro: "Make long PDF documents easy to navigate by adding bookmarks and an interactive table of contents. Readers can jump to any section with a single click.",
        howTo: ["Upload your PDF.", "Add bookmark titles and link to pages.", "Organise into a hierarchy.", "Download the bookmarked PDF."],
        benefits: [
          { heading: "Clickable Navigation", body: "Jump to any section instantly in any PDF reader." },
          { heading: "Hierarchical Bookmarks", body: "Organise chapters and sub-sections into a tree." },
          { heading: "Auto-Detection", body: "Auto-detect headings to generate bookmarks automatically." },
          { heading: "Professional Output", body: "Bookmarked PDFs look polished and are reader-friendly." },
        ],
        faqs: [
          { q: "Will bookmarks show in Adobe Reader?", a: "Yes, bookmarks are standard PDF features visible in all readers." },
          { q: "Can I import existing bookmarks?", a: "Yes, existing bookmarks are shown and can be edited." },
        ],
      },
    },
  },

  // Extract PDF Images
  {
    slug: "extract-pdf-images",
    name: "Extract PDF Images",
    category: "PDF Tools",
    icon: FileSearch,
    blurb: "Pull all embedded images out of a PDF and download them as separate files.",
    accepts: "PDF",
    outputs: "Images (JPG / PNG)",
    seo: {
      title: "Extract PDF Images Online Free — Save Images from PDF",
      description: "Extract all images embedded in a PDF online for free. Download as JPG or PNG files. No account required.",
      keywords: ["extract images from pdf", "pdf image extractor", "save images from pdf", "pull images from pdf"],
      article: {
        intro: "Extract every image embedded in a PDF and download them as individual high-quality files. No need to take screenshots — get the original image data directly.",
        howTo: ["Upload your PDF.", "Click Extract Images.", "Preview all found images.", "Download as a ZIP file."],
        benefits: [
          { heading: "Original Quality", body: "Extract images at their original embedded resolution." },
          { heading: "Batch Download", body: "Download all images in a single ZIP file." },
          { heading: "Multiple Formats", body: "Choose JPG or PNG output format." },
          { heading: "Fast & Free", body: "No account or software required." },
        ],
        faqs: [
          { q: "Will vector graphics be extracted?", a: "Raster images are extracted. Vectors can be exported as SVG." },
          { q: "What if the images are very small?", a: "All embedded images are extracted regardless of size." },
        ],
      },
    },
  },

  // Web Optimize PDF
  {
    slug: "web-optimize-pdf",
    name: "Web Optimize PDF",
    category: "PDF Tools",
    icon: Zap,
    blurb: "Linearise a PDF for fast web viewing — pages load as they stream, not after full download.",
    accepts: "PDF",
    outputs: "Web-Optimised PDF",
    seo: {
      title: "Web Optimize PDF Online Free — Fast Web View PDF",
      description: "Web optimize (linearize) PDF files for fast browser streaming online for free. Enable Fast Web View so pages load instantly as they download.",
      keywords: ["web optimize pdf", "linearize pdf", "fast web view pdf", "pdf streaming optimization", "pdf web ready"],
      article: {
        intro: "Web-optimised (linearised) PDFs load page-by-page as they download, making them feel instant in a browser. Essential for PDF documents hosted on websites.",
        howTo: ["Upload your PDF.", "Click Web Optimize.", "Download the optimised PDF.", "Host it on your website for instant loading."],
        benefits: [
          { heading: "Instant First Page", body: "The first page appears before the full file downloads." },
          { heading: "Better UX", body: "Visitors don't wait for a large PDF to fully load." },
          { heading: "SEO Friendly", body: "Faster page loads improve Core Web Vitals scores." },
          { heading: "Standard Compatible", body: "Linearised PDFs work in all PDF viewers." },
        ],
        faqs: [
          { q: "What is PDF linearisation?", a: "Linearisation restructures a PDF so the first page can be shown while the rest is still downloading." },
          { q: "Does it reduce file size?", a: "It may slightly reduce size as part of optimisation." },
        ],
      },
    },
  },

  // PDF OCR
  {
    slug: "pdf-ocr",
    name: "PDF OCR",
    category: "PDF Tools",
    icon: ScanText,
    blurb: "Make scanned PDFs searchable and selectable by running OCR on every page.",
    accepts: "PDF (Scanned)",
    outputs: "Searchable PDF",
    seo: {
      title: "PDF OCR Online Free — Make Scanned PDF Searchable",
      description: "Run OCR on scanned PDF documents online for free. Convert image-only PDFs into searchable, selectable text PDFs. Supports 100+ languages.",
      keywords: ["pdf ocr", "ocr pdf online", "make pdf searchable", "scanned pdf to text", "pdf text recognition"],
      article: {
        intro: "Apply Optical Character Recognition (OCR) to scanned PDFs to make text searchable and selectable. Ideal for digitising paper archives, contracts, and reports.",
        howTo: ["Upload your scanned PDF.", "Choose the document language.", "Click Run OCR.", "Download the searchable PDF."],
        benefits: [
          { heading: "100+ Languages", body: "OCR recognises text in over 100 languages." },
          { heading: "Searchable Output", body: "Text becomes selectable and Ctrl+F searchable." },
          { heading: "Preserves Layout", body: "Original page layout and images are preserved." },
          { heading: "High Accuracy", body: "Neural OCR engine achieves 99%+ accuracy on clear documents." },
        ],
        faqs: [
          { q: "Does it work on handwritten text?", a: "It performs best on printed text. Handwriting recognition is limited." },
          { q: "Will the original images be kept?", a: "Yes, the OCR text layer is added behind the original page image." },
        ],
      },
    },
  },

  // Repair PDF
  {
    slug: "repair-pdf",
    name: "Repair PDF",
    category: "PDF Tools",
    icon: Wrench,
    blurb: "Fix corrupted, damaged or broken PDF files that won't open or display correctly.",
    accepts: "PDF (Damaged)",
    outputs: "Repaired PDF",
    seo: {
      title: "Repair PDF Online Free — Fix Corrupted PDF Files",
      description: "Repair damaged or corrupted PDF files online for free. Recover content from broken PDFs that won't open. Fast, no account needed.",
      keywords: ["repair pdf", "fix corrupted pdf", "damaged pdf repair", "pdf recovery", "broken pdf fix"],
      article: {
        intro: "Recover content from PDFs that are corrupted, partially downloaded, or won't open. Our repair tool reconstructs the file structure to restore as much content as possible.",
        howTo: ["Upload the damaged PDF.", "Click Repair PDF.", "Download the recovered PDF.", "Review the restored content."],
        benefits: [
          { heading: "Deep Repair", body: "Reconstructs PDF file structure from partially valid data." },
          { heading: "Content Recovery", body: "Recovers text, images and formatting where possible." },
          { heading: "Fast Processing", body: "Most repairs complete in under 30 seconds." },
          { heading: "Free to Try", body: "No cost to attempt a repair." },
        ],
        faqs: [
          { q: "Can all damaged PDFs be repaired?", a: "Success depends on the severity of damage. Partially corrupted files have the highest recovery rate." },
          { q: "Why is my PDF corrupted?", a: "Common causes are interrupted downloads, file transfer errors, or storage issues." },
        ],
      },
    },
  },

  // Protect PDF
  {
    slug: "protect-pdf",
    name: "Protect PDF",
    category: "PDF Tools",
    icon: Lock,
    blurb: "Password-protect a PDF to restrict opening, printing or copying of content.",
    accepts: "PDF",
    outputs: "Password-protected PDF",
    seo: {
      title: "Protect PDF Online Free — Add Password to PDF",
      description: "Password protect PDF files online for free. Add open password, restrict printing and copying. 256-bit AES encryption. No account needed.",
      keywords: ["protect pdf", "password protect pdf", "encrypt pdf", "pdf password", "secure pdf"],
      article: {
        intro: "Add strong password protection to any PDF to prevent unauthorised access. Set an open password, and optionally restrict printing, copying, and editing.",
        howTo: ["Upload your PDF.", "Set an open password and optional permissions password.", "Choose restrictions.", "Download the protected PDF."],
        benefits: [
          { heading: "256-bit AES Encryption", body: "Industry-standard encryption keeps your documents secure." },
          { heading: "Granular Permissions", body: "Control printing, copying, editing and annotation rights separately." },
          { heading: "Instant Encryption", body: "Files are encrypted and ready to share in seconds." },
          { heading: "Works Everywhere", body: "Protected PDFs open with the password in any PDF reader." },
        ],
        faqs: [
          { q: "What encryption level is used?", a: "256-bit AES, the same standard used by banks." },
          { q: "Can I restrict only printing but allow reading?", a: "Yes, permissions are controlled independently." },
        ],
      },
    },
  },

  // Unlock PDF
  {
    slug: "unlock-pdf",
    name: "Unlock PDF",
    category: "PDF Tools",
    icon: Unlock,
    blurb: "Remove password protection from a PDF you own and have the password for.",
    accepts: "Password-protected PDF",
    outputs: "Unlocked PDF",
    seo: {
      title: "Unlock PDF Online Free — Remove PDF Password",
      description: "Remove password from PDF files online for free. Unlock PDFs you own to enable editing, printing and copying. Instant download.",
      keywords: ["unlock pdf", "remove pdf password", "pdf unlocker", "decrypt pdf", "pdf password remover"],
      article: {
        intro: "Remove the password from a PDF file you own. Enter the current password to unlock the document and download a version without any restrictions.",
        howTo: ["Upload your password-protected PDF.", "Enter the current password.", "Click Unlock PDF.", "Download the unlocked PDF."],
        benefits: [
          { heading: "Instant Unlocking", body: "Remove restrictions in seconds." },
          { heading: "Full Access Restored", body: "Re-enable printing, copying and editing." },
          { heading: "Secure Processing", body: "Files are processed and deleted immediately after." },
          { heading: "Free to Use", body: "No subscription required." },
        ],
        faqs: [
          { q: "Can I unlock a PDF without the password?", a: "No — you must provide the correct password. We cannot bypass encryption." },
          { q: "Will the unlocked PDF have any watermark?", a: "No watermarks are added." },
        ],
      },
    },
  },

  // Redact PDF
  {
    slug: "redact-pdf",
    name: "Redact PDF",
    category: "PDF Tools",
    icon: ShieldOff,
    blurb: "Permanently black out sensitive text and images from a PDF so they cannot be recovered.",
    accepts: "PDF",
    outputs: "Redacted PDF",
    seo: {
      title: "Redact PDF Online Free — Permanently Remove Sensitive Information",
      description: "Redact sensitive text and images from PDF documents online for free. Permanent, unrecoverable redaction. Download instantly.",
      keywords: ["redact pdf", "pdf redaction", "black out pdf text", "remove sensitive info pdf", "pdf censoring"],
      article: {
        intro: "Permanently remove sensitive information from PDFs before sharing. Select text or draw boxes over areas to redact — the content is irreversibly deleted, not just covered.",
        howTo: ["Upload your PDF.", "Highlight or draw over sensitive areas.", "Click Apply Redaction.", "Download the permanently redacted PDF."],
        benefits: [
          { heading: "Permanent Removal", body: "Content is deleted from the PDF, not just visually covered." },
          { heading: "Search & Redact", body: "Find all instances of specific text and redact them at once." },
          { heading: "Legal Compliance", body: "Meets GDPR, HIPAA and FOIA redaction requirements." },
          { heading: "Verified", body: "Redacted areas cannot be recovered even with PDF editors." },
        ],
        faqs: [
          { q: "Is the redaction really permanent?", a: "Yes, the underlying content is deleted, not just covered with a black box." },
          { q: "Can I redact images?", a: "Yes, draw a redaction box over any image area." },
        ],
      },
    },
  },

  // Compare PDFs
  {
    slug: "compare-pdfs",
    name: "Compare PDFs",
    category: "PDF Tools",
    icon: GitCompare,
    blurb: "Side-by-side comparison of two PDF versions highlighting all differences.",
    accepts: "2 × PDF",
    outputs: "Comparison report",
    seo: {
      title: "Compare PDFs Online Free — Find Differences Between PDF Documents",
      description: "Compare two PDF files online for free. Highlight differences in text, images and layout side-by-side. Download a comparison report.",
      keywords: ["compare pdf", "pdf comparison tool", "diff pdf", "find differences in pdf", "pdf vs pdf"],
      article: {
        intro: "Spot every change between two versions of a document. Our tool highlights added, removed and modified text and images side-by-side, saving hours of manual review.",
        howTo: ["Upload the original PDF.", "Upload the revised PDF.", "Click Compare.", "Review highlighted differences and download the report."],
        benefits: [
          { heading: "Text-Level Diff", body: "Every word change is highlighted in red (removed) and green (added)." },
          { heading: "Visual Layout Diff", body: "Detects moved images and shifted elements." },
          { heading: "Side-by-Side View", body: "Original and revised documents displayed simultaneously." },
          { heading: "Comparison Report", body: "Download a summary of all changes." },
        ],
        faqs: [
          { q: "Does it work on scanned PDFs?", a: "Yes, OCR is applied to scanned PDFs before comparison." },
          { q: "Can I compare only specific pages?", a: "Yes, select page ranges for both documents." },
        ],
      },
    },
  },

  // PDF to Word
  {
    slug: "pdf-to-word",
    name: "PDF to Word",
    category: "PDF Tools",
    icon: FileType2,
    tag: "Popular",
    blurb: "Convert PDF documents to editable Word (.docx) files while preserving formatting.",
    accepts: "PDF",
    outputs: "DOCX",
    seo: {
      title: "PDF to Word Online Free — Convert PDF to Editable DOCX",
      description: "Convert PDF to Word (.docx) online for free. Preserve fonts, tables, images and layout. Edit the converted document in Microsoft Word.",
      keywords: ["pdf to word", "pdf to docx", "convert pdf to word", "pdf word converter", "editable word from pdf"],
      article: {
        intro: "Convert any PDF to an editable Microsoft Word document without re-typing. Fonts, tables, columns and images are preserved in the converted DOCX file.",
        howTo: ["Upload your PDF.", "Click Convert to Word.", "Download the DOCX file.", "Open and edit in Microsoft Word."],
        benefits: [
          { heading: "Layout Preserved", body: "Tables, columns, fonts and images carry over to Word." },
          { heading: "Editable Output", body: "Full Word document ready for editing and reformatting." },
          { heading: "OCR Included", body: "Scanned PDFs are OCR'd automatically before conversion." },
          { heading: "Fast", body: "Most PDFs convert in under 10 seconds." },
        ],
        faqs: [
          { q: "Does it work on scanned PDFs?", a: "Yes, OCR is applied automatically for scanned documents." },
          { q: "Will tables be preserved?", a: "Yes, tables are converted to native Word tables." },
        ],
      },
    },
  },

  // PDF to Excel
  {
    slug: "pdf-to-excel",
    name: "PDF to Excel",
    category: "PDF Tools",
    icon: FileSpreadsheet,
    tag: "Popular",
    blurb: "Extract tables from PDFs into editable Excel spreadsheets with data intact.",
    accepts: "PDF",
    outputs: "XLSX",
    seo: {
      title: "PDF to Excel Online Free — Convert PDF Tables to Spreadsheet",
      description: "Convert PDF to Excel (.xlsx) online for free. Extract tables and data from PDFs into editable spreadsheets. No account needed.",
      keywords: ["pdf to excel", "pdf to xlsx", "pdf table extractor", "convert pdf spreadsheet", "pdf data to excel"],
      article: {
        intro: "Extract data tables from any PDF and open them in Excel or Google Sheets for editing, analysis and calculations. All rows and columns are preserved in the output XLSX.",
        howTo: ["Upload your PDF.", "Click Convert to Excel.", "Download the XLSX file.", "Open in Microsoft Excel or Google Sheets."],
        benefits: [
          { heading: "Table Detection", body: "Automatically detects and extracts all tables." },
          { heading: "Multiple Tables", body: "Each table is placed on its own sheet." },
          { heading: "Data Integrity", body: "Cell values, merged cells and formatting preserved." },
          { heading: "No Re-Typing", body: "Save hours of manual data entry." },
        ],
        faqs: [
          { q: "What if the PDF has multiple tables per page?", a: "All tables on every page are detected and extracted." },
          { q: "Can it extract data from scanned PDFs?", a: "Yes, OCR is applied to extract table data from scanned documents." },
        ],
      },
    },
  },

  // PDF to PowerPoint
  {
    slug: "pdf-to-powerpoint",
    name: "PDF to PowerPoint",
    category: "PDF Tools",
    icon: Presentation,
    blurb: "Convert PDF slides into editable PowerPoint (.pptx) presentations.",
    accepts: "PDF",
    outputs: "PPTX",
    seo: {
      title: "PDF to PowerPoint Online Free — Convert PDF to PPTX",
      description: "Convert PDF files to PowerPoint presentations online for free. Each page becomes an editable slide. Download as PPTX.",
      keywords: ["pdf to powerpoint", "pdf to pptx", "convert pdf to presentation", "pdf slides to ppt"],
      article: {
        intro: "Convert each page of a PDF into an editable PowerPoint slide. Perfect for editing presentations that were exported as PDFs or sharing slides in a more accessible format.",
        howTo: ["Upload your PDF.", "Click Convert to PowerPoint.", "Download the PPTX file.", "Open and edit in PowerPoint."],
        benefits: [
          { heading: "Editable Slides", body: "Each PDF page becomes a fully editable slide." },
          { heading: "Image & Text Preserved", body: "Images, text boxes and layout are carried over." },
          { heading: "Instant Conversion", body: "Get your PPTX file in seconds." },
          { heading: "Free", body: "No account or subscription needed." },
        ],
        faqs: [
          { q: "Can I edit text after conversion?", a: "Yes, text is fully editable in the resulting PPTX." },
          { q: "Does it support multi-page PDFs?", a: "Yes, every page becomes a separate slide." },
        ],
      },
    },
  },

  // Word to PDF
  {
    slug: "word-to-pdf",
    name: "Word to PDF",
    category: "PDF Tools",
    icon: FileDown,
    tag: "Popular",
    blurb: "Convert Word (.docx/.doc) documents to PDF with perfect formatting fidelity.",
    accepts: "DOCX, DOC",
    outputs: "PDF",
    seo: {
      title: "Word to PDF Online Free — Convert DOCX to PDF",
      description: "Convert Word documents to PDF online for free. DOCX, DOC to PDF with perfect formatting. No account or software required.",
      keywords: ["word to pdf", "docx to pdf", "doc to pdf", "convert word to pdf", "microsoft word pdf"],
      article: {
        intro: "Convert Word documents to universally compatible PDF files that look identical on any device or OS. Perfect for sending documents that must not be modified.",
        howTo: ["Upload your Word file (.docx or .doc).", "Click Convert to PDF.", "Download the PDF.", "Share with confidence."],
        benefits: [
          { heading: "Perfect Fidelity", body: "Fonts, images, tables and formatting are pixel-perfect." },
          { heading: "Universal Compatibility", body: "PDF opens identically on every device." },
          { heading: "Instant", body: "Conversion takes seconds." },
          { heading: "Free", body: "No subscription required." },
        ],
        faqs: [
          { q: "Does it support .doc as well as .docx?", a: "Yes, both legacy .doc and modern .docx formats are supported." },
          { q: "Will my fonts be embedded?", a: "Yes, all fonts are embedded in the output PDF." },
        ],
      },
    },
  },

  // Excel to PDF
  {
    slug: "excel-to-pdf",
    name: "Excel to PDF",
    category: "PDF Tools",
    icon: Table2,
    blurb: "Convert Excel spreadsheets to clean, print-ready PDF documents.",
    accepts: "XLSX, XLS",
    outputs: "PDF",
    seo: {
      title: "Excel to PDF Online Free — Convert Spreadsheet to PDF",
      description: "Convert Excel spreadsheets to PDF online for free. XLSX and XLS to PDF with all cells, charts and formatting preserved.",
      keywords: ["excel to pdf", "xlsx to pdf", "xls to pdf", "spreadsheet to pdf", "convert excel pdf"],
      article: {
        intro: "Convert Excel files to PDF for sharing, printing or archiving. All cell data, charts, and formatting are preserved in the PDF output.",
        howTo: ["Upload your Excel file.", "Choose the sheets to include.", "Click Convert to PDF.", "Download the PDF."],
        benefits: [
          { heading: "All Sheets", body: "Convert single sheets or the entire workbook." },
          { heading: "Charts & Graphs", body: "All charts and visual elements are rendered." },
          { heading: "Print Ready", body: "Page breaks and print areas from Excel are respected." },
          { heading: "Free", body: "No account or software needed." },
        ],
        faqs: [
          { q: "Can I convert specific sheets only?", a: "Yes, choose which sheets to include in the PDF." },
          { q: "Will charts look correct?", a: "Yes, all charts are rendered exactly as in Excel." },
        ],
      },
    },
  },

  // PowerPoint to PDF
  {
    slug: "powerpoint-to-pdf",
    name: "PowerPoint to PDF",
    category: "PDF Tools",
    icon: MonitorPlay,
    blurb: "Convert PowerPoint presentations to PDF — slides become document pages.",
    accepts: "PPTX, PPT",
    outputs: "PDF",
    seo: {
      title: "PowerPoint to PDF Online Free — Convert PPTX to PDF",
      description: "Convert PowerPoint to PDF online for free. PPTX and PPT to PDF with all slides, animations noted and formatting preserved.",
      keywords: ["powerpoint to pdf", "pptx to pdf", "ppt to pdf", "convert presentation to pdf", "slides to pdf"],
      article: {
        intro: "Convert PowerPoint presentations to PDF for universal sharing. Each slide becomes a PDF page with full graphics, fonts, and layout preserved.",
        howTo: ["Upload your PowerPoint file.", "Click Convert to PDF.", "Download the PDF.", "Share with anyone."],
        benefits: [
          { heading: "All Slides", body: "Every slide becomes a page in the PDF." },
          { heading: "Fonts Embedded", body: "All custom fonts are embedded in the PDF." },
          { heading: "No Software", body: "No PowerPoint or Adobe installation needed." },
          { heading: "Instant", body: "Convert in seconds." },
        ],
        faqs: [
          { q: "Will animations be preserved?", a: "Animations are not shown but slides export in their final state." },
          { q: "Does it support .ppt (old format)?", a: "Yes, both .ppt and .pptx are supported." },
        ],
      },
    },
  },

  // PDF to HTML
  {
    slug: "pdf-to-html",
    name: "PDF to HTML",
    category: "PDF Tools",
    icon: Code2,
    blurb: "Convert PDF documents to responsive HTML web pages for online publishing.",
    accepts: "PDF",
    outputs: "HTML",
    seo: {
      title: "PDF to HTML Online Free — Convert PDF to Web Page",
      description: "Convert PDF to HTML online for free. Turn PDF documents into web pages with text, images and layout. Download the HTML file.",
      keywords: ["pdf to html", "pdf to web page", "convert pdf html", "pdf html converter"],
      article: {
        intro: "Convert PDFs to HTML web pages for online publishing. Text, images and layout are converted to HTML and CSS that displays correctly in any browser.",
        howTo: ["Upload your PDF.", "Click Convert to HTML.", "Download the HTML file.", "Host on your website."],
        benefits: [
          { heading: "Web Ready", body: "Output HTML is clean and ready to publish online." },
          { heading: "Responsive", body: "Generated HTML adapts to all screen sizes." },
          { heading: "SEO Friendly", body: "Text is fully indexable by search engines." },
          { heading: "Image Extraction", body: "All images are extracted and linked in the HTML." },
        ],
        faqs: [
          { q: "Is the HTML valid and clean?", a: "Yes, output HTML passes W3C validation." },
          { q: "Are fonts included?", a: "Web-safe font alternatives are used for broad compatibility." },
        ],
      },
    },
  },

  // PDF to Text
  {
    slug: "pdf-to-text",
    name: "PDF to Text",
    category: "PDF Tools",
    icon: FileText,
    blurb: "Extract all text content from a PDF into a clean, editable plain text file.",
    accepts: "PDF",
    outputs: "TXT",
    seo: {
      title: "PDF to Text Online Free — Extract Text from PDF",
      description: "Extract text from PDF files online for free. Convert PDF to plain text (.txt) while preserving reading order. Download instantly.",
      keywords: ["pdf to text", "extract text from pdf", "pdf to txt", "pdf text extractor", "copy text from pdf"],
      article: {
        intro: "Extract all the text from a PDF and save it as a plain text file. Useful for content re-use, data extraction, and preparing text for NLP or analysis.",
        howTo: ["Upload your PDF.", "Click Extract Text.", "Preview the extracted text.", "Download as a .txt file."],
        benefits: [
          { heading: "Full Extraction", body: "All text from every page is extracted." },
          { heading: "Reading Order", body: "Text follows the natural reading order of the document." },
          { heading: "OCR Supported", body: "Scanned PDFs are OCR'd before text extraction." },
          { heading: "Instant Download", body: "Get your .txt file in seconds." },
        ],
        faqs: [
          { q: "Will column text be in the right order?", a: "Yes, we detect columns and preserve left-to-right reading order." },
          { q: "Can I extract text from scanned PDFs?", a: "Yes, OCR is automatically applied to scanned pages." },
        ],
      },
    },
  },

  // PDF to Markdown
  {
    slug: "pdf-to-markdown",
    name: "PDF to Markdown",
    category: "PDF Tools",
    icon: FileCode,
    blurb: "Convert PDF content into clean Markdown for documentation, CMS, or static sites.",
    accepts: "PDF",
    outputs: "Markdown (.md)",
    seo: {
      title: "PDF to Markdown Online Free — Convert PDF to MD",
      description: "Convert PDF documents to Markdown (.md) format online for free. Headings, lists, and tables are converted to Markdown syntax.",
      keywords: ["pdf to markdown", "pdf to md", "convert pdf markdown", "pdf markdown converter"],
      article: {
        intro: "Transform PDF documents into Markdown text for use in documentation systems, static site generators, or content management platforms.",
        howTo: ["Upload your PDF.", "Click Convert to Markdown.", "Preview the Markdown output.", "Download the .md file."],
        benefits: [
          { heading: "Structure Preserved", body: "Headings, lists, and tables become native Markdown." },
          { heading: "CMS Ready", body: "Use output in Jekyll, Hugo, Ghost, Notion and more." },
          { heading: "Developer Friendly", body: "Clean, minimal Markdown with no junk formatting." },
          { heading: "Free", body: "No account required." },
        ],
        faqs: [
          { q: "Are PDF images included?", a: "Images are referenced as local image links in the Markdown." },
          { q: "Are tables converted to Markdown tables?", a: "Yes, detected tables become Markdown pipe tables." },
        ],
      },
    },
  },

  // PDF to EPUB
  {
    slug: "pdf-to-epub",
    name: "PDF to EPUB",
    category: "PDF Tools",
    icon: BookOpen,
    blurb: "Convert PDF books and documents to EPUB for e-readers and mobile reading.",
    accepts: "PDF",
    outputs: "EPUB",
    seo: {
      title: "PDF to EPUB Online Free — Convert PDF to E-Book",
      description: "Convert PDF documents to EPUB format online for free. Read PDFs on Kindle, Kobo, Apple Books and any e-reader. Download instantly.",
      keywords: ["pdf to epub", "pdf to ebook", "convert pdf epub", "pdf kindle", "pdf ereader"],
      article: {
        intro: "Convert PDFs to EPUB so you can read them comfortably on any e-reader, tablet or phone. Text reflows to fit any screen size, unlike fixed-layout PDFs.",
        howTo: ["Upload your PDF.", "Click Convert to EPUB.", "Download the .epub file.", "Transfer to your e-reader."],
        benefits: [
          { heading: "Reflowable Text", body: "Text adapts to any screen size for comfortable reading." },
          { heading: "E-Reader Compatible", body: "Works on Kindle, Kobo, Apple Books and more." },
          { heading: "Chapters Preserved", body: "PDF headings become EPUB chapters." },
          { heading: "Offline Reading", body: "Read your converted book anywhere." },
        ],
        faqs: [
          { q: "Will images be included in the EPUB?", a: "Yes, all images are embedded in the EPUB file." },
          { q: "Does it work with Kindle?", a: "Yes — transfer the EPUB via Kindle's Send to Kindle feature." },
        ],
      },
    },
  },

  // PDF to PDF/A
  {
    slug: "pdf-to-pdfa",
    name: "PDF to PDF/A",
    category: "PDF Tools",
    icon: Shield,
    blurb: "Convert PDFs to the PDF/A archival format for long-term document preservation.",
    accepts: "PDF",
    outputs: "PDF/A",
    seo: {
      title: "PDF to PDF/A Online Free — Convert to Archival PDF",
      description: "Convert PDF to PDF/A format online for free. PDF/A is ISO-standardised for long-term digital archiving. Supports PDF/A-1b, 2b, and 3b.",
      keywords: ["pdf to pdfa", "pdf archival format", "pdf/a converter", "iso pdf archive", "long term pdf storage"],
      article: {
        intro: "PDF/A is an ISO standard designed to ensure that documents can be reproduced exactly decades from now. Convert any PDF to PDF/A for legal, governmental, or archival use.",
        howTo: ["Upload your PDF.", "Choose the PDF/A version (1b, 2b, 3b).", "Click Convert.", "Download the PDF/A file."],
        benefits: [
          { heading: "ISO Compliant", body: "Meets PDF/A-1b, PDF/A-2b and PDF/A-3b standards." },
          { heading: "Self-Contained", body: "All fonts, colour profiles and metadata are embedded." },
          { heading: "Future Proof", body: "Documents remain readable for 100+ years." },
          { heading: "Legal Compliance", body: "Required by many government and legal archiving standards." },
        ],
        faqs: [
          { q: "What is the difference between PDF/A-1 and PDF/A-2?", a: "PDF/A-2 allows JPEG2000, transparency, and embedded PDF files. PDF/A-3 also allows arbitrary file attachments." },
          { q: "Will my PDF pass a PDF/A validator after conversion?", a: "Yes, output passes veraPDF validation." },
        ],
      },
    },
  },

  // Remove PDF Metadata
  {
    slug: "remove-pdf-metadata",
    name: "Remove PDF Metadata",
    category: "PDF Tools",
    icon: ShieldOff,
    blurb: "Strip all author, software, creation date and custom metadata from a PDF.",
    accepts: "PDF",
    outputs: "Cleaned PDF",
    seo: {
      title: "Remove PDF Metadata Online Free — Strip PDF Information",
      description: "Remove metadata from PDF files online for free. Delete author, creator, creation date and all hidden data before sharing. Download instantly.",
      keywords: ["remove pdf metadata", "strip pdf info", "pdf metadata cleaner", "delete pdf author", "pdf privacy clean"],
      article: {
        intro: "PDFs contain hidden metadata including author name, company, software used, and edit history. Strip this information before sharing sensitive documents.",
        howTo: ["Upload your PDF.", "Click Remove Metadata.", "Download the cleaned PDF.", "Verify metadata is gone."],
        benefits: [
          { heading: "Privacy Protection", body: "Prevents accidental disclosure of personal or company data." },
          { heading: "All Fields Removed", body: "Author, creator, subject, keywords, and XMP data stripped." },
          { heading: "Instant", body: "Metadata is removed in seconds." },
          { heading: "Free", body: "No account required." },
        ],
        faqs: [
          { q: "What metadata fields are removed?", a: "Title, Author, Subject, Keywords, Creator, Producer, Creation Date, Modification Date, and all XMP fields." },
          { q: "Will the PDF content be changed?", a: "No, only metadata is removed. The document content is unchanged." },
        ],
      },
    },
  },


  // Create Invoice Visually
  {
    slug: "create-invoice-visually",
    name: "Create Invoice Visually",
    category: "PDF Tools",
    icon: FormInput,
    blurb: "Design professional PDF invoices visually with live interactive fields and automatic tax/total calculations.",
    accepts: "Visual Builder / Data",
    outputs: "PDF Invoice",
    seo: {
      title: "Create Invoice Visually Online Free — Visual PDF Invoice Maker",
      description: "Build clean, professional PDF invoices visually. Customize your company branding, add line items with tax calculations, and export instantly.",
      keywords: ["create invoice visually","visual invoice maker","free online invoice generator","pdf invoice designer","custom invoice creator"],
      article: {
        intro: "Craft beautiful and compliant PDF invoices directly in your browser with our visual invoice builder. No design experience needed.",
        howTo: ["Enter your business details and logo.","Add client information and invoice terms.","Insert line items, quantities, and tax rates.","Preview visually and download the finished PDF invoice."],
        benefits: [
          {
                    "heading": "Visual Real-Time Preview",
                    "body": "See changes update instantly on a pixel-perfect invoice canvas."
          },
          {
                    "heading": "Automatic Calculations",
                    "body": "Subtotals, discounts, taxes, and grand totals calculate on the fly."
          },
          {
                    "heading": "Brand Customization",
                    "body": "Add company logos, tailored accents, and notes easily."
          },
          {
                    "heading": "Private & Free",
                    "body": "No watermark, no registration, and data stays in your browser."
          }
],
        faqs: [
          {
                    "q": "Can I save my invoice template?",
                    "a": "Yes, you can export and re-open your invoice layout at any time."
          },
          {
                    "q": "Are taxes and discounts supported?",
                    "a": "Yes, multi-item taxes, percentage discounts, and shipping can be applied."
          }
],
      },
    },
  },

  // PDF Invoice to E-Invoice
  {
    slug: "pdf-invoice-to-einvoice",
    name: "PDF Invoice to E-Invoice",
    category: "PDF Tools",
    icon: Receipt,
    blurb: "Extract structured financial data from standard PDF invoices and convert them to compliant electronic XML/UBL e-invoices.",
    accepts: "PDF Invoice",
    outputs: "E-Invoice (XML / UBL)",
    seo: {
      title: "Convert PDF Invoice to E-Invoice Online — XML / UBL / Factur-X",
      description: "Convert standard PDF invoices into electronic XML, UBL 2.1, or Factur-X formats for B2B and tax compliance. Fast, accurate, and free.",
      keywords: ["pdf invoice to e-invoice","convert pdf to xml invoice","ubl invoice converter","factur-x generator","electronic invoice standard"],
      article: {
        intro: "Transform static PDF invoices into machine-readable electronic invoices compliant with European UBL and global e-invoicing mandates.",
        howTo: ["Upload your standard PDF invoice.","Review parsed fields including buyer, seller, and totals.","Select target format (UBL XML, Factur-X, or Peppol).","Download your compliant electronic invoice file."],
        benefits: [
          {
                    "heading": "Global Standard Compliance",
                    "body": "Supports Peppol BIS, UBL 2.1, and Factur-X electronic billing requirements."
          },
          {
                    "heading": "Intelligent Field Extraction",
                    "body": "Accurately identifies invoice numbers, line items, VAT, and totals."
          },
          {
                    "heading": "B2B Ready",
                    "body": "Seamlessly integrate with ERP and accounting software."
          },
          {
                    "heading": "Rapid Processing",
                    "body": "Complete conversion in seconds without manual data entry."
          }
],
        faqs: [
          {
                    "q": "What electronic invoice standards are supported?",
                    "a": "Standard UBL 2.1 XML, Factur-X, and Peppol BIS 3.0."
          },
          {
                    "q": "Can scanned invoices be converted?",
                    "a": "Yes, built-in OCR handles scanned documents and image-based PDFs."
          }
],
      },
    },
  },

  // XML E-Invoice to PDF
  {
    slug: "xml-einvoice-to-pdf",
    name: "XML E-Invoice to PDF",
    category: "PDF Tools",
    icon: FileCheck,
    blurb: "Convert electronic invoice XML files (UBL, Factur-X, ZUGFeRD) into human-readable visual PDF invoices.",
    accepts: "XML / E-Invoice",
    outputs: "Formatted PDF Invoice",
    seo: {
      title: "Convert XML E-Invoice to PDF Online Free — UBL & ZUGFeRD Viewer",
      description: "Easily render electronic XML invoices into readable, printable PDF documents. Supports UBL, ZUGFeRD, and Factur-X with clean layout templates.",
      keywords: ["xml e-invoice to pdf","convert ubl xml to pdf","zugferd to pdf","view xml invoice as pdf","electronic invoice reader"],
      article: {
        intro: "Machine-readable XML invoices can be hard to read. This tool parses UBL and ZUGFeRD data to generate a clean, visual PDF invoice ready to print or share.",
        howTo: ["Upload your XML or e-invoice file.","Choose an invoice visual design template.","Preview parsed line items and totals.","Download your printable visual PDF invoice."],
        benefits: [
          {
                    "heading": "Human-Readable Format",
                    "body": "Turns complex code tags into a clear visual invoice layout."
          },
          {
                    "heading": "Complete Data Display",
                    "body": "Displays tax breakdowns, bank payment details, and terms accurately."
          },
          {
                    "heading": "Print & Archive Ready",
                    "body": "Standard A4 layout ideal for bookkeeping and archiving."
          },
          {
                    "heading": "Instant Client-Side Render",
                    "body": "Files are processed securely and swiftly."
          }
],
        faqs: [
          {
                    "q": "Does this validate the XML schema?",
                    "a": "Yes, it parses and verifies required invoice tags before generating the PDF."
          },
          {
                    "q": "Is ZUGFeRD supported?",
                    "a": "Yes, both standalone XML and hybrid PDF/A-3 ZUGFeRD files are recognized."
          }
],
      },
    },
  },

  // PDF Overlay
  {
    slug: "pdf-overlay",
    name: "PDF Overlay",
    category: "PDF Tools",
    icon: FileStack,
    blurb: "Superimpose one PDF over another to apply letterheads, templates, stamps, or backgrounds.",
    accepts: "Two PDF files",
    outputs: "Combined PDF",
    seo: {
      title: "PDF Overlay Online — Superimpose PDF Pages & Letterheads",
      description: "Overlay one PDF document onto another online for free. Ideal for merging official company letterheads, background grids, or document watermarks.",
      keywords: ["pdf overlay","superimpose pdf","pdf letterhead overlay","merge pdf background","combine pdf layers"],
      article: {
        intro: "PDF Overlay lets you place a foreground PDF directly on top of a background PDF, perfect for applying corporate stationery, borders, or templates.",
        howTo: ["Upload your primary content PDF.","Upload your background or letterhead PDF.","Choose overlay position and layer priority.","Download the merged overlaid PDF."],
        benefits: [
          {
                    "heading": "Corporate Branding",
                    "body": "Apply letterheads and branding across multi-page documents instantly."
          },
          {
                    "heading": "Vector Fidelity",
                    "body": "Preserves vector logos and crisp text without pixelation."
          },
          {
                    "heading": "Multi-Page Support",
                    "body": "Repeat a single-page template over hundreds of pages in one click."
          },
          {
                    "heading": "No Software Needed",
                    "body": "Run entirely in your browser with zero installation."
          }
],
        faqs: [
          {
                    "q": "Does the overlay repeat across all pages?",
                    "a": "Yes, you can choose to apply the overlay to the first page, all pages, or specific ranges."
          },
          {
                    "q": "Will existing links and text be preserved?",
                    "a": "Yes, the vector text stream is preserved while merging the visual layers."
          }
],
      },
    },
  },

  // Change PDF Page Size
  {
    slug: "change-pdf-page-size",
    name: "Change PDF Page Size",
    category: "PDF Tools",
    icon: Maximize2,
    blurb: "Resize PDF document pages to standard formats like A4, Letter, A3, Legal, or custom dimensions.",
    accepts: "PDF",
    outputs: "Resized PDF",
    seo: {
      title: "Change PDF Page Size Online Free — Resize PDF to A4, Letter, A3",
      description: "Change PDF page dimensions online. Resize Letter to A4, A4 to A3, or set custom dimensions with proportional scaling and centering.",
      keywords: ["change pdf page size","resize pdf pages","pdf a4 to letter","resize pdf document","pdf scale page size"],
      article: {
        intro: "Easily adjust the physical page dimensions of any PDF document. Whether standardizing on A4 or fitting Letter paper, adjust sizes in seconds.",
        howTo: ["Upload the PDF document you want to resize.","Select a target standard size (A4, Letter, Legal, A3) or custom dimensions.","Choose scaling mode (fit to page, maintain aspect ratio, or crop).","Download your newly resized PDF."],
        benefits: [
          {
                    "heading": "Standard Print Sizes",
                    "body": "Convert seamlessly between US Letter, ISO A4, Legal, A3, and A5."
          },
          {
                    "heading": "Proportional Scaling",
                    "body": "Prevents distortion by proportionally scaling page contents."
          },
          {
                    "heading": "Batch Resizing",
                    "body": "Resize all pages or specify selected ranges at once."
          },
          {
                    "heading": "High DPI Preservation",
                    "body": "Maintains print-ready resolution and font sharpness."
          }
],
        faqs: [
          {
                    "q": "Will resizing my PDF blur the text?",
                    "a": "No, vector fonts and lines remain crisp at any target dimension."
          },
          {
                    "q": "Can I set custom dimensions?",
                    "a": "Yes, custom widths and heights in millimeters or inches are supported."
          }
],
      },
    },
  },

  // Change PDF Document Information
  {
    slug: "change-pdf-document-info",
    name: "Change PDF Document Information",
    category: "PDF Tools",
    icon: Settings2,
    blurb: "Edit title, author, subject, keywords, creation date, and metadata tags of your PDF document.",
    accepts: "PDF",
    outputs: "Updated PDF",
    seo: {
      title: "Change PDF Document Information & Metadata Online Free",
      description: "Edit PDF properties online: update Title, Author, Subject, Keywords, Creator, and Producer tags. Professional document metadata editor.",
      keywords: ["change pdf document info","edit pdf metadata","modify pdf properties","update pdf author and title","pdf metadata editor"],
      article: {
        intro: "Keep document properties accurate and professional. Update titles, author names, copyright details, and searchable tags directly.",
        howTo: ["Upload your PDF document.","Edit the Title, Author, Subject, and Keywords fields.","Optionally update Producer and Creation dates.","Click Save and download your updated PDF."],
        benefits: [
          {
                    "heading": "Search & SEO Optimization",
                    "body": "Help search engines and document management systems index files correctly."
          },
          {
                    "heading": "Professional Delivery",
                    "body": "Ensure correct author and corporate metadata on published PDFs."
          },
          {
                    "heading": "Quick Metadata Fixes",
                    "body": "Update outdated file descriptions without re-exporting from source apps."
          },
          {
                    "heading": "Secure",
                    "body": "Processed locally without storing personal metadata on external servers."
          }
],
        faqs: [
          {
                    "q": "Can I remove metadata completely?",
                    "a": "Yes, you can clear fields or use our dedicated 'Remove PDF Metadata' tool."
          },
          {
                    "q": "Are custom metadata fields supported?",
                    "a": "Standard PDF Info dictionary fields and common XMP tags are editable."
          }
],
      },
    },
  },

  // Pages per Sheet
  {
    slug: "pages-per-sheet",
    name: "Pages per Sheet",
    category: "PDF Tools",
    icon: LayoutGrid,
    blurb: "Arrange multiple PDF pages onto a single sheet (N-up layout: 2, 4, or 8 pages per sheet).",
    accepts: "PDF",
    outputs: "N-up PDF",
    seo: {
      title: "Pages per Sheet PDF Online Free — N-up PDF Layout Converter",
      description: "Put 2, 4, 8, or 16 PDF pages onto a single sheet online. Save paper and create printable handouts, booklets, and presentation summaries.",
      keywords: ["pages per sheet pdf","n-up pdf","2 pages per sheet pdf","multiple pages on one sheet pdf","pdf handout layout"],
      article: {
        intro: "Combine multiple pages of a PDF document onto a single sheet. Perfect for printing lecture slides, creating handouts, and reducing paper usage.",
        howTo: ["Upload your PDF file.","Choose the number of pages per sheet (2, 4, 8, or 16).","Select page order (horizontal or vertical) and margin spacing.","Download the compact N-up PDF ready for printing."],
        benefits: [
          {
                    "heading": "Save Paper & Printing Costs",
                    "body": "Cut printing volume in half or more by tiling multiple pages."
          },
          {
                    "heading": "Custom Layout Grids",
                    "body": "Choose 2x1, 2x2, 2x4, or 4x4 grids with optional border lines."
          },
          {
                    "heading": "Ideal for Handouts",
                    "body": "Transform slide decks into readable meeting packets."
          },
          {
                    "heading": "Lossless Compression",
                    "body": "Preserves text sharpness and color gradients."
          }
],
        faqs: [
          {
                    "q": "Can I add a border line around each mini-page?",
                    "a": "Yes, you can toggle thin borders around each page."
          },
          {
                    "q": "What paper size is the output?",
                    "a": "You can keep the original sheet size or standardize to A4/Letter."
          }
],
      },
    },
  },

  // Halve PDF Pages
  {
    slug: "halve-pdf-pages",
    name: "Halve PDF Pages",
    category: "PDF Tools",
    icon: Columns,
    blurb: "Split 2-page spreads or book scans horizontally or vertically into separate individual PDF pages.",
    accepts: "PDF",
    outputs: "Split Pages PDF",
    seo: {
      title: "Halve PDF Pages Online Free — Split 2-Page Spreads & Book Scans",
      description: "Split double-page PDF scans into single pages online. Automatically cut 2-page spreads in half vertically or horizontally for easy reading.",
      keywords: ["halve pdf pages","split 2-page spreads","cut pdf pages in half","split scanned book pdf","convert two pages to one pdf"],
      article: {
        intro: "Scanned books and magazines often have two pages per sheet. Halve PDF Pages splits every spread down the center into sequential individual pages.",
        howTo: ["Upload your scanned 2-page spread PDF.","Choose the split direction (vertical for side-by-side, horizontal for top/bottom).","Set page reading order (left-to-right or right-to-left).","Download your sequential single-page PDF."],
        benefits: [
          {
                    "heading": "Perfect for Book Scans",
                    "body": "Converts double-page scans into mobile-friendly e-reading format."
          },
          {
                    "heading": "Automatic Split Line",
                    "body": "Accurately bisects pages right through the binding gutter."
          },
          {
                    "heading": "Reading Direction Control",
                    "body": "Supports standard Left-to-Right and Right-to-Left (e.g. Manga/Hebrew/Arabic)."
          },
          {
                    "heading": "No Re-compression Artifacts",
                    "body": "Keeps the original scan resolution intact."
          }
],
        faqs: [
          {
                    "q": "Will the page count double?",
                    "a": "Yes, each 2-page spread sheet becomes two standalone pages in the correct reading sequence."
          },
          {
                    "q": "Can I preview before splitting?",
                    "a": "Yes, an interactive preview shows where the cut line will be placed."
          }
],
      },
    },
  },

  // Rasterize PDF
  {
    slug: "rasterize-pdf",
    name: "Rasterize PDF",
    category: "PDF Tools",
    icon: Printer,
    blurb: "Convert vector text and layers in a PDF into secure, high-resolution flattened raster images.",
    accepts: "PDF",
    outputs: "Rasterized PDF",
    seo: {
      title: "Rasterize PDF Online Free — Convert PDF Text to Flattened Images",
      description: "Rasterize PDF documents online. Turn text, vectors, and hidden objects into secure, flattened bitmap images to prevent copying and editing.",
      keywords: ["rasterize pdf","flatten pdf to image","convert pdf vectors to bitmap","secure pdf rasterization","prevent text copy pdf"],
      article: {
        intro: "Rasterizing converts every page of a PDF into a high-resolution image layer. This eliminates selectable text and vector shapes, making documents tamper-proof.",
        howTo: ["Upload your vector PDF file.","Select output resolution (150 DPI for web, 300 DPI for print).","Optionally select color mode (color, grayscale, monochrome).","Download your fully rasterized, secure PDF."],
        benefits: [
          {
                    "heading": "Tamper Prevention",
                    "body": "Stops text extraction, editing, and vector reverse engineering."
          },
          {
                    "heading": "Consistent Display",
                    "body": "Looks identical on every printer, operating system, and PDF viewer."
          },
          {
                    "heading": "Strips Hidden Data",
                    "body": "Removes hidden underlying vector paths, comments, and draft layers."
          },
          {
                    "heading": "Custom DPI Selection",
                    "body": "Choose 150, 300, or 600 DPI for optimum quality and file size balance."
          }
],
        faqs: [
          {
                    "q": "Can someone copy text after rasterization?",
                    "a": "No, the text is turned into pixel artwork and cannot be highlighted or selected."
          },
          {
                    "q": "Will the PDF look blurry?",
                    "a": "At 300 DPI, text remains crisp and indistinguishable from vector in standard print."
          }
],
      },
    },
  },

  // Flatten PDF
  {
    slug: "flatten-pdf",
    name: "Flatten PDF",
    category: "PDF Tools",
    icon: Layers,
    blurb: "Merge all form fields, annotations, comments, and layers into an uneditable single background layer.",
    accepts: "PDF",
    outputs: "Flattened PDF",
    seo: {
      title: "Flatten PDF Online Free — Lock Form Fields & Annotations",
      description: "Flatten PDF forms and comments online. Lock fillable form fields, digital signatures, and annotations permanently into the document.",
      keywords: ["flatten pdf","lock pdf form fields","flatten pdf annotations","make pdf uneditable","flatten fillable pdf"],
      article: {
        intro: "Flattening locks all interactive elements—including fillable text fields, checkboxes, stamps, and annotations—into permanent page content.",
        howTo: ["Upload your interactive or annotated PDF.","Click the Flatten PDF button.","Review the flattened preview.","Download your locked, read-only PDF file."],
        benefits: [
          {
                    "heading": "Lock Form Responses",
                    "body": "Ensures filled out contracts and applications cannot be altered."
          },
          {
                    "heading": "Universal Viewer Support",
                    "body": "Fixes missing signature and comment display bugs on older PDF readers."
          },
          {
                    "heading": "Preserves Visual Layout",
                    "body": "All checkmarks, signatures, and notes remain exactly where you placed them."
          },
          {
                    "heading": "Reduces File Errors",
                    "body": "Removes interactive scripts and complex multi-layer form hierarchies."
          }
],
        faqs: [
          {
                    "q": "Can flattened form fields still be edited?",
                    "a": "No, once flattened, all form inputs become static page content."
          },
          {
                    "q": "Is the text still searchable?",
                    "a": "Yes, standard vector text flattening keeps text searchable while locking inputs."
          }
],
      },
    },
  },

  // Generate Password
  {
    slug: "generate-password",
    name: "Generate Password",
    category: "PDF Tools",
    icon: KeyRound,
    blurb: "Generate cryptographically secure, high-entropy passwords to protect your confidential PDF files.",
    accepts: "Configuration",
    outputs: "Secure Password",
    seo: {
      title: "Secure PDF Password Generator — Strong Random Password Tool",
      description: "Generate ultra-secure, cryptographically strong passwords for protecting PDF files and sensitive archives. High entropy with customizable symbols.",
      keywords: ["generate password","pdf password generator","strong random password","secure password maker","high entropy password tool"],
      article: {
        intro: "Protecting confidential PDF files requires high-entropy passwords resilient against brute-force attacks. Generate robust passwords directly in your browser.",
        howTo: ["Choose your preferred password length (12 to 64 characters).","Toggle uppercase, lowercase, numbers, and special symbols.","Click Generate to create a cryptographically secure key.","Copy the password and use it to lock your PDF document."],
        benefits: [
          {
                    "heading": "Cryptographic Entropy",
                    "body": "Uses window.crypto.getRandomValues for true non-deterministic randomness."
          },
          {
                    "heading": "Zero Server Transmission",
                    "body": "Generated 100% on your device—passwords are never sent across the network."
          },
          {
                    "heading": "Brute-Force Immune",
                    "body": "Exceeds standard 128-bit and 256-bit AES cryptographic resistance thresholds."
          },
          {
                    "heading": "One-Click Copy",
                    "body": "Copy directly to clipboard with instant confirmation."
          }
],
        faqs: [
          {
                    "q": "Is this safe to use for sensitive documents?",
                    "a": "Yes, passwords are created entirely client-side using native browser cryptography."
          },
          {
                    "q": "What length is recommended for PDF protection?",
                    "a": "At least 16 to 24 characters containing mixed letters, numbers, and symbols."
          }
],
      },
    },
  },

  // View as PDF
  {
    slug: "view-as-pdf",
    name: "View as PDF",
    category: "PDF Tools",
    icon: Eye,
    blurb: "Preview and inspect any document or image rendered directly inside a clean, high-fidelity PDF viewer.",
    accepts: "PDF / Documents / Images",
    outputs: "PDF Viewer",
    seo: {
      title: "View as PDF Online Free — Fast In-Browser PDF Reader & Viewer",
      description: "Open and view PDF documents online without installing software. Fast page navigation, thumbnail sidebar, high-resolution zoom, and search.",
      keywords: ["view as pdf","online pdf viewer","free pdf reader","in-browser pdf preview","open pdf online"],
      article: {
        intro: "Open, inspect, and read PDF documents directly inside your web browser. Featuring smooth multi-page navigation, zoom, and bookmark support.",
        howTo: ["Upload or drop your PDF document.","Use the toolbar to navigate pages, zoom in/out, or rotate view.","Search for words or phrases across the document.","Read comfortably in single-page, two-page, or continuous mode."],
        benefits: [
          {
                    "heading": "No Downloads Required",
                    "body": "Works instantly on any desktop, tablet, or smartphone browser."
          },
          {
                    "heading": "Fast Rendering",
                    "body": "Powered by modern canvas rendering for smooth 60 FPS scrolling."
          },
          {
                    "heading": "Complete Privacy",
                    "body": "Files are rendered locally without uploading your private pages to cloud storage."
          },
          {
                    "heading": "Feature-Rich Toolbar",
                    "body": "Includes full page zoom, rotation, thumbnails, and text selection."
          }
],
        faqs: [
          {
                    "q": "Can I view password-protected PDFs?",
                    "a": "Yes, you can enter the document password to unlock and read protected files."
          },
          {
                    "q": "Is there a page limit?",
                    "a": "Our optimized reader smoothly handles documents with hundreds of pages."
          }
],
      },
    },
  },

  // Set PDF Viewer Preferences
  {
    slug: "set-pdf-viewer-preferences",
    name: "Set PDF Viewer Preferences",
    category: "PDF Tools",
    icon: Settings2,
    blurb: "Configure default display zoom, page layout, single/facing page view, and toolbar visibility for readers.",
    accepts: "PDF",
    outputs: "Configured PDF",
    seo: {
      title: "Set PDF Viewer Preferences Online Free — Initial View Settings",
      description: "Configure PDF initial view preferences: set default zoom, single or two-page display, hide toolbars, or enable fullscreen mode on open.",
      keywords: ["set pdf viewer preferences","pdf initial view settings","configure pdf default zoom","pdf two page view default","pdf display preferences"],
      article: {
        intro: "Control how your PDF appears when opened in Adobe Acrobat or browser viewers. Specify default zoom level, page spread layout, and UI visibility.",
        howTo: ["Upload your PDF document.","Choose Initial View options: Page Only, Bookmarks Panel, or Thumbnails.","Set default page layout (Single Page, Two Pages, Continuous).","Save and download your configured PDF."],
        benefits: [
          {
                    "heading": "Optimal First Impression",
                    "body": "Ensure recipients see your document at the perfect zoom and layout."
          },
          {
                    "heading": "Showcase Portfolios & Books",
                    "body": "Automatically open presentation brochures in handsome two-page spreads."
          },
          {
                    "heading": "Kiosk & Fullscreen Ready",
                    "body": "Set documents to open in distraction-free presentation mode."
          },
          {
                    "heading": "Standards Compliant",
                    "body": "Writes valid PDF viewer preference dictionary entries supported everywhere."
          }
],
        faqs: [
          {
                    "q": "Will this work in all PDF readers?",
                    "a": "Yes, Adobe Acrobat, Foxit, Apple Preview, and modern browsers respect standard viewer preferences."
          },
          {
                    "q": "Can I hide the menu bar on open?",
                    "a": "Yes, flags like HideMenubar, HideToolbar, and FitWindow can be toggled."
          }
],
      },
    },
  },

  // Convert to PDF
  {
    slug: "convert-to-pdf",
    name: "Convert to PDF",
    category: "PDF Tools",
    icon: FileInput,
    blurb: "Universal converter to turn Word, Excel, PPT, images, and text documents into high-quality PDFs.",
    accepts: "Word, Excel, PPT, Images, Text",
    outputs: "PDF Document",
    seo: {
      title: "Convert to PDF Online Free — Universal Document to PDF Converter",
      description: "Convert any file to PDF online. Supports Word (DOCX/DOC), Excel (XLSX/XLS), PowerPoint (PPTX), Images (JPG/PNG/WEBP), and text files.",
      keywords: ["convert to pdf","all to pdf","universal pdf converter","free document to pdf","convert file to pdf online"],
      article: {
        intro: "Our universal Convert to PDF tool accepts virtually any office document, image, or text file and outputs a clean, standardized PDF.",
        howTo: ["Upload your file (DOCX, XLSX, PPTX, JPG, PNG, TXT, etc.).","Configure layout orientation and page margins.","Click Convert to PDF.","Download your standardized, high-resolution PDF document."],
        benefits: [
          {
                    "heading": "All-in-One Conversion",
                    "body": "Handles dozens of file formats in one convenient workspace."
          },
          {
                    "heading": "Layout Preservation",
                    "body": "Keeps fonts, tables, alignments, and images perfectly in place."
          },
          {
                    "heading": "High Print Resolution",
                    "body": "Exports at 300+ DPI suitable for professional physical printing."
          },
          {
                    "heading": "No Watermarks",
                    "body": "Download 100% clean PDF files with zero branding or watermarks."
          }
],
        faqs: [
          {
                    "q": "Can I convert multiple files at once?",
                    "a": "Yes, batch upload multiple files to convert them sequentially or merge into one PDF."
          },
          {
                    "q": "Is file quality preserved?",
                    "a": "Yes, original image resolutions and font metrics are strictly maintained."
          }
],
      },
    },
  },

  // Publisher to PDF
  {
    slug: "publisher-to-pdf",
    name: "Publisher to PDF",
    category: "PDF Tools",
    icon: FileType2,
    blurb: "Convert Microsoft Publisher (.pub) files into universally viewable, print-ready PDF documents.",
    accepts: "Microsoft Publisher (.pub)",
    outputs: "PDF Document",
    seo: {
      title: "Convert Publisher to PDF Online Free — .PUB to PDF Converter",
      description: "Convert Microsoft Publisher (.pub) files to PDF online without having Microsoft Office installed. Retains layouts, fonts, flyers, and brochures.",
      keywords: ["publisher to pdf","convert pub to pdf","microsoft publisher to pdf free","open pub file as pdf","pub file converter"],
      article: {
        intro: "Microsoft Publisher files can only be opened by select Windows systems. Convert .pub files to universally accessible PDFs readable on any device.",
        howTo: ["Upload your Microsoft Publisher (.pub) document.","Wait while the layout and vector elements are processed.","Preview the generated document pages.","Download the finished, print-ready PDF."],
        benefits: [
          {
                    "heading": "No MS Office Required",
                    "body": "Convert .pub files on Mac, Linux, iOS, Android, or Windows."
          },
          {
                    "heading": "Accurate Layout Rendering",
                    "body": "Retains complex multi-column brochures, flyers, and newsletters."
          },
          {
                    "heading": "CMYK & RGB Support",
                    "body": "Maintains print color fidelity for professional printing presses."
          },
          {
                    "heading": "Instant Access",
                    "body": "Eliminates proprietary software lock-in."
          }
],
        faqs: [
          {
                    "q": "Can I open old Publisher files?",
                    "a": "Yes, supports Publisher 2000, 2003, 2007, 2010, 2013, 2016, and 2019 versions."
          },
          {
                    "q": "Can I print the resulting PDF?",
                    "a": "Yes, the output is formatted at standard print dimensions with sharp vector graphics."
          }
],
      },
    },
  },

  // JPG to PDF
  {
    slug: "jpg-to-pdf",
    name: "JPG to PDF",
    category: "PDF Tools",
    icon: FileImage,
    blurb: "Convert JPG and JPEG photos into clean, high-quality PDF files with customizable page sizing.",
    accepts: "JPG, JPEG",
    outputs: "PDF Document",
    seo: {
      title: "JPG to PDF Online Free — Convert JPG Images to PDF",
      description: "Convert JPG and JPEG pictures to PDF online for free. Adjust orientation, margins, and page sizes (A4, Letter) in seconds.",
      keywords: ["jpg to pdf","convert jpg to pdf","jpeg to pdf online","combine jpg into pdf","photo to pdf converter"],
      article: {
        intro: "Convert single or multiple JPG images into a clean, paginated PDF document. Ideal for receipts, photo portfolios, and scanned documents.",
        howTo: ["Upload one or more JPG or JPEG photos.","Arrange image order, orientation, and margin spacing.","Click Convert to PDF.","Download your compact, high-quality PDF file."],
        benefits: [
          {
                    "heading": "Multiple Photos into One PDF",
                    "body": "Combine dozens of JPG shots into a single organized document."
          },
          {
                    "heading": "Custom Page Sizing",
                    "body": "Fit images to A4, US Letter, or match the exact image aspect ratio."
          },
          {
                    "heading": "Quality Optimization",
                    "body": "Adjust compression to balance small file size and maximum clarity."
          },
          {
                    "heading": "100% Free & Unlimited",
                    "body": "No daily conversion limits and no registration required."
          }
],
        faqs: [
          {
                    "q": "Can I rearrange the order of pictures?",
                    "a": "Yes, drag and drop image cards to arrange pages in any desired order."
          },
          {
                    "q": "Does it lower image resolution?",
                    "a": "By default, your original image resolution is preserved without loss."
          }
],
      },
    },
  },

  // PNG to PDF
  {
    slug: "png-to-pdf",
    name: "PNG to PDF",
    category: "PDF Tools",
    icon: FileImage,
    blurb: "Convert PNG images with transparency preservation directly into crisp, professional PDF documents.",
    accepts: "PNG",
    outputs: "PDF Document",
    seo: {
      title: "PNG to PDF Online Free — Convert PNG Images to PDF Document",
      description: "Convert PNG pictures to PDF online for free. Retain high-resolution details and transparent backgrounds in a professional PDF format.",
      keywords: ["png to pdf","convert png to pdf","png to pdf transparent","combine png to pdf","lossless png to pdf"],
      article: {
        intro: "Convert PNG graphics, illustrations, and screenshots into clean PDF documents with razor-sharp lines and lossless quality.",
        howTo: ["Select and upload your PNG images.","Set background fill color (white, black, or custom) or keep transparency.","Set page layout and margins.","Download the generated PDF."],
        benefits: [
          {
                    "heading": "Lossless Graphics",
                    "body": "Maintains pixel-perfect edges for diagrams, icons, and UI screenshots."
          },
          {
                    "heading": "Multi-Image Batching",
                    "body": "Batch combine multiple PNG files into a multi-page PDF."
          },
          {
                    "heading": "Custom Backgrounds",
                    "body": "Fill transparent areas with clean white paper background."
          },
          {
                    "heading": "Lightning Fast",
                    "body": "Instant conversion running directly inside your browser."
          }
],
        faqs: [
          {
                    "q": "What happens to transparent PNG backgrounds?",
                    "a": "You can keep them transparent or auto-fill with clean white paper background."
          },
          {
                    "q": "Can I combine PNG and JPG files?",
                    "a": "Yes, you can upload both formats together to compile your PDF."
          }
],
      },
    },
  },

  // WEBP to PDF
  {
    slug: "webp-to-pdf",
    name: "WEBP to PDF",
    category: "PDF Tools",
    icon: FileImage,
    blurb: "Convert modern web format WEBP images into universally compatible PDF pages.",
    accepts: "WEBP",
    outputs: "PDF Document",
    seo: {
      title: "WEBP to PDF Online Free — Convert Google WEBP Images to PDF",
      description: "Convert WEBP images downloaded from websites into standard PDF documents. Fast, secure, and preserves full visual quality.",
      keywords: ["webp to pdf","convert webp to pdf","webp image to pdf","batch webp to pdf","google webp converter"],
      article: {
        intro: "WEBP is the dominant modern web image format, but older programs and printers struggle with it. Convert your WEBP files to standard PDF in seconds.",
        howTo: ["Upload your WEBP image files.","Reorder images and pick page dimensions.","Click Convert to PDF.","Download your universal PDF document."],
        benefits: [
          {
                    "heading": "Universal Compatibility",
                    "body": "Make web images viewable in any PDF reader or print shop."
          },
          {
                    "heading": "Preserves High Compression",
                    "body": "Maintains the efficiency of modern WEBP compression in PDF form."
          },
          {
                    "heading": "Batch Processing",
                    "body": "Convert multiple downloaded WEBP graphics into one document."
          },
          {
                    "heading": "Private & Local",
                    "body": "Zero cloud upload needed—processed locally in your browser."
          }
],
        faqs: [
          {
                    "q": "Are animated WEBP files supported?",
                    "a": "Yes, animated frames can be extracted into individual pages."
          },
          {
                    "q": "Is quality degraded?",
                    "a": "No, WEBP pixel information is transferred directly into the PDF container."
          }
],
      },
    },
  },

  // HEIC to PDF
  {
    slug: "heic-to-pdf",
    name: "HEIC to PDF",
    category: "PDF Tools",
    icon: FileImage,
    blurb: "Convert Apple iPhone & iPad HEIC / HEIF camera photos directly to PDF in seconds.",
    accepts: "HEIC, HEIF",
    outputs: "PDF Document",
    seo: {
      title: "HEIC to PDF Online Free — Convert iPhone Photos to PDF",
      description: "Convert Apple iPhone HEIC and HEIF photos to PDF online for free. Combine multiple iOS camera shots into a single printable PDF document.",
      keywords: ["heic to pdf","convert heic to pdf","iphone photo to pdf","heif to pdf online","apple heic to pdf free"],
      article: {
        intro: "iPhone cameras save photos in HEIC format, which many Windows PCs and document portals cannot open. Convert HEIC to PDF effortlessly.",
        howTo: ["Upload HEIC or HEIF images directly from your iPhone or computer.","Reorder pages and adjust portrait or landscape orientation.","Click Convert to PDF.","Download your standardized, universally viewable PDF."],
        benefits: [
          {
                    "heading": "Open iPhone Photos Anywhere",
                    "body": "Solves compatibility headaches when uploading receipts or IDs."
          },
          {
                    "heading": "Preserves High Dynamic Range",
                    "body": "Maintains rich color gamut and contrast from Apple camera sensors."
          },
          {
                    "heading": "Multi-Photo Consolidation",
                    "body": "Merge multiple receipt photos into a single reimbursement packet."
          },
          {
                    "heading": "Works on Any Device",
                    "body": "Compatible with Windows, Mac, Linux, Android, and iOS."
          }
],
        faqs: [
          {
                    "q": "Can I convert directly from an iPhone Safari browser?",
                    "a": "Yes, you can pick photos straight from your iOS Photo Library."
          },
          {
                    "q": "Are Live Photos supported?",
                    "a": "The high-resolution still frame of the Live Photo is converted."
          }
],
      },
    },
  },

  // SVG to PDF
  {
    slug: "svg-to-pdf",
    name: "SVG to PDF",
    category: "PDF Tools",
    icon: FileCode,
    blurb: "Convert scalable vector graphics (SVG) to vector-preserved, infinitely sharp PDF documents.",
    accepts: "SVG",
    outputs: "Vector PDF",
    seo: {
      title: "SVG to PDF Online Free — Convert Scalable Vector Graphics to PDF",
      description: "Convert SVG vector files to PDF online. Retain scalable vector paths, gradients, and font typography for infinite zoom and high-end printing.",
      keywords: ["svg to pdf","convert svg to pdf","vector svg to pdf","scalable vector graphics to pdf","svg print to pdf"],
      article: {
        intro: "Convert SVG vector artwork, charts, and logos into vector PDF files. No rasterization or pixelation—lines stay razor-sharp at any zoom level.",
        howTo: ["Upload your SVG vector file.","Set target page size or auto-fit to SVG viewBox boundaries.","Click Convert to PDF.","Download your vector-grade PDF document."],
        benefits: [
          {
                    "heading": "True Vector Fidelity",
                    "body": "Keeps bezier curves, fills, strokes, and gradients 100% scalable."
          },
          {
                    "heading": "Print Ready",
                    "body": "Ideal for large-format blueprints, architectural plans, and signage."
          },
          {
                    "heading": "Compact File Size",
                    "body": "Vector commands produce ultra-small PDF files compared to bitmaps."
          },
          {
                    "heading": "Embedded Fonts",
                    "body": "Preserves custom typography and text glyphs accurately."
          }
],
        faqs: [
          {
                    "q": "Will the output PDF be rasterized?",
                    "a": "No, paths and vector commands are converted directly into native PDF vector operators."
          },
          {
                    "q": "Can I print SVG to architectural sheet sizes (A0/A1)?",
                    "a": "Yes, you can choose large format page sizes during export."
          }
],
      },
    },
  },

  // TIFF to PDF
  {
    slug: "tiff-to-pdf",
    name: "TIFF to PDF",
    category: "PDF Tools",
    icon: FileImage,
    blurb: "Convert multi-page TIFF and TIF image files into a single, compact PDF document.",
    accepts: "TIFF, TIF",
    outputs: "PDF Document",
    seo: {
      title: "TIFF to PDF Online Free — Convert Multi-Page TIF to PDF",
      description: "Convert multi-page TIFF and TIF scanner files to PDF online for free. Ideal for archival records, medical scans, faxes, and legal filings.",
      keywords: ["tiff to pdf","convert tiff to pdf","multi page tif to pdf","fax tiff to pdf","scanned tiff converter"],
      article: {
        intro: "Office scanners and legacy fax systems often produce multi-page TIFF files. Convert them to modern, compressed PDF documents in seconds.",
        howTo: ["Upload your single or multi-page TIFF / TIF file.","Preview individual pages and choose layout settings.","Click Convert to PDF.","Download your unified PDF document."],
        benefits: [
          {
                    "heading": "Multi-Page Extraction",
                    "body": "Automatically splits multi-page TIFF files into sequential PDF pages."
          },
          {
                    "heading": "Lossless or Compressed",
                    "body": "Choose between CCITT Group 4, LZW, or Deflate compression modes."
          },
          {
                    "heading": "Ideal for Legal & Medical",
                    "body": "Complies with electronic court filing and healthcare archiving rules."
          },
          {
                    "heading": "Bulk Upload",
                    "body": "Convert multiple independent TIFFs simultaneously."
          }
],
        faqs: [
          {
                    "q": "Are 1-bit monochrome scans supported?",
                    "a": "Yes, CCITT fax and bi-level scanned documents are fully supported."
          },
          {
                    "q": "Can I reduce the huge file size of TIFFs?",
                    "a": "Yes, our smart PDF encoder drastically reduces file size while retaining legibility."
          }
],
      },
    },
  },

  // DOCX to PDF
  {
    slug: "docx-to-pdf",
    name: "DOCX to PDF",
    category: "PDF Tools",
    icon: FileText,
    blurb: "Convert modern Microsoft Word (.docx) documents to PDF with layout and typography preserved.",
    accepts: ".docx",
    outputs: "PDF Document",
    seo: {
      title: "DOCX to PDF Online Free — Convert Word DOCX to PDF Document",
      description: "Convert Microsoft Word .docx files to PDF online for free. Preserves document layouts, tables, headers, footers, and font styling perfectly.",
      keywords: ["docx to pdf","convert docx to pdf","word docx to pdf free","docx file to pdf online","save docx as pdf"],
      article: {
        intro: "Transform Microsoft Word (.docx) documents into universally readable PDF files without needing Word or Microsoft Office installed.",
        howTo: ["Upload your .docx file.","Review automatic layout and pagination conversion.","Click Convert to PDF.","Download your print-ready PDF."],
        benefits: [
          {
                    "heading": "Strict Layout Fidelity",
                    "body": "Retains complex margins, tables, bullet points, and column formats."
          },
          {
                    "heading": "Preserves Links & Bookmarks",
                    "body": "Hyperlinks, table of contents, and internal page jumps remain clickable."
          },
          {
                    "heading": "Cross-Platform Sharing",
                    "body": "Eliminates font shifting and formatting issues across different devices."
          },
          {
                    "heading": "Instant & Free",
                    "body": "Converts documents in seconds without watermarks or limits."
          }
],
        faqs: [
          {
                    "q": "Do I need Microsoft Word installed?",
                    "a": "No, conversion is performed entirely in your browser using cloud-grade parsers."
          },
          {
                    "q": "Are embedded images preserved?",
                    "a": "Yes, all photos, charts, and diagrams remain at their original resolution."
          }
],
      },
    },
  },

  // PPTX to PDF
  {
    slug: "pptx-to-pdf",
    name: "PPTX to PDF",
    category: "PDF Tools",
    icon: Presentation,
    blurb: "Convert PowerPoint (.pptx) presentation decks into printable, presentation-ready PDF slides.",
    accepts: ".pptx",
    outputs: "PDF Slides",
    seo: {
      title: "PPTX to PDF Online Free — Convert PowerPoint to PDF Presentation",
      description: "Convert PowerPoint .pptx presentations to PDF online. Perfect for sharing presentation slides, printing handouts, and locking formatting.",
      keywords: ["pptx to pdf","convert pptx to pdf","powerpoint to pdf online","save pptx as pdf","slides to pdf converter"],
      article: {
        intro: "Convert Microsoft PowerPoint (.pptx) presentations into compact, universally viewable PDF decks. Ensure slides look identical on every screen.",
        howTo: ["Upload your PowerPoint (.pptx) deck.","Preview slide layouts and aspect ratios (16:9 or 4:3).","Click Convert to PDF.","Download your presentation-ready PDF document."],
        benefits: [
          {
                    "heading": "Slide-by-Slide Precision",
                    "body": "Each presentation slide becomes a crisp, full-bleed PDF page."
          },
          {
                    "heading": "No Font Discrepancies",
                    "body": "Eliminates missing font substitution bugs when presenting on foreign machines."
          },
          {
                    "heading": "Handout Ready",
                    "body": "Easy to print for conferences, lectures, and executive board reviews."
          },
          {
                    "heading": "Safe for Client Sharing",
                    "body": "Locks animations and master templates so recipients cannot alter slides."
          }
],
        faqs: [
          {
                    "q": "Are slide notes included?",
                    "a": "You can choose to export full slides only or slides with presenter notes."
          },
          {
                    "q": "What happens to PowerPoint animations?",
                    "a": "Animations are flattened to the final slide state for clean presentation."
          }
],
      },
    },
  },

  // XLSX to PDF
  {
    slug: "xlsx-to-pdf",
    name: "XLSX to PDF",
    category: "PDF Tools",
    icon: FileSpreadsheet,
    blurb: "Convert Excel (.xlsx) spreadsheets and calculation workbooks into cleanly paginated PDF files.",
    accepts: ".xlsx",
    outputs: "PDF Document",
    seo: {
      title: "XLSX to PDF Online Free — Convert Excel Sheets to PDF",
      description: "Convert Microsoft Excel .xlsx spreadsheets to PDF online for free. Auto-fit wide columns to one page and print clean financial reports.",
      keywords: ["xlsx to pdf","convert xlsx to pdf","excel spreadsheet to pdf","fit excel to one page pdf","excel to pdf online free"],
      article: {
        intro: "Convert Excel spreadsheets (.xlsx) into clean, printable PDF reports. Automatically fits wide sheets to page width without cutoffs.",
        howTo: ["Upload your Excel (.xlsx) file.","Choose orientation (Portrait or Landscape) and scale-to-fit options.","Select specific worksheets or convert the entire workbook.","Download your professional PDF spreadsheet."],
        benefits: [
          {
                    "heading": "No Truncated Columns",
                    "body": "Smart auto-fit ensures wide tables fit cleanly on standard paper sizes."
          },
          {
                    "heading": "Multi-Sheet Conversion",
                    "body": "Convert all tabs into consecutive sections or export selected tabs."
          },
          {
                    "heading": "Preserves Formulas & Values",
                    "body": "Displays calculated numbers, currencies, and percentages accurately."
          },
          {
                    "heading": "Financial Grade Privacy",
                    "body": "Files are handled securely with immediate client-side disposal."
          }
],
        faqs: [
          {
                    "q": "Can I fit wide tables onto one page?",
                    "a": "Yes, select 'Fit all columns on one page' to prevent horizontal splitting."
          },
          {
                    "q": "Are cell borders and colors preserved?",
                    "a": "Yes, styling, gridlines, and cell background colors are accurately rendered."
          }
],
      },
    },
  },

  // DOC to PDF
  {
    slug: "doc-to-pdf",
    name: "DOC to PDF",
    category: "PDF Tools",
    icon: FileText,
    blurb: "Convert legacy Microsoft Word 97-2003 (.doc) files into standard, modern PDF documents.",
    accepts: ".doc",
    outputs: "PDF Document",
    seo: {
      title: "Convert DOC to PDF Online Free — Word 97-2003 to PDF",
      description: "Convert legacy Word .doc files to modern PDF documents online. Fast, secure, and preserves fonts, tables, and document structures.",
      keywords: ["doc to pdf","convert doc to pdf","legacy word to pdf","doc file to pdf free","microsoft word doc converter"],
      article: {
        intro: "Older .doc files from Word 97-2003 can be difficult to open in modern workflows. Convert them to universally supported PDFs instantly.",
        howTo: ["Upload your legacy .doc document.","Wait while binary formatting tags are translated.","Preview the converted document.","Download the modern PDF."],
        benefits: [
          {
                    "heading": "Legacy Compatibility",
                    "body": "Revives older archival documents without requiring vintage software."
          },
          {
                    "heading": "Secure Modern Format",
                    "body": "Protects outdated binary files from corruption and malware."
          },
          {
                    "heading": "Standard Pagination",
                    "body": "Locks pagination so files print identically across all environments."
          },
          {
                    "heading": "Free & Fast",
                    "body": "Process files in seconds directly in your web browser."
          }
],
        faqs: [
          {
                    "q": "Can this convert Word 97, 2000, and 2003 files?",
                    "a": "Yes, all legacy binary .doc revisions are supported."
          },
          {
                    "q": "Will track changes or comments be visible?",
                    "a": "You can choose to render documents with or without markup."
          }
],
      },
    },
  },

  // PPT to PDF
  {
    slug: "ppt-to-pdf",
    name: "PPT to PDF",
    category: "PDF Tools",
    icon: Presentation,
    blurb: "Convert classic PowerPoint 97-2003 (.ppt) slide decks into universal PDF documents.",
    accepts: ".ppt",
    outputs: "PDF Slides",
    seo: {
      title: "Convert PPT to PDF Online Free — Classic PowerPoint to PDF",
      description: "Convert legacy PowerPoint .ppt presentations into modern PDF files online. Preserves classic slide backgrounds, fonts, and graphics.",
      keywords: ["ppt to pdf","convert ppt to pdf","powerpoint 97-2003 to pdf","classic ppt to pdf","slide deck to pdf converter"],
      article: {
        intro: "Easily convert legacy Microsoft PowerPoint (.ppt) presentation decks into clean, portable PDF documents compatible with all devices.",
        howTo: ["Upload your .ppt presentation file.","Review the converted slide deck.","Click Convert to PDF.","Download your PDF presentation."],
        benefits: [
          {
                    "heading": "Revive Older Decks",
                    "body": "Open and present vintage slide files on modern laptops and tablets."
          },
          {
                    "heading": "Crisp Typography",
                    "body": "Renders text cleanly without missing font errors."
          },
          {
                    "heading": "Easy Distribution",
                    "body": "Send lightweight PDF decks to clients and students without compatibility issues."
          },
          {
                    "heading": "100% Free",
                    "body": "Convert as many presentations as you need."
          }
],
        faqs: [
          {
                    "q": "Does this require Microsoft Office 2003?",
                    "a": "No, conversion works completely online in any modern browser."
          },
          {
                    "q": "Can I print multi-slide handouts?",
                    "a": "Yes, you can configure pages per sheet for easy physical printing."
          }
],
      },
    },
  },

  // XLS to PDF
  {
    slug: "xls-to-pdf",
    name: "XLS to PDF",
    category: "PDF Tools",
    icon: FileSpreadsheet,
    blurb: "Convert classic Excel 97-2003 (.xls) spreadsheets into formatted, printable PDF documents.",
    accepts: ".xls",
    outputs: "PDF Document",
    seo: {
      title: "Convert XLS to PDF Online Free — Excel 97-2003 to PDF",
      description: "Convert legacy Excel .xls workbooks into professional PDF documents. Preserves tables, currencies, charts, and gridlines cleanly.",
      keywords: ["xls to pdf","convert xls to pdf","excel 97-2003 to pdf","legacy excel to pdf","xls workbook converter"],
      article: {
        intro: "Convert older Microsoft Excel binary workbooks (.xls) into standard PDF documents. Perfect for archival financial records and audits.",
        howTo: ["Upload your .xls workbook.","Configure sheet orientation and scaling.","Click Convert to PDF.","Download your formatted PDF report."],
        benefits: [
          {
                    "heading": "Archival Compliance",
                    "body": "Convert legacy spreadsheets into permanent, non-editable PDF records."
          },
          {
                    "heading": "Accurate Cell Alignment",
                    "body": "Preserves numbers, formulas, dates, and column widths."
          },
          {
                    "heading": "Chart Rendering",
                    "body": "Converts embedded Excel graphs and charts into vector PDF visuals."
          },
          {
                    "heading": "Secure Processing",
                    "body": "No sensitive financial data is retained on servers."
          }
],
        faqs: [
          {
                    "q": "Are macro-enabled sheets supported?",
                    "a": "Yes, sheet contents and visual outputs are rendered safely without executing macros."
          },
          {
                    "q": "Will multiple sheets be included?",
                    "a": "Yes, you can export all sheets into a single multi-page PDF."
          }
],
      },
    },
  },

  // ODT to PDF
  {
    slug: "odt-to-pdf",
    name: "ODT to PDF",
    category: "PDF Tools",
    icon: FileText,
    blurb: "Convert OpenDocument Text (.odt) files from LibreOffice or OpenOffice into PDF.",
    accepts: ".odt",
    outputs: "PDF Document",
    seo: {
      title: "Convert ODT to PDF Online Free — OpenOffice & LibreOffice to PDF",
      description: "Convert OpenDocument .odt files to PDF online for free. Flawless conversion for LibreOffice Writer and Apache OpenOffice documents.",
      keywords: ["odt to pdf","convert odt to pdf","libreoffice to pdf","openoffice to pdf","opendocument text to pdf"],
      article: {
        intro: "OpenDocument Text (.odt) is the standard format for LibreOffice and open source suites. Convert your .odt files into universal PDFs in seconds.",
        howTo: ["Upload your .odt document.","Preview layout, fonts, and page breaks.","Click Convert to PDF.","Download your clean PDF document."],
        benefits: [
          {
                    "heading": "Open Source Standard",
                    "body": "Full fidelity rendering for LibreOffice Writer and OpenOffice files."
          },
          {
                    "heading": "Preserves Footnotes & Tables",
                    "body": "Academic papers, citations, and tables transfer seamlessly."
          },
          {
                    "heading": "Universal Sharing",
                    "body": "Recipients don't need LibreOffice installed to view your work."
          },
          {
                    "heading": "No Installation",
                    "body": "Works directly in your browser on Mac, Windows, Linux, and mobile."
          }
],
        faqs: [
          {
                    "q": "Are tables of contents preserved?",
                    "a": "Yes, linked headings and index tables remain fully functional."
          },
          {
                    "q": "Is there a file size limit?",
                    "a": "Generous file size limits accommodate large manuscripts and dissertations."
          }
],
      },
    },
  },

  // ODG to PDF
  {
    slug: "odg-to-pdf",
    name: "ODG to PDF",
    category: "PDF Tools",
    icon: FileImage,
    blurb: "Convert OpenDocument Graphics (.odg) vector drawings and diagrams to PDF format.",
    accepts: ".odg",
    outputs: "PDF Document",
    seo: {
      title: "Convert ODG to PDF Online Free — LibreOffice Draw to PDF",
      description: "Convert OpenDocument Graphics (.odg) vector drawings, diagrams, and flowcharts into clean, scalable PDF documents online.",
      keywords: ["odg to pdf","convert odg to pdf","libreoffice draw to pdf","opendocument graphics to pdf","draw file to pdf"],
      article: {
        intro: "LibreOffice Draw saves diagrams and technical vectors in .odg format. Convert them to vector PDFs for publishing and sharing.",
        howTo: ["Upload your .odg drawing or diagram.","Verify vector shapes and diagram canvas bounds.","Click Convert to PDF.","Download your vector-sharp PDF document."],
        benefits: [
          {
                    "heading": "Vector Preservation",
                    "body": "Flowcharts, technical schematics, and vector art remain infinitely scalable."
          },
          {
                    "heading": "Easy Collaboration",
                    "body": "Share technical drawings with teammates who lack LibreOffice Draw."
          },
          {
                    "heading": "High-DPI Printing",
                    "body": "Perfect for posters, blueprints, and engineering schematics."
          },
          {
                    "heading": "Private Processing",
                    "body": "Files are handled client-side with zero retention."
          }
],
        faqs: [
          {
                    "q": "Can I zoom in without pixelation?",
                    "a": "Yes, vector lines and bezier curves remain perfectly crisp at any zoom level."
          },
          {
                    "q": "Are embedded bitmap photos supported?",
                    "a": "Yes, hybrid vector and bitmap diagrams are rendered accurately."
          }
],
      },
    },
  },

  // ODS to PDF
  {
    slug: "ods-to-pdf",
    name: "ODS to PDF",
    category: "PDF Tools",
    icon: FileSpreadsheet,
    blurb: "Convert OpenDocument Spreadsheet (.ods) files from LibreOffice Calc into PDF.",
    accepts: ".ods",
    outputs: "PDF Document",
    seo: {
      title: "Convert ODS to PDF Online Free — LibreOffice Calc to PDF",
      description: "Convert OpenDocument .ods spreadsheets to PDF online for free. Retain formulas, gridlines, charts, and clean pagination.",
      keywords: ["ods to pdf","convert ods to pdf","libreoffice calc to pdf","opendocument spreadsheet to pdf","ods to pdf online free"],
      article: {
        intro: "Convert LibreOffice Calc (.ods) spreadsheets into handsome, readable PDF documents. Fit wide data sets cleanly onto printable sheets.",
        howTo: ["Upload your .ods spreadsheet file.","Select landscape or portrait orientation and scaling.","Click Convert to PDF.","Download your printable PDF report."],
        benefits: [
          {
                    "heading": "True OpenDocument Parsing",
                    "body": "Accurately interprets Calc cell formulas, styles, and number formatting."
          },
          {
                    "heading": "Clean Page Fitting",
                    "body": "Prevents awkward horizontal page splits by scaling tables to page width."
          },
          {
                    "heading": "Multi-Sheet Support",
                    "body": "Combines multiple workbook tabs into one structured document."
          },
          {
                    "heading": "Fast & Free",
                    "body": "Zero registration, zero queue times, and no fees."
          }
],
        faqs: [
          {
                    "q": "Can I hide grid lines in the output?",
                    "a": "Yes, you can toggle grid line visibility to match your preferences."
          },
          {
                    "q": "Are charts converted?",
                    "a": "Yes, bar graphs, pie charts, and data plots render as clean vector graphics."
          }
],
      },
    },
  },

  // ODP to PDF
  {
    slug: "odp-to-pdf",
    name: "ODP to PDF",
    category: "PDF Tools",
    icon: Presentation,
    blurb: "Convert OpenDocument Presentation (.odp) slides from LibreOffice Impress into PDF.",
    accepts: ".odp",
    outputs: "PDF Document",
    seo: {
      title: "Convert ODP to PDF Online Free — LibreOffice Impress to PDF",
      description: "Convert OpenDocument .odp presentations to PDF online for free. Retains slide backgrounds, layouts, typography, and graphics.",
      keywords: ["odp to pdf","convert odp to pdf","libreoffice impress to pdf","opendocument presentation to pdf","odp slides to pdf"],
      article: {
        intro: "Convert LibreOffice Impress (.odp) slide presentations into clean, portable PDF decks ready to display on projectors or share with clients.",
        howTo: ["Upload your .odp presentation.","Preview slide sequence and formatting.","Click Convert to PDF.","Download your presentation-ready PDF deck."],
        benefits: [
          {
                    "heading": "Cross-Platform Presentation",
                    "body": "Present your slides on any computer without font substitution glitches."
          },
          {
                    "heading": "Handout Printing",
                    "body": "Easily print slide decks for classroom distribution or meeting packets."
          },
          {
                    "heading": "Slide Integrity",
                    "body": "Locks layout and formatting so recipients cannot alter text."
          },
          {
                    "heading": "Free & Unlimited",
                    "body": "Convert unlimited presentations without watermarks."
          }
],
        faqs: [
          {
                    "q": "What happens to master slides and backgrounds?",
                    "a": "All master slide templates, gradients, and logos are accurately rendered."
          },
          {
                    "q": "Can I convert wide 16:9 slides?",
                    "a": "Yes, widescreen 16:9 and standard 4:3 aspects are automatically detected."
          }
],
      },
    },
  },

  // Text to PDF
  {
    slug: "text-to-pdf",
    name: "Text to PDF",
    category: "PDF Tools",
    icon: FileText,
    blurb: "Convert plain text (.txt) files or pasted text into structured, clean PDF pages.",
    accepts: ".txt, Plain Text",
    outputs: "PDF Document",
    seo: {
      title: "Text to PDF Online Free — Convert TXT or Pasted Text to PDF",
      description: "Convert plain text (.txt) files or pasted notes into formatted PDF documents online. Customize font family, size, line spacing, and margins.",
      keywords: ["text to pdf","convert txt to pdf","txt file to pdf","paste text to pdf","plain text to pdf converter"],
      article: {
        intro: "Turn raw text notes, code snippets, or .txt files into clean, professional PDF documents with customizable typography and margins.",
        howTo: ["Upload a .txt file or paste your text directly into the editor.","Choose your preferred font (Serif, Sans, or Monospace) and font size.","Set margins and page numbering options.","Download your cleanly paginated PDF."],
        benefits: [
          {
                    "heading": "Custom Typography",
                    "body": "Select fonts, adjust line spacing, and choose font sizes for optimal reading."
          },
          {
                    "heading": "Smart Auto-Pagination",
                    "body": "Automatically breaks long text into numbered pages with clean paragraph flow."
          },
          {
                    "heading": "Code & Monospace Support",
                    "body": "Use fixed-width fonts for clean software logs, configuration files, and code."
          },
          {
                    "heading": "Instant Generation",
                    "body": "Generates formatted PDFs in milliseconds."
          }
],
        faqs: [
          {
                    "q": "Are UTF-8 special characters supported?",
                    "a": "Yes, full international unicode characters, accents, and symbols are supported."
          },
          {
                    "q": "Can I add page numbers?",
                    "a": "Yes, automatic header and footer page numbering can be toggled on."
          }
],
      },
    },
  },

  // RTF to PDF
  {
    slug: "rtf-to-pdf",
    name: "RTF to PDF",
    category: "PDF Tools",
    icon: FileText,
    blurb: "Convert Rich Text Format (.rtf) documents with font styling and colors into PDF.",
    accepts: ".rtf",
    outputs: "PDF Document",
    seo: {
      title: "Convert RTF to PDF Online Free — Rich Text Format to PDF",
      description: "Convert Rich Text Format (.rtf) files to PDF online for free. Retains bold, italics, font colors, bullet lists, and paragraph formatting.",
      keywords: ["rtf to pdf","convert rtf to pdf","rich text format to pdf","wordpad rtf to pdf","rtf document converter"],
      article: {
        intro: "Rich Text Format (.rtf) documents from WordPad or Word can look inconsistent across devices. Convert them to standardized PDFs in seconds.",
        howTo: ["Upload your .rtf document.","Verify font styling, bolding, and colors.","Click Convert to PDF.","Download your standardized PDF file."],
        benefits: [
          {
                    "heading": "Preserves Rich Styling",
                    "body": "Retains bold, italics, font weights, colors, and text alignment."
          },
          {
                    "heading": "Universal Distribution",
                    "body": "Eliminates platform-specific RTF rendering differences."
          },
          {
                    "heading": "Print & Archive Ready",
                    "body": "Locks pagination for legal and contractual record keeping."
          },
          {
                    "heading": "Free & Private",
                    "body": "No registration and files are processed securely in your browser."
          }
],
        faqs: [
          {
                    "q": "Does this support WordPad files?",
                    "a": "Yes, files created in Windows WordPad or TextEdit are fully compatible."
          },
          {
                    "q": "Are bullet lists preserved?",
                    "a": "Yes, standard RTF bullet points, indents, and numbered lists render cleanly."
          }
],
      },
    },
  },

  // EPUB to PDF
  {
    slug: "epub-to-pdf",
    name: "EPUB to PDF",
    category: "PDF Tools",
    icon: BookOpen,
    blurb: "Convert EPUB electronic books into formatted, paginated PDF documents for printing and reading.",
    accepts: ".epub",
    outputs: "PDF Document",
    seo: {
      title: "Convert EPUB to PDF Online Free — EBook to PDF Converter",
      description: "Convert EPUB eBooks to printable PDF documents online. Retain book chapters, cover art, table of contents, and typography.",
      keywords: ["epub to pdf","convert epub to pdf","ebook to pdf converter","read epub as pdf","print epub book to pdf"],
      article: {
        intro: "Convert reflowable EPUB electronic books into fixed-layout, printable PDF documents. Perfect for reading on larger screens or printing physical copies.",
        howTo: ["Upload your .epub eBook file.","Choose target page size (A4, A5, or US Letter) and font size.","Preview chapter layouts and book cover.","Download your fully paginated PDF book."],
        benefits: [
          {
                    "heading": "Fixed Page Layout",
                    "body": "Turns reflowable e-reader text into permanent, numbered book pages."
          },
          {
                    "heading": "Preserves Chapters & Table of Contents",
                    "body": "Retains internal book navigation and chapter headings."
          },
          {
                    "heading": "Printable Format",
                    "body": "Ideal for printing physical books, academic readers, and manuals."
          },
          {
                    "heading": "Works with Any Reader",
                    "body": "Read on devices that do not have dedicated EPUB software installed."
          }
],
        faqs: [
          {
                    "q": "Are images and illustrations included?",
                    "a": "Yes, all embedded book artwork, covers, and illustrations are retained."
          },
          {
                    "q": "Can I choose A5 book format?",
                    "a": "Yes, you can choose pocket A5, standard A4, or custom book dimensions."
          }
],
      },
    },
  },

  // Markdown to PDF
  {
    slug: "markdown-to-pdf",
    name: "Markdown to PDF",
    category: "PDF Tools",
    icon: FileCode,
    blurb: "Render Markdown (.md) documents with syntax highlighting and headers into formatted PDF files.",
    accepts: ".md, Markdown",
    outputs: "PDF Document",
    seo: {
      title: "Markdown to PDF Online Free — Convert MD to Styled PDF",
      description: "Convert Markdown (.md) files to beautiful PDF documents online. Features syntax highlighting, tables, math equations, and modern typography.",
      keywords: ["markdown to pdf","convert md to pdf","markdown file to pdf","readme to pdf","markdown styled pdf generator"],
      article: {
        intro: "Transform GitHub READMEs, technical documentation, and Markdown notes into beautifully styled, professional PDF documents.",
        howTo: ["Upload a .md file or paste your Markdown text.","Select a visual theme (GitHub, Academic, Minimalist, Dark).","Enable code syntax highlighting and table formatting.","Download your publication-grade PDF."],
        benefits: [
          {
                    "heading": "GitHub Flavor Supported",
                    "body": "Supports GFM tables, checklists, strikethrough, and blockquotes."
          },
          {
                    "heading": "Syntax Highlighted Code",
                    "body": "Renders code blocks with clean color themes and line numbering."
          },
          {
                    "heading": "Modern Typographic Styles",
                    "body": "Beautiful heading hierarchies and readable body typography."
          },
          {
                    "heading": "Ideal for Documentation",
                    "body": "Create user manuals and technical specs from markdown repos."
          }
],
        faqs: [
          {
                    "q": "Are embedded images supported?",
                    "a": "Yes, images referenced via web URLs or base64 are rendered cleanly."
          },
          {
                    "q": "Can I use custom themes?",
                    "a": "Yes, pick from popular themes including GitHub Light, Academic, and Modern."
          }
],
      },
    },
  },

  // PUB to PDF
  {
    slug: "pub-to-pdf",
    name: "PUB to PDF",
    category: "PDF Tools",
    icon: FileType2,
    blurb: "Convert Microsoft Publisher documents (.pub) to PDF without needing MS Office installed.",
    accepts: ".pub",
    outputs: "PDF Document",
    seo: {
      title: "Convert PUB to PDF Online Free — Microsoft Publisher Converter",
      description: "Convert .pub files to PDF online for free. Open and read Microsoft Publisher brochures, newsletters, and flyers on any device.",
      keywords: ["pub to pdf","convert pub to pdf","microsoft publisher converter","open .pub online free","publisher document to pdf"],
      article: {
        intro: "Microsoft Publisher (.pub) files are proprietary and notoriously hard to open. Convert them to universal PDF documents effortlessly.",
        howTo: ["Upload your .pub file.","Our converter extracts and arranges all text boxes, shapes, and images.","Preview the visual layout.","Download the finished PDF."],
        benefits: [
          {
                    "heading": "Universal Accessibility",
                    "body": "Open Publisher designs on Mac, iPhone, iPad, Android, and Linux."
          },
          {
                    "heading": "Flawless Flyer & Brochure Layouts",
                    "body": "Preserves multi-panel folds, columns, and decorative typography."
          },
          {
                    "heading": "High Resolution Export",
                    "body": "Maintains high DPI for crisp commercial and desktop printing."
          },
          {
                    "heading": "Free & Fast",
                    "body": "Convert without purchasing an expensive Microsoft 365 license."
          }
],
        faqs: [
          {
                    "q": "Can I convert multi-page Publisher files?",
                    "a": "Yes, all pages of brochures and multi-page newsletters are converted."
          },
          {
                    "q": "Does it support Publisher 2003 through 2021?",
                    "a": "Yes, all major versions of the .pub file specification are handled."
          }
],
      },
    },
  },

  // Convert PDF to...
  {
    slug: "convert-pdf-to",
    name: "Convert PDF to...",
    category: "PDF Tools",
    icon: FileOutput,
    blurb: "Hub to convert any PDF document to Word, Excel, PowerPoint, Images, HTML, or Text.",
    accepts: "PDF",
    outputs: "DOCX, XLSX, PPTX, Images, Text",
    seo: {
      title: "Convert PDF to Word, Excel, Images & More — Universal PDF Converter",
      description: "Universal PDF export hub. Convert PDF to Word (DOCX), Excel (XLSX), PowerPoint (PPTX), JPG, PNG, Text, and HTML online for free.",
      keywords: ["convert pdf to","pdf converter hub","convert pdf to word excel image","universal pdf exporter","free pdf converter online"],
      article: {
        intro: "The central hub for all your PDF conversion needs. Choose your PDF file, pick any target export format, and convert in one click.",
        howTo: ["Upload the PDF document you wish to convert.","Select your target format: Word, Excel, PowerPoint, JPG, PNG, or Text.","Configure export quality and OCR options if needed.","Download your converted editable file."],
        benefits: [
          {
                    "heading": "All Formats in One Place",
                    "body": "Switch effortlessly between document, spreadsheet, slide, and image exports."
          },
          {
                    "heading": "Advanced OCR Engine",
                    "body": "Extract editable text from scanned documents with high accuracy."
          },
          {
                    "heading": "Preserves Original Formatting",
                    "body": "Retains tables, margins, font sizes, and structural alignments."
          },
          {
                    "heading": "Safe & Confidential",
                    "body": "Your files are never sold, indexed, or stored permanently."
          }
],
        faqs: [
          {
                    "q": "Which formats are available?",
                    "a": "DOCX, XLSX, PPTX, JPG, PNG, SVG, TIFF, HTML, EPUB, TXT, and Markdown."
          },
          {
                    "q": "Can I convert scanned PDFs into editable text?",
                    "a": "Yes, built-in OCR recognizes text in scanned images and documents."
          }
],
      },
    },
  },

  // PDF to JPG
  {
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    category: "PDF Tools",
    icon: FileImage,
    blurb: "Extract pages of a PDF document into high-resolution JPG images with adjustable compression.",
    accepts: "PDF",
    outputs: "JPG Images",
    seo: {
      title: "PDF to JPG Online Free — Convert PDF Pages to JPG Images",
      description: "Convert PDF pages to JPG images online for free. High-resolution rendering, fast batch page extraction, and customizable image quality.",
      keywords: ["pdf to jpg","convert pdf to jpg","extract images from pdf","pdf to jpeg online","save pdf as jpg"],
      article: {
        intro: "Convert any PDF into high-quality JPG pictures. Extract all pages as separate images or choose specific pages to save as lightweight JPEG files.",
        howTo: ["Upload your PDF document.","Choose render quality (150 DPI for web, 300 DPI for high-res print).","Select whether to extract all pages or specific page numbers.","Download individual JPGs or a single ZIP archive."],
        benefits: [
          {
                    "heading": "High Resolution Output",
                    "body": "Render crisp text and vivid graphics up to 300+ DPI."
          },
          {
                    "heading": "ZIP Batch Download",
                    "body": "Download all converted pages bundled neatly into a single ZIP archive."
          },
          {
                    "heading": "Flexible Quality Controls",
                    "body": "Fine-tune compression levels to balance image size and detail."
          },
          {
                    "heading": "Fast Client-Side Processing",
                    "body": "Processes pages in seconds directly inside your browser."
          }
],
        faqs: [
          {
                    "q": "Can I convert just one page of a PDF to JPG?",
                    "a": "Yes, specify individual page numbers or ranges to convert."
          },
          {
                    "q": "Are passwords supported?",
                    "a": "Yes, enter the document password to unlock and convert encrypted files."
          }
],
      },
    },
  },

  // PDF to PNG
  {
    slug: "pdf-to-png",
    name: "PDF to PNG",
    category: "PDF Tools",
    icon: FileImage,
    blurb: "Render and convert PDF pages into crystal-clear lossless PNG images with alpha channel support.",
    accepts: "PDF",
    outputs: "PNG Images",
    seo: {
      title: "PDF to PNG Online Free — Convert PDF Pages to Lossless PNG",
      description: "Convert PDF documents to lossless PNG images online for free. Crisp vector line rendering, transparent background support, and high DPI.",
      keywords: ["pdf to png","convert pdf to png","lossless pdf to png","high res pdf to png","save pdf page as png"],
      article: {
        intro: "PNG offers lossless image compression, ensuring lines, diagrams, and small fonts stay perfectly sharp without compression artifacts.",
        howTo: ["Upload your PDF file.","Choose resolution scale (1x, 2x for Retina, or 3x for print).","Select page ranges to render.","Download your lossless PNG image files."],
        benefits: [
          {
                    "heading": "Zero Compression Artifacts",
                    "body": "Lossless PNG prevents fuzzy halos around text and lines."
          },
          {
                    "heading": "Transparent Background Option",
                    "body": "Export pages with transparent backgrounds for graphic design use."
          },
          {
                    "heading": "Retina / Ultra HD Scale",
                    "body": "Generate 2x and 4x scale images for crisp 4K presentations."
          },
          {
                    "heading": "Batch Export",
                    "body": "Download all pages in one convenient ZIP folder."
          }
],
        faqs: [
          {
                    "q": "Why choose PNG over JPG?",
                    "a": "PNG preserves razor-sharp edges and supports transparency without compression noise."
          },
          {
                    "q": "Is there a limit on page count?",
                    "a": "You can convert documents with dozens of pages smoothly."
          }
],
      },
    },
  },

  // PDF to SVG
  {
    slug: "pdf-to-svg",
    name: "PDF to SVG",
    category: "PDF Tools",
    icon: FileCode,
    blurb: "Convert PDF vector graphics and text paths into scalable, editable SVG vector files.",
    accepts: "PDF",
    outputs: "SVG Vector Files",
    seo: {
      title: "PDF to SVG Online Free — Convert PDF Pages to Scalable Vector SVG",
      description: "Convert PDF pages to scalable vector SVG graphics online. Retains vector curves, editable text paths, and embedded fonts for web design.",
      keywords: ["pdf to svg","convert pdf to svg","pdf vector to svg","extract svg from pdf","pdf to scalable vector graphics"],
      article: {
        intro: "Convert PDF vector artwork and document pages into standard SVG files. Perfect for web design, Figma, Adobe Illustrator, and laser cutters.",
        howTo: ["Upload your vector PDF.","Choose the page you wish to convert to SVG.","Select font handling (embed as paths or preserve web fonts).","Download your scalable vector SVG file."],
        benefits: [
          {
                    "heading": "True Scalability",
                    "body": "Vector paths scale infinitely without pixelation or blur."
          },
          {
                    "heading": "Designer Friendly",
                    "body": "Open directly in Figma, Illustrator, Inkscape, or Canva."
          },
          {
                    "heading": "Clean Code Output",
                    "body": "Generates clean, semantic SVG markup with grouped elements."
          },
          {
                    "heading": "Web Ready",
                    "body": "Embed SVG graphics directly into HTML websites."
          }
],
        faqs: [
          {
                    "q": "Are text paths editable in Illustrator?",
                    "a": "Yes, text is retained as vector glyphs or editable font elements."
          },
          {
                    "q": "Can I convert blueprints to SVG for laser cutting?",
                    "a": "Yes, accurate scale and vector strokes are preserved for CAD and laser cutting."
          }
],
      },
    },
  },

  // PDF to TIFF
  {
    slug: "pdf-to-tiff",
    name: "PDF to TIFF",
    category: "PDF Tools",
    icon: FileImage,
    blurb: "Convert PDF documents into high-resolution, uncompressed multi-page TIFF files for archival.",
    accepts: "PDF",
    outputs: "TIFF Images",
    seo: {
      title: "PDF to TIFF Online Free — Convert PDF to Multi-Page TIFF",
      description: "Convert PDF documents to multi-page TIFF files online for free. Ideal for archival systems, government filings, faxes, and print shops.",
      keywords: ["pdf to tiff","convert pdf to tiff","multi-page tiff from pdf","pdf to tif online free","high resolution pdf to tiff"],
      article: {
        intro: "Convert PDF files into multi-page TIFF images compliant with archival, medical, and electronic court filing specifications.",
        howTo: ["Upload your PDF document.","Choose DPI resolution (200 DPI for fax, 300 DPI for archive, 600 DPI for print).","Select single multi-page TIFF or individual TIFF per page.","Download your standardized TIFF file."],
        benefits: [
          {
                    "heading": "Archival Standard",
                    "body": "Converts to uncompressed or LZW-compressed TIFFs suited for long-term storage."
          },
          {
                    "heading": "Multi-Page Packing",
                    "body": "Bundles all document pages into a single multi-page TIFF container."
          },
          {
                    "heading": "Accurate Color Depth",
                    "body": "Supports 24-bit RGB color, 8-bit grayscale, and 1-bit monochrome."
          },
          {
                    "heading": "Court & Fax Compliant",
                    "body": "Meets specifications for electronic filing and legacy fax networks."
          }
],
        faqs: [
          {
                    "q": "Will all pages be in one file?",
                    "a": "Yes, you can generate a single multi-page TIFF containing every page."
          },
          {
                    "q": "What compression methods are supported?",
                    "a": "LZW, PackBits, CCITT Group 4, and uncompressed TIFF."
          }
],
      },
    },
  },

  // PDF to DOCX
  {
    slug: "pdf-to-docx",
    name: "PDF to DOCX",
    category: "PDF Tools",
    icon: FileText,
    blurb: "Convert PDF documents into fully editable Microsoft Word (.docx) files with paragraphs and tables.",
    accepts: "PDF",
    outputs: "Word (.docx)",
    seo: {
      title: "PDF to DOCX Online Free — Convert PDF to Editable Word Document",
      description: "Convert PDF to editable Word .docx files online for free. Accurately extracts paragraphs, tables, columns, and formatting with OCR.",
      keywords: ["pdf to docx","convert pdf to docx","pdf to word online free","editable docx from pdf","pdf to docx converter with ocr"],
      article: {
        intro: "Convert PDF files into fully editable Microsoft Word (.docx) documents. Edit text, adjust tables, and modify layouts without re-typing from scratch.",
        howTo: ["Upload the PDF document you need to edit.","Choose layout mode (Flowing Text for easy editing or Exact Layout).","Click Convert to DOCX.","Open and edit your new Word file."],
        benefits: [
          {
                    "heading": "Fully Editable Text",
                    "body": "Turn static PDF pages into editable Word paragraphs with natural word wrap."
          },
          {
                    "heading": "Table Reconstruction",
                    "body": "Detects tabular rows and columns and converts them into native Word tables."
          },
          {
                    "heading": "OCR for Scanned PDFs",
                    "body": "Recognizes text in scanned contracts, receipts, and old documents."
          },
          {
                    "heading": "Preserves Font Styling",
                    "body": "Retains bold, italics, font sizes, headings, and alignments."
          }
],
        faqs: [
          {
                    "q": "Can I edit the converted file in Google Docs?",
                    "a": "Yes, the standard .docx output opens seamlessly in Word, Google Docs, and LibreOffice."
          },
          {
                    "q": "How accurate is the table conversion?",
                    "a": "Our layout engine detects cell boundaries and preserves numerical data accurately."
          }
],
      },
    },
  },

  // PDF to PPTX
  {
    slug: "pdf-to-pptx",
    name: "PDF to PPTX",
    category: "PDF Tools",
    icon: Presentation,
    blurb: "Convert PDF slides into editable PowerPoint (.pptx) presentations with preserved layouts.",
    accepts: "PDF",
    outputs: "PowerPoint (.pptx)",
    seo: {
      title: "PDF to PPTX Online Free — Convert PDF Slides to PowerPoint Deck",
      description: "Convert PDF slides to editable PowerPoint .pptx presentations online. Extract text boxes, images, and slide shapes into customizable slides.",
      keywords: ["pdf to pptx","convert pdf to pptx","pdf to powerpoint free","pdf slides to pptx online","editable presentation from pdf"],
      article: {
        intro: "Need to update a presentation only available as a PDF? Convert it into an editable Microsoft PowerPoint (.pptx) deck with distinct slides.",
        howTo: ["Upload your presentation PDF.","Wait while slide layouts and text boxes are reconstructed.","Click Convert to PPTX.","Download and open your presentation in PowerPoint or Keynote."],
        benefits: [
          {
                    "heading": "Slide-by-Slide Separation",
                    "body": "Every PDF page maps directly to a discrete, editable presentation slide."
          },
          {
                    "heading": "Editable Text & Shapes",
                    "body": "Update figures, tweak bullets, and replace images directly in PowerPoint."
          },
          {
                    "heading": "16:9 & 4:3 Preservation",
                    "body": "Maintains original presentation aspect ratios and background layouts."
          },
          {
                    "heading": "Fast & Free",
                    "body": "Revive and polish presentations in seconds without software lock-in."
          }
],
        faqs: [
          {
                    "q": "Are slide backgrounds editable?",
                    "a": "Yes, backgrounds and visual elements are separated for easy editing."
          },
          {
                    "q": "Can I present in Google Slides?",
                    "a": "Yes, the exported .pptx file uploads directly into Google Slides."
          }
],
      },
    },
  },

  // PDF to XLSX
  {
    slug: "pdf-to-xlsx",
    name: "PDF to XLSX",
    category: "PDF Tools",
    icon: FileSpreadsheet,
    blurb: "Extract tables and tabular data from PDF files into editable Excel (.xlsx) spreadsheets.",
    accepts: "PDF",
    outputs: "Excel (.xlsx)",
    seo: {
      title: "PDF to XLSX Online Free — Convert PDF Tables to Excel Spreadsheet",
      description: "Extract tables from PDF to editable Excel .xlsx sheets online for free. Accurate column detection, formula preservation, and zero data loss.",
      keywords: ["pdf to xlsx","convert pdf to xlsx","extract tables from pdf","pdf to excel spreadsheet free","pdf data to xlsx"],
      article: {
        intro: "Stop manually re-typing financial tables, bank statements, and invoices from PDFs. Extract clean, structured Excel (.xlsx) spreadsheets instantly.",
        howTo: ["Upload your PDF with tables or financial statements.","Choose table detection mode (Automatic or Guided Grid).","Click Convert to XLSX.","Download your spreadsheet with editable numbers and formulas."],
        benefits: [
          {
                    "heading": "Flawless Table Extraction",
                    "body": "Recognizes row and column boundaries without misaligned cells."
          },
          {
                    "heading": "Numeric Data Preservation",
                    "body": "Preserves numbers as true numeric values ready for SUM and formulas."
          },
          {
                    "heading": "Multi-Page Statements",
                    "body": "Consolidates multi-page bank statements into a continuous table."
          },
          {
                    "heading": "Secure Financial Processing",
                    "body": "No sensitive financial data is stored on external servers."
          }
],
        faqs: [
          {
                    "q": "Are numbers formatted correctly for formulas?",
                    "a": "Yes, numbers and decimals are stored as raw numbers rather than strings."
          },
          {
                    "q": "Can it handle scanned receipts or bank statements?",
                    "a": "Yes, integrated OCR reads numerical tables from scanned documents."
          }
],
      },
    },
  },

  // PDF to ODT
  {
    slug: "pdf-to-odt",
    name: "PDF to ODT",
    category: "PDF Tools",
    icon: FileText,
    blurb: "Convert PDF documents into editable OpenDocument Text (.odt) format for LibreOffice Writer.",
    accepts: "PDF",
    outputs: "ODT Document",
    seo: {
      title: "PDF to ODT Online Free — Convert PDF to LibreOffice Writer (.odt)",
      description: "Convert PDF files to OpenDocument Text (.odt) format online for free. Ideal for editing documents in LibreOffice Writer and Apache OpenOffice.",
      keywords: ["pdf to odt","convert pdf to odt","pdf to libreoffice writer","pdf to opendocument text","editable odt from pdf"],
      article: {
        intro: "Convert static PDF documents into editable OpenDocument Text (.odt) files compatible with LibreOffice Writer, OpenOffice, and AbiWord.",
        howTo: ["Upload your PDF document.","Choose text reflow settings and formatting preferences.","Click Convert to ODT.","Download and open your document in LibreOffice."],
        benefits: [
          {
                    "heading": "Open Source Native",
                    "body": "Generates clean OASIS OpenDocument XML compliant with open standards."
          },
          {
                    "heading": "Editable Layouts",
                    "body": "Edit text, headings, headers, and bullet lists with native formatting."
          },
          {
                    "heading": "Privacy Focused",
                    "body": "Files are handled client-side with immediate memory purging."
          },
          {
                    "heading": "100% Free",
                    "body": "No subscription required to convert documents."
          }
],
        faqs: [
          {
                    "q": "Is the output compatible with Apache OpenOffice?",
                    "a": "Yes, fully compliant with both LibreOffice and OpenOffice."
          },
          {
                    "q": "Are embedded images preserved?",
                    "a": "Yes, images remain in their original positions with correct wrapping."
          }
],
      },
    },
  },

  // PDF to ODS
  {
    slug: "pdf-to-ods",
    name: "PDF to ODS",
    category: "PDF Tools",
    icon: FileSpreadsheet,
    blurb: "Extract tabular data from PDF files into OpenDocument Spreadsheet (.ods) for LibreOffice Calc.",
    accepts: "PDF",
    outputs: "ODS Spreadsheet",
    seo: {
      title: "PDF to ODS Online Free — Convert PDF Tables to LibreOffice Calc (.ods)",
      description: "Extract data and tables from PDF to OpenDocument Spreadsheet (.ods) format online. Seamless integration with LibreOffice Calc and OpenOffice.",
      keywords: ["pdf to ods","convert pdf to ods","pdf to libreoffice calc","extract pdf to ods","opendocument spreadsheet from pdf"],
      article: {
        intro: "Extract tabular data from PDF files into OpenDocument Spreadsheet (.ods) workbooks for LibreOffice Calc. Keep formulas and columns aligned.",
        howTo: ["Upload your PDF containing data tables.","Select table detection options.","Click Convert to ODS.","Download your spreadsheet ready to open in Calc."],
        benefits: [
          {
                    "heading": "LibreOffice Calc Ready",
                    "body": "Open extracted data natively in open source spreadsheet tools."
          },
          {
                    "heading": "Accurate Column Separation",
                    "body": "Aligns numbers and text into proper rows and columns."
          },
          {
                    "heading": "Multi-Page Extraction",
                    "body": "Merges consecutive pages into organized worksheets."
          },
          {
                    "heading": "Zero Cost",
                    "body": "Convert unlimited PDF documents for free."
          }
],
        faqs: [
          {
                    "q": "Can I use Calc formulas on the output?",
                    "a": "Yes, numbers are stored with correct numeric types for immediate calculations."
          },
          {
                    "q": "Can I open the ODS file in Excel?",
                    "a": "Yes, Microsoft Excel can also open and edit modern .ods files."
          }
],
      },
    },
  },

  // PDF to ODP
  {
    slug: "pdf-to-odp",
    name: "PDF to ODP",
    category: "PDF Tools",
    icon: Presentation,
    blurb: "Convert PDF pages into editable OpenDocument Presentation (.odp) slides for LibreOffice Impress.",
    accepts: "PDF",
    outputs: "ODP Presentation",
    seo: {
      title: "PDF to ODP Online Free — Convert PDF to LibreOffice Impress (.odp)",
      description: "Convert PDF slides to OpenDocument Presentation (.odp) format online. Edit slide titles, bullets, and graphics in LibreOffice Impress.",
      keywords: ["pdf to odp","convert pdf to odp","pdf to libreoffice impress","pdf to opendocument presentation","editable odp from pdf"],
      article: {
        intro: "Convert PDF presentations into editable OpenDocument Presentation (.odp) files for LibreOffice Impress without vendor lock-in.",
        howTo: ["Upload your PDF presentation.","Wait while pages are mapped into separate slide canvases.","Click Convert to ODP.","Download your editable .odp deck."],
        benefits: [
          {
                    "heading": "Discrete Slide Mapping",
                    "body": "Each PDF page becomes an individual editable presentation slide."
          },
          {
                    "heading": "Open Standard",
                    "body": "Share and edit presentations freely using open source office suites."
          },
          {
                    "heading": "Editable Graphics",
                    "body": "Modify shapes, diagrams, and text blocks directly."
          },
          {
                    "heading": "Safe & Private",
                    "body": "Processed locally without permanent server storage."
          }
],
        faqs: [
          {
                    "q": "Will slide proportions be preserved?",
                    "a": "Yes, widescreen and standard proportions are accurately maintained."
          },
          {
                    "q": "Can I open the ODP file in PowerPoint?",
                    "a": "Yes, modern Microsoft PowerPoint versions can open and save ODP files."
          }
],
      },
    },
  },

  // PDF to RTF
  {
    slug: "pdf-to-rtf",
    name: "PDF to RTF",
    category: "PDF Tools",
    icon: FileText,
    blurb: "Convert PDF documents into cross-platform Rich Text Format (.rtf) preserving formatting.",
    accepts: "PDF",
    outputs: "RTF Document",
    seo: {
      title: "PDF to RTF Online Free — Convert PDF to Rich Text Format",
      description: "Convert PDF files to editable Rich Text Format (.rtf) online for free. Compatible with WordPad, TextEdit, Microsoft Word, and all word processors.",
      keywords: ["pdf to rtf","convert pdf to rtf","pdf to rich text format","editable rtf from pdf","pdf to rtf converter free"],
      article: {
        intro: "Rich Text Format (.rtf) is universally compatible across all operating systems. Convert your PDF files into lightweight, editable RTF documents.",
        howTo: ["Upload your PDF file.","Choose text extraction and formatting retention mode.","Click Convert to RTF.","Download and open your document in any text editor."],
        benefits: [
          {
                    "heading": "Universal Word Processor Support",
                    "body": "Opens in WordPad, TextEdit, LibreOffice, Pages, and Microsoft Word."
          },
          {
                    "heading": "Preserves Font Formatting",
                    "body": "Retains bold, italics, font colors, bullet lists, and paragraphs."
          },
          {
                    "heading": "Compact File Size",
                    "body": "Generates clean, lightweight documents without bulky metadata."
          },
          {
                    "heading": "No Software Needed",
                    "body": "Convert directly inside your web browser on any device."
          }
],
        faqs: [
          {
                    "q": "Can I open the RTF file in WordPad?",
                    "a": "Yes, standard Windows WordPad can open and edit the output without issues."
          },
          {
                    "q": "Are images preserved in RTF?",
                    "a": "Yes, embedded graphics are included within the RTF stream."
          }
],
      },
    },
  },
];

export const getTool = (slug: string) => tools.find((t) => t.slug === slug);
