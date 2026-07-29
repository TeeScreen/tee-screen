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
    "image/png": [".png"],

    "application/pdf": [".pdf"],
    "text/csv": [".csv"],

    "video/mp4": [".mp4"],
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const UPLOAD_DIR = "tmp";

const SERVER_URL = "https://teescreenapp.com/Server";


export { ALLOWED_TYPES, MAX_FILE_SIZE, UPLOAD_DIR, SERVER_URL };
