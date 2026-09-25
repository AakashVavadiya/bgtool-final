export type KarudiTier =
  | "prime-1.0"
  | "ganga-matting"
  | "brahmaputra-transcode"
  | "narmada-vision"
  | "saraswati-deep";

export type KrishnaTier = KarudiTier;

export interface KarudiModelInfo {
  id: KarudiTier;
  name: string;
  fullName: string;
  badge: string;
  iconType: "karudi" | "ganga" | "brahmaputra" | "narmada" | "saraswati";
  blurb: string;
  capabilities: string[];
}

export const karudiModels: KarudiModelInfo[] = [
  {
    id: "prime-1.0",
    name: "Karudi 1.0 Prime",
    fullName: "Karudi 1.0 Prime (Master Orchestrator)",
    badge: "Flagship",
    iconType: "karudi",
    blurb: "Universal proprietary master model. Analyzes intent, coordinates specialized engines, and handles conversational intelligence.",
    capabilities: ["Universal Routing", "Workflow Automation", "Smart Conversions"],
  },
  {
    id: "ganga-matting",
    name: "Ganga 1.0",
    fullName: "Ganga 1.0 (Alpha Matting & Cutout)",
    badge: "Matting",
    iconType: "ganga",
    blurb: "Proprietary neural alpha matting model specialized for sub-pixel boundary refinement, hair preservation, and clean background removal.",
    capabilities: ["Sub-pixel Alpha Matting", "Transparent Cutout", "Edge Smoothing"],
  },
  {
    id: "brahmaputra-transcode",
    name: "Brahmaputra 1.0",
    fullName: "Brahmaputra 1.0 (Media & Document Transcoder)",
    badge: "Transcoder",
    iconType: "brahmaputra",
    blurb: "High-throughput transcoding engine for loss-free conversions across PDF, Word (.docx), JPG, PNG, and WebP.",
    capabilities: ["PDF Generation & Extraction", "Word (.docx) Compilation", "Image Transcoding"],
  },
  {
    id: "narmada-vision",
    name: "Narmada 1.0",
    fullName: "Narmada 1.0 (Vision & Neural OCR)",
    badge: "Vision / OCR",
    iconType: "narmada",
    blurb: "Multilingual neural OCR and document intelligence engine for extracting structured text from images, scans, and documents.",
    capabilities: ["Multilingual OCR", "Text Extraction", "Document Layout Parsing"],
  },
  {
    id: "saraswati-deep",
    name: "Saraswati 1.0",
    fullName: "Saraswati 1.0 (Research & Palette Analysis)",
    badge: "Analysis",
    iconType: "saraswati",
    blurb: "Deep inspection model for chromatic analysis, dominant color palette extraction, and image metadata profiling.",
    capabilities: ["Color Palette Extraction", "Deep Analysis", "Metadata Profiling"],
  },
];

export const krishnaModels = karudiModels;

export const karudiName = () => "Karudi 1.0 Prime";
export const krishnaName = karudiName;

const STORAGE_KEY_SELECTED_TIER = "bg.karudi.selected_tier.v2";

export function getStoredTier(): KarudiTier {
  if (typeof window === "undefined") return "prime-1.0";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_SELECTED_TIER) as KarudiTier | null;
    return raw && karudiModels.some((m) => m.id === raw) ? raw : "prime-1.0";
  } catch {
    return "prime-1.0";
  }
}

export function setStoredTier(tier: KarudiTier) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY_SELECTED_TIER, tier);
  } catch {
    // storage full or unavailable
  }
}

export const acceptedChatFiles =
  "application/pdf,image/*,text/plain,text/csv,text/markdown," +
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document," +
  "application/msword," +
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet," +
  "application/vnd.ms-excel," +
  "application/vnd.openxmlformats-officedocument.presentationml.presentation," +
  "application/vnd.ms-powerpoint";
