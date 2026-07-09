// data/font.ts

import localFont from "next/font/local";

// ------------------------------------------------------------
// 1. Unity-compatible numeric enum
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// 2. Human-readable display names
// ------------------------------------------------------------
export const FONT_DISPLAY_NAMES: Record<EFont, string> = {
    [EFont.Anton]: "Anton",
    [EFont.Banger]: "Bangers",
    [EFont.Electronic]: "Electronic Highway Sign",
    [EFont.Liberation]: "Liberation Sans",
    [EFont.Manuka]: "Manuka Bold",
    [EFont.Oswald]: "Oswald Bold",
    [EFont.Roboto]: "Roboto Bold",
    [EFont.SFProDisplay]: "SF Pro Display",
    [EFont.CenturyGoth]: "Century Gothic",
    [EFont.CenturyGothBold]: "Century Gothic Bold",
};

// ------------------------------------------------------------
// 3. Dropdown options (UI uses strings)
// ------------------------------------------------------------
export const FONT_OPTIONS = Object.values(EFont)
    .filter((v) => typeof v === "number")
    .map((value) => ({
        label: FONT_DISPLAY_NAMES[value as EFont],
        value: String(value),
    }));

// ------------------------------------------------------------
// 4. Local Next.js font loaders
// ------------------------------------------------------------
const AntonFont = localFont({
    src: "../fonts/Anton.ttf",
    weight: "400",
    style: "normal",
});

const BangersFont = localFont({
    src: "../fonts/Bangers.ttf",
    weight: "400",
    style: "normal",
});

const ElectronicFont = localFont({
    src: "../fonts/Electronic Highway Sign.ttf",
    weight: "400",
    style: "normal",
});

const LiberationFont = localFont({
    src: "../fonts/LiberationSans.ttf",
    weight: "400",
    style: "normal",
});

const ManukaFont = localFont({
    src: "../fonts/Manuka-Bold.otf",
    weight: "700",
    style: "normal",
});

const OswaldFont = localFont({
    src: "../fonts/Oswald-Bold.ttf",
    weight: "700",
    style: "normal",
});

const RobotoFont = localFont({
    src: "../fonts/Roboto-Bold.ttf",
    weight: "700",
    style: "normal",
});

const SFProDisplayFont = localFont({
    src: "../fonts/SFPRODISPLAYREGULAR.otf",
    weight: "400",
    style: "normal",
});

const CenturyGothFont = localFont({
    src: "../fonts/century-gothic-regular.ttf",
    weight: "400",
    style: "normal",
});

const CenturyGothBoldFont = localFont({
    src: "../fonts/century-gothic-bold.ttf",
    weight: "700",
    style: "normal",
});

// ------------------------------------------------------------
// 5. Typed registry mapping Unity enum → Next.js font loader
// ------------------------------------------------------------
export const NextJsFontMap: Record<EFont, any> = {
    [EFont.Anton]: AntonFont,
    [EFont.Banger]: BangersFont,
    [EFont.Electronic]: ElectronicFont,
    [EFont.Liberation]: LiberationFont,
    [EFont.Manuka]: ManukaFont,
    [EFont.Oswald]: OswaldFont,
    [EFont.Roboto]: RobotoFont,
    [EFont.SFProDisplay]: SFProDisplayFont,
    [EFont.CenturyGoth]: CenturyGothFont,
    [EFont.CenturyGothBold]: CenturyGothBoldFont,
};

// ------------------------------------------------------------
// 6. Unified API for Next.js components
// ------------------------------------------------------------
export function getFontInfo(fontValue: number) {
    const enumKey = fontValue as EFont;

    return {
        enum: enumKey,
        name: FONT_DISPLAY_NAMES[enumKey],
        nextFont: NextJsFontMap[enumKey],
        optionValue: String(enumKey),
        className: NextJsFontMap[enumKey]?.className ?? "",
        style: NextJsFontMap[enumKey]?.style ?? {},
    };
}
