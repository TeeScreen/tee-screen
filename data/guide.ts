import {
    BookOpen,
    Calendar,
    Copy, Eye,
    FileCheck, Flag,
    ImageUp, LandPlot,
    Layers,
    Monitor, NotebookPen, NotebookTabs,
    PanelTopBottomDashed,
    RefreshCw, Trophy,
    Users,
    Wallpaper
} from "lucide-react";

export interface DocumentationGuide {
    id: string;
    category: "essentials" | "styling" | "content" | "sports" | "account";
    title: string;
    subtitle: string;
    icon: any;
    targetUrl?: string;
    pdfGuide?: {
        title: string;
        src: string;
        description?: string;
    };
    steps: string[];
    tips?: string;
}


export const GUIDES_DATA: DocumentationGuide[] = [
    {
        id: "first-time-setup",
        category: "essentials",
        title: "First-Time Setup: Adding & Connecting Your First Screen Account",
        subtitle: "Complete step-by-step guide for new users who have just created their account and need to connect screen credentials.",
        icon: Monitor,
        targetUrl: "/pages/settings",
        pdfGuide: {
            title: "Add and Load Accounts",
            src: "/guides/AddAndLoadAccountForEditing.pdf",
            description: "Official PDF manual for connecting screen login credentials.",
        },
        steps: [
            "Sign in to your newly created TeeScreen user account.",
            "Navigate to Account Settings via Pages -> Account Settings in the left sidebar menu.",
            "Scroll down to the 'Screen Accounts' section card.",
            "Click the 'Add New Screen' button to open the credential modal.",
            "Enter your assigned TeeScreen Account Login name and Screen Password.",
            "Click 'Connect Account'. Your account will automatically load as your Active Screen Login.",
            "Head to Screens Home (/dashboard/home) to select your screen display and begin customizing your visuals!",
        ],
        tips: "If you don't have screen login credentials yet, contact your club administrator or use the Contact Us page.",
    },
    {
        id: "load-accounts",
        category: "essentials",
        title: "Selecting & Loading Accounts for Editing",
        subtitle: "Learn how to choose and activate screens for editing across multiple accounts.",
        icon: Layers,
        targetUrl: "/dashboard/home",
        pdfGuide: {
            title: "Add and Load Accounts",
            src: "/guides/AddAndLoadAccountForEditing.pdf",
            description: "Step-by-step PDF manual on loading and switching screen accounts.",
        },
        steps: [
            "Navigate to the Screens home dashboard from the sidebar menu.",
            "Select your club or account from the Account Switcher dropdown at the centre of the screen.",
            "Click 'Load Screen' on the selected screen card to begin editing.",
            "Confirm the preview shows your target screen in right side preview.",
        ],
        tips: "Ensure you have proper the proper account loaded. Try reloading the account from the account settings if your screen still isn't appearing",
    },
    {
        id: "copy-screens",
        category: "essentials",
        title: "Copying Screen Settings: 'Current Changes' vs 'Full Screen'",
        subtitle: "Understand how to copy draft edits or duplicate full screen templates across multiple displays.",
        icon: Copy,
        targetUrl: "/dashboard/home",
        steps: [
            "Click 'Copy Current Screen to...' from the screen management actions.",
            "Select 'Current Changes' mode if you ONLY want to copy recent uncommitted draft edits (such as a notice or message update) to target screens without altering their base background or logo.",
            "Select 'Full Screen' mode if you want to completely overwrite target screens with the full configuration (logo, wallpaper, UI elements, notices, tabs, screensavers).",
            "Check off one or multiple destination screens from the target list.",
            "Click 'Preview' to verify the layout, then apply changes to broadcast to target screens.",
        ],
        tips: "Use 'Current Changes' when updating daily notices across all displays without wiping each screen's unique styling.",
    },
    {
        id: "file-upload-formats",
        category: "essentials",
        title: "File Upload Formats & Conversion Guidelines",
        subtitle: "Strict rules for media uploads (.png, .mp4, .pdf) and avoiding file extension corruption.",
        icon: FileCheck,
        targetUrl: "/dashboard/background",
        steps: [
            "Supported Formats: TeeScreen ONLY accepts PNG (.png) for images/graphics, MP4 (.mp4) for video loops, and PDF (.pdf) for documents/schedules.",
            "IMPORTANT CONVERSION WARNING: You CANNOT simply rename a file extension (e.g. changing 'image.jpg' or 'video.mov' to 'image.png' or 'video.mp4' in file explorer). Renaming the extension does NOT re-encode the file data.",
            "Renamed files with fake extensions will fail to decode on TV displays and render broken black screens.",
            "To convert images properly: Open the file in an image editor (Canva, Photoshop, Paint, Preview) and select 'Export as PNG'.",
            "To convert videos properly: Export your video using a video converter (Handbrake, iMovie, Media Encoder) using H.264 MP4 encoding.",
            "Upload your correctly encoded PNG, MP4, or PDF file in the upload section.",
        ],
        tips: "Always use transparent PNG files for logos and graphics so background wallpapers shine through cleanly.",
    },
    {
        id: "edit-and-apply",
        category: "essentials",
        title: "Making & Applying Live Screen Changes",
        subtitle: "Understand draft mode, live previewing, and applying updates to physical screens.",
        icon: RefreshCw,
        targetUrl: "/dashboard/overview",
        pdfGuide: {
            title: "How to Edit Your Screen",
            src: "/guides/HowToEdit.pdf",
            description: "Overview of how to edit layout items and publish changes.",
        },
        steps: [
            "Make any modifications to text, images, schedules, or colors within dashboard pages.",
            "Observe your edits instantly in the right-hand Live Preview simulator.",
            "Click the 'Apply Changes' button in the top navbar to push changes live to physical display screens.",
            "Use the 'Discard' button if you wish to throw away uncommitted draft modifications.",
        ],
        tips: "Changes remain saved as drafts until you explicitly click 'Apply' in the top navbar.",
    },
    {
        id: "collaboration",
        category: "essentials",
        title: "Real-Time Screen Collaboration",
        subtitle: "Work alongside team members on the same screen simultaneously without overwriting.",
        icon: Users,
        targetUrl: "/dashboard/overview",
        steps: [
            "Open any loaded screen workspace.",
            "Look at the top navbar avatar cluster to see active collaborators currently editing the screen.",
            "Real-time notifications will alert you when another user applies changes to the screen.",
        ],
        tips: "The active collaborator bar in the top navbar updates live whenever a team member joins or edits.",
    },
    {
        id: "logo-management",
        category: "styling",
        title: "Customizing Club Logo & Header Branding",
        subtitle: "Upload high-resolution logos, set dimensions, and align branding on your screen.",
        icon: ImageUp,
        targetUrl: "/dashboard/logo",
        pdfGuide: {
            title: "Customise Dashboard Visuals",
            src: "/guides/HowToEdit.pdf",
            description: "Visual customization guide covering logo and theme updates.",
        },
        steps: [
            "Go to Dashboard -> Logo from the main navigation menu.",
            "Upload your high-definition transparent PNG logo file.",
            "Adjust logo width, height, margin spacing, and alignment (left, center, right).",
            "Preview changes in the Live Preview drawer and click Apply.",
        ],
        tips: "For best display results on TV screens, upload transparent PNG images with at least 300px width.",
    },
    {
        id: "background-styling",
        category: "styling",
        title: "Managing Dashboard Themes",
        subtitle: "Set custom dashboard themes and layouts.",
        icon: Wallpaper,
        targetUrl: "/dashboard/background",
        pdfGuide: {
            title: "Customise Visuals & Backgrounds",
            src: "/guides/ChangeVisuals.pdf",
            description: "Guide on configuring dashboard themes.",
        },
        steps: [
            "Select the cog icon in the upper right.",
            "Choose between preset graphic themes and light and dark modes.",
            "Changes will be remembered automatically for this device",
        ],
        tips: "Dark mode can be a lot easier on the eyes",
    },
    {
        id: "ui-elements",
        category: "styling",
        title: "Customizing UI Elements, Colors & Opacity",
        subtitle: "Fine-tune card background colors, border styles, font sizes, and accent colors.",
        icon: PanelTopBottomDashed,
        targetUrl: "/dashboard/ui-elements",
        steps: [
            "Navigate to Dashboard -> UI Elements.",
            "Customize main container background colors and fonts.",
        ],
        tips: "Larger TV screens benefit from higher contrast text and slightly larger font scales.",
    },
    {
        id: "notice-board",
        category: "content",
        title: "Configuring the Digital Notice Board",
        subtitle: "Publish announcements, event notifications, and urgent club notices across 3 zones.",
        icon: Flag,
        targetUrl: "/dashboard/notice-board",
        steps: [
            "Go to Dashboard -> Notice Board.",
            "Select Top, Middle, or Bottom notice slots using the tab selector.",
            "Enter notice title, interactivity, notices images or urls.",
            "Toggle 'Enable Notice' to make the announcement visible on the screen display.",
        ],
        tips: "Use Top Notice for critical high-priority announcements and Middle/Bottom for general club updates.",
    },
    {
        id: "notice-scheduling",
        category: "content",
        title: "Scheduling Notices & Blank Fallback Logic",
        subtitle: "Set start/end time windows and understand how blank text fields restore default notices.",
        icon: Calendar,
        targetUrl: "/dashboard/notice-board",
        steps: [
            "Navigate to Dashboard -> Notice Board.",
            "Scheduling: Use the Start Date/Time and End Date/Time pickers to automatically show and hide notices during event windows.",
            "BLANK TEXT FALLBACK RULE: If you leave a notice text field blank (or clear existing text), that specific notice slot is hidden, and TeeScreen automatically displays the DEFAULT club notice in its place.",
            "To completely remove a notice slot without showing a default fallback notice, switch off the 'Enable Notice' toggle control.",
            "Click Apply to publish schedule changes to physical displays.",
        ],
        tips: "Schedule tournament notices in advance so they automatically appear on event morning and expire at night.",
    },
    {
        id: "custom-tabs",
        category: "content",
        title: "Custom Content Tabs & Pages",
        subtitle: "Create up to 4 custom content tabs for dining menus, pro shop offers, or fixtures.",
        icon: NotebookTabs,
        targetUrl: "/dashboard/custom-tabs",
        steps: [
            "Navigate to Dashboard -> Custom Tabs.",
            "Select CustomTab 1 through 4 to configure.",
            "Set custom tab title labels, upload content images or set urls to be displayed.",
            "Enable or disable tab visibility as needed for seasonal promotions.",
        ],
        tips: "Custom tabs are great way to display rules and more permanent information, they also support pdf uploads and videos.",
    },
    {
        id: "screensavers",
        category: "content",
        title: "Configuring Idle Screensavers",
        subtitle: "Setup automated photo carousels and slideshows during idle screen hours.",
        icon: Eye,
        targetUrl: "/dashboard/screensavers",
        steps: [
            "Navigate to Dashboard -> Screensavers.",
            "Upload image and video slides for your screensaver carousel.",
            "Preview the screensaver mode in the live preview drawer.",
        ],
        tips: "High-resolution landscape photos (1080x1080) work best for full-screen screensavers.",
    },
    {
        id: "golf-coordinates",
        category: "sports",
        title: "Editing Golf Hole Co-ordinates & Maps",
        subtitle: "Pinpoint hole locations, tee boxes, and green co-ordinates on satellite mapping.",
        icon: LandPlot,
        targetUrl: "/dashboard/golf-course",
        steps: [
            "Navigate to Dashboard -> Golf Course (requires Golf Club screen license).",
            "Click 'Edit Hole Co-ordinates' or select a specific hole (1–18).",
            "Use the interactive satellite map picker to drag pin markers to exact green and tee locations.",
            "Save co-ordinate updates and apply to screens.",
        ],
        tips: "Double-check pin positioning using satellite zoom mode for precise yardage calculation.",
    },
    {
        id: "golf-checkin",
        category: "sports",
        title: "Golf Check-In",
        subtitle: "Display daily tee times, player check-in status.",
        icon: NotebookPen,
        targetUrl: "/dashboard/golf-check-in",
        steps: [
            "Navigate to Dashboard -> Golf Check In.",
            "View and download check in data from your screens",
        ],
        tips: "Check-in displays update automatically when connected to compatible screens.",
    },
    {
        id: "match-centre",
        category: "sports",
        title: "Updating Match Centre, Fixtures & Lineups",
        subtitle: "Configure live match scores, squad lineups, fixtures, and league table widgets.",
        icon: Trophy,
        targetUrl: "/dashboard/match-centre",
        steps: [
            "Navigate to Dashboard -> Match Centre (available for Football Club licenses).",
            "Update Lineup background, choose to hide or show scoreboards, set home and away team backgrounds",
            "Click Save and Apply to broadcast matchday info live to clubhouse screens.",
        ],
        tips: "Turn on Active Match Mode during matchday to enable real-time score updates.",
    },
    {
        id: "user-profile",
        category: "account",
        title: "Managing User Information & Profile",
        subtitle: "Update account details, contact information, and user display settings.",
        icon: Users,
        targetUrl: "/pages/settings",
        pdfGuide: {
            title: "Change User Information",
            src: "/guides/HowtoChangeYourBasicAccountSettings.pdf",
            description: "PDF guide on modifying user profile and account information.",
        },
        steps: [
            "Navigate to Pages -> Account Settings from the sidebar navigation.",
            "Click 'Edit Profile' to update your full name or primary contact details.",
            "Save your updated profile information.",
        ],
        tips: "Your profile name is displayed to team members when collaborating on screens.",
    },

];

export const FAQS = [
    {
        q: "Can I simply rename a file extension to .png, .mp4, or .pdf before uploading?",
        a: "No! Simply changing a file extension (for example, renaming 'photo.jpg' to 'photo.png' or 'video.mov' to 'video.mp4' in Windows Explorer) does NOT re-encode the file data. Uploading improperly renamed files will cause display players to render broken images or black video screens. You MUST convert files properly using an image editor (Export as PNG) or video converter (Export as MP4).",
    },
    {
        q: "What is the difference between 'Current Changes' and 'Full Screen' when copying screens?",
        a: "'Current Changes' mode copies ONLY your recent uncommitted draft edits (like a single notice or text update) to destination screens, preserving each TV's unique background and logo setup. 'Full Screen' mode completely overwrites destination screens with your entire screen layout and configuration.",
    },
    {
        q: "What happens if I leave a notice text field blank on the Notice Board?",
        a: "Leaving a notice text field blank automatically hides that specific notice slot and displays your default club notice in its place. To turn off a notice slot completely without showing a default notice, switch off the 'Enable Notice' toggle switch.",
    },
    {
        q: "How do I make my changes visible on the physical TV screens?",
        a: "Whenever you edit text, images, or layouts in the dashboard, your changes are saved as a draft. To publish them live to physical display screens, click the green 'Apply' button in the top navigation bar.",
    },
    {
        q: "Why are my changes not appearing immediately on the screen?",
        a: "Ensure you clicked the 'Apply' button in the top navbar. If applied, physical screens sync automatically via real-time WebSocket signals within a few seconds. If a display is offline, it will sync upon reconnecting.",
    },
    {
        q: "Can multiple administrators edit the same screen at the same time?",
        a: "Yes! TeeScreen supports real-time multi-user collaboration. When multiple users load the same screen workspace, active user avatars appear in the top header, and real-time updates synchronize across all sessions.",
    },
    {
        q: "How do I change satellite co-ordinates for golf holes?",
        a: "Go to Dashboard -> Golf Course and select 'Edit Co-ordinates'. An interactive map picker allows you to drag pin markers for green and tee locations on satellite imagery to update interactive displays.",
    },
    {
        q: "Where can I download or view step-by-step PDF user guides?",
        a: "Official printable PDF manuals are available throughout this Documentation page and via the floating Help button in the bottom right corner of your screen.",
    },
    {
        q: "What should I do if a screen display goes offline?",
        a: "Check that the media player device connected to the TV has active power and Wi-Fi/Ethernet connection. Once internet connectivity is restored, TeeScreen automatically re-syncs all latest applied content.",
    },
];


//for guide menu
export const categories = [
    {
        name: "Essentials & First-Time Setup",
        icon: BookOpen,
        guides: [
            {
                label: "First-Time Setup: Connect Screen Account",
                src: "/guides/AddAndLoadAccountForEditing.pdf",
                title: "First-Time Setup & Connecting Screen Accounts",
                description: "Step-by-step for new users adding screen credentials in Account Settings",
            },
            {
                label: "Selecting & Loading Accounts",
                src: "/guides/AddAndLoadAccountForEditing.pdf",
                title: "Getting Started with Accounts",
                description: "Overview of system accounts, switching screens, and basic navigation",
            },
            {
                label: "Customise Dashboard Visuals",
                src: "/guides/ChangeVisuals.pdf",
                title: "Dashboard Customise Visuals",
                description: "Overview of customisation options, branding, and updating colors",
            },
            {
                label: "Edit Your Screen",
                src: "/guides/HowToEdit.pdf",
                title: "How to Edit your Screen",
                description: "Overview of making draft changes and applying them to physical screens",
            },
        ],
    },
    {
        name: "Users & Permissions",
        icon: Users,
        guides: [
            {
                label: "Change User Information",
                src: "/guides/HowtoChangeYourBasicAccountSettings.pdf",
                title: "Change User Information",
                description: "Make changes to your basic account settings and user profile",
            },
            {
                label: "Change Email or Password",
                src: "/guides/ChangeEmailAndPassword.pdf",
                title: "Change Email or Password",
                description: "Make secure changes to your account email address or password",
            },
        ],
    },
    {
        name: "Golf Features",
        icon: LandPlot,
        guides: [
            {
                label: "How to edit hole co-ordinates",
                src: "/guides/ChangingCoordinates.pdf",
                title: "Edit Hole Coordinates",
                description: "How to edit pin co-ordinates for the interactive satellite map",
            },
        ],
    },
];
