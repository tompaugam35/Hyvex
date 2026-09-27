import type { Qualite } from "@/types";

export const qualiteInfo: Record<
  Qualite,
  { label: string; colorVar: string; className: string }
> = {
  course: {
    label: "Course",
    colorVar: "--running",
    className: "bg-running/15 text-running",
  },
  muscu: {
    label: "Musculation",
    colorVar: "--strength",
    className: "bg-strength/15 text-strength",
  },
  explosivite: {
    label: "Explosivité",
    colorVar: "--power",
    className: "bg-power/15 text-power",
  },
};
