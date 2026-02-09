export const NAV_ITEMS = [
    { href: '/', label: 'Dashboard' },
    { href: '/search', label: 'Search' },
    { href: '/screensavers', label: 'Screensavers' },
    { href: '/logo', label: 'Logo' },
    { href: '/overview', label: 'Overview' },
    { href: '/notices', label: 'Notices' },
    { href: '/custom-tabs', label: 'Custom Tabs' },
];

export const CLUB_TYPES = [
    { value: 'Padel', label: 'Padel' },
    { value: 'Golf', label: 'Golf' },
    { value: 'Football', label: 'Football' },
    { value: 'Rugby', label: 'Rugby' },
    { value: 'Leisure', label: 'Leisure' },
    { value: 'Other', label: 'Other' },
];

const ALLOWED_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
    "image/svg+xml": [".svg"],

    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
    ],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
    ],
    "text/plain": [".txt"],
    "text/csv": [".csv"],

    "application/zip": [".zip"],
    "application/x-rar-compressed": [".rar"],
    "application/x-zip-compressed": [".zip"],
    "application/octet-stream": [".zip"],

    "audio/mpeg": [".mp3"],
    "audio/wav": [".wav"],

    "video/mp4": [".mp4"],
    "video/webm": [".webm"],
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const UPLOAD_DIR = "tmp";

export { ALLOWED_TYPES, MAX_FILE_SIZE, UPLOAD_DIR };
