export type OverlayType =
    | 'image'
    | 'url'
    | 'vid'
    | 'pdf'
    | 'full'
    | 'fbUrl'
    | 'fbImg'
    | 'fbPdf'
    | 'ssImage'
    | 'ssVid'
    | 'golfHole';

export interface OverlayContent {
    type: OverlayType;
    src: string;
    hole ?: GolfHole;
    tees?: TeeSettings;
}


export interface TeeSettings {
    TeeColourWhite:{r:number,g:number,b:number,a:number},
    TeeColourYellow:{r:number,g:number,b:number,a:number},
    TeeColourRed:{r:number,g:number,b:number,a:number},
}

export interface GolfHole {
    holeNumber: number;
    holePointLatLong: {
        x: number;
        y: number;
    };
    whiteTeePointLatLong: {
        x: number;
        y: number;
    };
    redTeePointLatLong: {
        x: number;
        y: number;
    };
    yellowTeePointLatLong: {
        x: number;
        y: number;
    };
    yardsToHole: number;
    redYardsToHole: number;
    yellowYardsToHole: number;
    whiteYardsToHole: number;
    parNumber: number;
    siNumber: number;
}


export interface TabItem {
    active: boolean;
    name: string;
    icon?: string | null;
    overlayImage?: string | null;
    urlActive?: boolean;
    url?: string;
}

export interface NoticeColor {
    r: number;
    g: number;
    b: number;
    a: number;
    [key: string]: number | undefined;
}

export interface NoticeItem {
    active: boolean;
    text: string;
    color: NoticeColor;
    interactive?: boolean;
    urlActive?: boolean;
    url?: string;
    image?: string | null;
}

export interface ScheduleEntry {
    start: string;
    end: string;
    topNotice?: string;
    topColour?: NoticeColor | Record<string, unknown>;
    middleNotice?: string;
    middleColour?: NoticeColor | Record<string, unknown>;
    bottomNotice?: string;
    bottomColour?: NoticeColor | Record<string, unknown>;
}

export interface PreviewImages {
    backgroundImage: string | null;
    overviewImage: string | null;
    logoImage: string | null;
    homeBG: string | null;
    awayBG: string | null;
    lineUpBG: string | null;
    hideScoreBG: string | null;
    fanGuidePDF: string | null;
    backupBG: string;
}

export interface PreviewUiConfig {
    uiColor: string;
    textColor: string;
    font: string;
    brightness: number;
    showTopSection: boolean;
    setTabIconsToFill: boolean;
    isFootballClub: boolean;
    isGolfClub: boolean;
    hideHolesOnScreen: boolean;
    hideMatchCentre: boolean;
    replaceNews: boolean;
    footballNews: string;
}
