export type KarudiTier = "prime-1.0";
export type KrishnaTier = KarudiTier;

export const karudiModels = [
  {
    id: "prime-1.0" as const,
    name: "Prime 1.0",
    fullName: "Karudi 1.0 Prime",
    badge: "Flagship",
    isPremium: false,
    blurb: "Unified flagship multimodal AI engine for deep image editing, document analysis & smart queries.",
  },
];

export const krishnaModels = karudiModels;

export const karudiName = () => "Karudi 1.0 Prime";

export const krishnaName = karudiName;

export const acceptedChatFiles =
  "application/pdf,image/*,text/plain,text/csv,text/markdown," +
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document," +
  "application/msword," +
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet," +
  "application/vnd.ms-excel," +
  "application/vnd.openxmlformats-officedocument.presentationml.presentation," +
  "application/vnd.ms-powerpoint";
