import { Crown, Aperture, Package, User, Wand2, type LucideIcon } from "lucide-react";

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
    specialty: "Flagship Master Engine",
    icon: Crown,
    quality: "Unified Ultra-High Precision Prime Model",
    blurb:
      "Our flagship Karudi 1.0 Prime neural engine combining sub-pixel hair matting, 4K studio clarity, e-commerce product precision, and low-light recovery into a single supreme pass.",
    traits: [
      "Karudi 1.0 Prime intelligence",
      "Sub-pixel alpha matting",
      "4K Ultra-HD precision",
      "Zero-loss edge preservation",
    ],
  },
  {
    id: "ganga",
    name: "Ganga",
    specialty: "Blurry image clean",
    icon: Aperture,
    quality: "Finds an edge where there isn't one",
    blurb:
      "Trained on motion blur, low light and soft focus. Reconstructs a believable boundary instead of chewing into the subject.",
    traits: ["Motion-blur aware", "Low-light recovery", "Deconvolution pass built in"],
  },
  {
    id: "brahmaputra",
    name: "Brahmaputra",
    specialty: "Object & product",
    icon: Package,
    quality: "Catalogue-grade hard edges",
    blurb:
      "Razor-clean silhouettes for e-commerce: reflective packaging, glassware, jewellery and shadow separation done properly.",
    traits: ["Reflection & glass handling", "Contact-shadow keep or drop", "Straight-line fidelity"],
  },
  {
    id: "narmada",
    name: "Narmada",
    specialty: "Human subjects",
    icon: User,
    quality: "Every strand of hair survives",
    blurb:
      "A matting model tuned entirely on people — flyaway hair, fur collars, lace and skin edges against busy backdrops.",
    traits: ["Strand-level hair matting", "Skin-tone safe", "Group photo support"],
  },
  {
    id: "saraswati",
    name: "Saraswati",
    specialty: "Add effects",
    icon: Wand2,
    quality: "Cut out, then art-direct",
    blurb:
      "Removes the background and immediately restyles it — studio gradients, soft shadows, glow, colour grading and backdrops.",
    traits: ["Auto drop shadow", "Studio backdrop presets", "Relight & colour grade"],
  },
];
