import { Crown, Scissors, RefreshCw, Sparkles, BookOpen, type LucideIcon } from "lucide-react";

export type BgModel = {
  id: string;
  name: string;
  specialty: string;
  icon: LucideIcon;
  quality: string;
  blurb: string;
  traits: string[];
};

export const bgModels: BgModel[] = [
  {
    id: "karudi",
    name: "Karudi 1.0 Prime",
    specialty: "Universal Master Orchestrator",
    icon: Crown,
    quality: "Universal Multi-Model Engine",
    blurb:
      "Our universal master engine that intelligently routes and orchestrates all specialized models (Ganga, Brahmaputra, Narmada, Saraswati) according to your exact task to deliver the best result.",
    traits: [
      "Universal intelligent task routing",
      "Multi-model pipeline coordination",
      "Dynamic cross-model synthesis",
      "Adaptive output optimization",
    ],
  },
  {
    id: "ganga",
    name: "Ganga",
    specialty: "Background Removal Process",
    icon: Scissors,
    quality: "Sub-Pixel Alpha Cutout Engine",
    blurb:
      "Dedicated neural background removal engine specialized in subject isolation, fine edge reconstruction, flyaway hair preservation, and clean transparent cutouts.",
    traits: [
      "Sub-pixel alpha matting",
      "Fine hair, fur & edge retention",
      "Motion blur & low-light subject recovery",
      "4K transparent PNG generation",
    ],
  },
  {
    id: "brahmaputra",
    name: "Brahmaputra",
    specialty: "Format Conversion & Transformation",
    icon: RefreshCw,
    quality: "Ultra-Fast Media Transcoding",
    blurb:
      "High-speed conversion engine built for converting images and media formats (e.g. Convert to JPG, PNG, WebP, AVIF), color profile preservation, and bulk optimization.",
    traits: [
      "Universal format conversion (JPG/PNG/WebP)",
      "Balanced & lossless compression",
      "High-throughput batch conversions",
      "sRGB & P3 color fidelity",
    ],
  },
  {
    id: "narmada",
    name: "Narmada",
    specialty: "Processing & Generative Outputs",
    icon: Sparkles,
    quality: "OCR, AI Summary & Meme Generation",
    blurb:
      "Versatile processing engine delivering diverse smart outputs: multilingual OCR text extraction from images, automated AI summarization, and creative meme generation.",
    traits: [
      "Multilingual OCR text extraction",
      "Intelligent AI text & doc summarization",
      "Contextual meme & caption generator",
      "Structured output formatting",
    ],
  },
  {
    id: "saraswati",
    name: "Saraswati",
    specialty: "Research & Deep Knowledge Suite",
    icon: BookOpen,
    quality: "Analytical Query & Insight Engine",
    blurb:
      "Advanced research engine tailored for deep knowledge queries, document interrogation, structured analytical insights, and factual data extraction.",
    traits: [
      "Deep research & query investigation",
      "Document interrogation & Q&A",
      "Factual data & citation synthesis",
      "Structured knowledge reporting",
    ],
  },
];
