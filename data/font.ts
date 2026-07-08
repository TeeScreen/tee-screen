// data/font.ts

export enum EFont {
    Anton,
    Banger,
    Electronic,
    Liberation,
    Manuka,
    Oswald,
    Roboto,
    SFProDisplay,
    CenturyGoth,
    CenturyGothBold,
}

// Display names for UI
export const FONT_DISPLAY_NAMES: Record<EFont, string> = {
    [EFont.Anton]: "Anton",
    [EFont.Banger]: "Banger",
    [EFont.Electronic]: "Electronic",
    [EFont.Liberation]: "Liberation",
    [EFont.Manuka]: "Manuka",
    [EFont.Oswald]: "Oswald",
    [EFont.Roboto]: "Roboto",
    [EFont.SFProDisplay]: "SF Pro Display",
    [EFont.CenturyGoth]: "Century Gothic",
    [EFont.CenturyGothBold]: "Century Gothic Bold",
};

// Options for dropdown
export const FONT_OPTIONS = Object.values(EFont)
    .filter((v) => typeof v === "number")
    .map((value) => ({
        label: FONT_DISPLAY_NAMES[value as EFont],
        value: String(value), // <-- FIX: SelectField requires string
    }));


// Placeholder for Next.js font assets (added later)
export const NextJsFontMap: Record<EFont, any> = {
    [EFont.Anton]: null,
    [EFont.Banger]: null,
    [EFont.Electronic]: null,
    [EFont.Liberation]: null,
    [EFont.Manuka]: null,
    [EFont.Oswald]: null,
    [EFont.Roboto]: null,
    [EFont.SFProDisplay]: null,
    [EFont.CenturyGoth]: null,
    [EFont.CenturyGothBold]: null,
};
