"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  LandPlot,
  Users,
  Video,
  FileText,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  ExternalLink,
  Wallpaper,
  ImageUp,
  PanelsTopLeft,
  PanelTopBottomDashed,
  Flag,
  NotebookTabs,
  Eye,
  Trophy,
  NotebookPen,
  ShieldCheck,
  LifeBuoy,
  RefreshCw,
  Layers,
  Sparkles,
  Monitor,
  UserPlus,
  Copy,
  FileCheck,
  Calendar,
  AlertTriangle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { GuidePdfModal } from "./GuidePdfModal";

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

const GUIDES_DATA: DocumentationGuide[] = [
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
      "Select your club or account from the Account Switcher dropdown at the top right of the screen.",
      "Click 'Load Screen' on the target screen card to begin editing.",
      "Confirm the green active badge shows your target screen in the top navbar.",
    ],
    tips: "Ensure you have proper editor or administrator permissions assigned to load locked screens.",
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
      "Observe your edits instantly in the right-hand Live Preview simulator drawer.",
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
      src: "/guides/ChangeVisuals.pdf",
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
    title: "Managing Background Graphics & Themes",
    subtitle: "Set custom background wallpapers, dark overlays, and ambient color fills.",
    icon: Wallpaper,
    targetUrl: "/dashboard/background",
    pdfGuide: {
      title: "Customise Visuals & Backgrounds",
      src: "/guides/ChangeVisuals.pdf",
      description: "Guide on configuring background images and color fills.",
    },
    steps: [
      "Navigate to Dashboard -> Background.",
      "Choose between preset graphic themes or upload a custom high-res wallpaper image.",
      "Adjust background opacity, overlay darkness, and blur effects for optimal readability.",
      "Save your changes and click Apply.",
    ],
    tips: "Ensure contrast remains strong so text overlay elements are easily legible from a distance.",
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
      "Customize main container background colors, card border radius (corner rounding), and shadow values.",
      "Adjust font scaling factors for large TV display visibility.",
      "Configure card opacity and border line thickness.",
      "Toggle light/dark theme preference presets.",
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
      "Enter notice title, body message text, active schedule timestamps, and icon styling.",
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
      "Set custom tab title labels, upload content images, and input rich description text.",
      "Enable or disable tab visibility as needed for seasonal promotions.",
    ],
    tips: "Custom tabs rotate automatically on TV screens when auto-rotation is enabled.",
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
      "Upload image slides for your screensaver carousel.",
      "Set idle timeout delays (e.g. 5 minutes of inactivity) and slide rotation speeds.",
      "Preview the screensaver mode in the live preview drawer.",
    ],
    tips: "High-resolution landscape photos (1920x1080) work best for full-screen screensavers.",
  },
  {
    id: "golf-coordinates",
    category: "sports",
    title: "Editing Golf Hole Co-ordinates & Maps",
    subtitle: "Pinpoint hole locations, tee boxes, and green co-ordinates on satellite mapping.",
    icon: LandPlot,
    targetUrl: "/dashboard/golf-course",
    pdfGuide: {
      title: "How to Edit Hole Co-ordinates",
      src: "/guides/ChangingCoordinates.pdf",
      description: "Step-by-step PDF guide for adjusting pin locations on interactive satellite maps.",
    },
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
    title: "Golf Check-In & Leaderboard Displays",
    subtitle: "Display daily tee times, player check-in status, and handicap rankings.",
    icon: NotebookPen,
    targetUrl: "/dashboard/golf-check-in",
    steps: [
      "Navigate to Dashboard -> Golf Check In.",
      "Manage today's check-in list, player names, tee times, and handicap values.",
      "Publish live updates to screen scoreboards.",
    ],
    tips: "Check-in displays update automatically when connected to compatible tee time systems.",
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
      "Fixtures & Scores: Input upcoming opponent name, kickoff time, match venue, and live score results.",
      "Team Lineup: Configure starting XI players, substitutes, team formation layout, and squad numbers.",
      "League Table Widget: Update team points, wins, draws, losses, and goal difference standings.",
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
  {
    id: "security-settings",
    category: "account",
    title: "Changing Email & Account Password",
    subtitle: "Securely update your login email address and change system password.",
    icon: ShieldCheck,
    targetUrl: "/pages/settings",
    pdfGuide: {
      title: "Change Email or Password",
      src: "/guides/ChangeEmailAndPassword.pdf",
      description: "Step-by-step PDF manual for changing login email and password.",
    },
    steps: [
      "Navigate to Pages -> Account Settings.",
      "To update email: Click 'Change Email', enter your new email address, and confirm password.",
      "To update password: Click 'Change Password', enter current password and set your new strong password.",
      "Confirm changes to update authentication records.",
    ],
    tips: "Use a strong password with at least 8 characters including letters, numbers, and symbols.",
  },
];

const FAQS = [
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

export function DocumentationHub() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [isVideoOpen, setIsVideoOpen] = React.useState(false);

  const filteredGuides = React.useMemo(() => {
    return GUIDES_DATA.filter((guide) => {
      const matchesCategory =
        activeCategory === "all" || guide.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();

      if (!query) return matchesCategory;

      const matchesTitle = guide.title.toLowerCase().includes(query);
      const matchesSub = guide.subtitle.toLowerCase().includes(query);
      const matchesSteps = guide.steps.some((step) =>
        step.toLowerCase().includes(query)
      );

      return matchesCategory && (matchesTitle || matchesSub || matchesSteps);
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/95 via-primary to-primary/85 p-6 md:p-10 text-primary-foreground shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 opacity-10 pointer-events-none">
          <BookOpen className="h-96 w-96" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/15 text-xs font-medium backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>User Help & Documentation Center</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            How can we help you today?
          </h1>

          <p className="text-primary-foreground/90 text-sm md:text-base leading-relaxed">
            Search our comprehensive guides, step-by-step feature walkthroughs, printable PDF manuals, and video tutorials to master your TeeScreen displays.
          </p>

          {/* Search Bar */}
          <div className="relative pt-2 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search guides (e.g. logo, golf coordinates, notice board, apply changes)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-6 bg-background text-foreground text-base shadow-lg rounded-xl border-0 focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Quick Action Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:border-primary/50 transition-all cursor-pointer group shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">
              Video Walkthrough
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Video className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription className="text-xs">
              Watch a video walkthrough demonstrating screen logins, editing controls, and applying live changes.
            </CardDescription>

            <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Video className="h-4 w-4" />
                  <span>Watch Video Guide</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl p-6">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    <span>TeeScreen Video Setup Guide</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center mt-2">
                  <video
                    src="/assets/video/VideoGuide.mp4"
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    muted
                    playsInline
                  />
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-all cursor-pointer group shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">
              Official PDF Guides
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription className="text-xs">
              Browse printable step-by-step PDF manuals for editing, coordinates, visual branding, and credentials.
            </CardDescription>

            <GuidePdfModal
              src="/guides/HowToEdit.pdf"
              title="How to Edit Your Screen"
              description="Official PDF walkthrough for screen editing"
              triggerLabel="View Quick PDF Manual"
              triggerVariant="outline"
            />
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-all shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">
              Need Extra Help?
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <LifeBuoy className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription className="text-xs">
              Have a question not covered in the docs? Submit a bug report or reach out directly to TeeScreen support.
            </CardDescription>

            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline" className="flex-1 text-xs">
                <Link href="/pages/contact">Contact Us</Link>
              </Button>
              <Button asChild size="sm" variant="secondary" className="flex-1 text-xs">
                <Link href="/pages/bug-report">Report Issue</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter Tabs */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2 border-b pb-4">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("all")}
            className="rounded-full text-xs"
          >
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            All Guides ({GUIDES_DATA.length})
          </Button>

          <Button
            variant={activeCategory === "essentials" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("essentials")}
            className="rounded-full text-xs"
          >
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            Essentials & Navigation
          </Button>

          <Button
            variant={activeCategory === "styling" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("styling")}
            className="rounded-full text-xs"
          >
            <PanelsTopLeft className="h-3.5 w-3.5 mr-1.5" />
            Display & Styling
          </Button>

          <Button
            variant={activeCategory === "content" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("content")}
            className="rounded-full text-xs"
          >
            <Flag className="h-3.5 w-3.5 mr-1.5" />
            Content Modules
          </Button>

          <Button
            variant={activeCategory === "sports" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("sports")}
            className="rounded-full text-xs"
          >
            <LandPlot className="h-3.5 w-3.5 mr-1.5" />
            Sport Features
          </Button>

          <Button
            variant={activeCategory === "account" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("account")}
            className="rounded-full text-xs"
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Account & Security
          </Button>
        </div>

        {/* Guides Grid */}
        {filteredGuides.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-muted/20 space-y-3">
            <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No guides match your search</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Try searching with different keywords like &quot;logo&quot;, &quot;golf&quot;, &quot;notice&quot;, or &quot;apply&quot;.
            </p>
            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGuides.map((guide) => {
              const Icon = guide.icon;
              return (
                <Card key={guide.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge variant="secondary" className="capitalize text-[11px]">
                          {guide.category}
                        </Badge>
                      </div>

                      {guide.pdfGuide && (
                        <GuidePdfModal
                          src={guide.pdfGuide.src}
                          title={guide.pdfGuide.title}
                          description={guide.pdfGuide.description}
                          triggerLabel="PDF Guide"
                          triggerVariant="ghost"
                        />
                      )}
                    </div>

                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      {guide.subtitle}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Step by Step List */}
                    <div className="space-y-2 bg-muted/40 p-3.5 rounded-lg border text-xs">
                      <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>Step-by-Step Instructions:</span>
                      </h4>
                      <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground pl-1">
                        {guide.steps.map((step, idx) => (
                          <li key={idx} className="leading-snug">
                            <span className="text-foreground">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Pro Tip */}
                    {guide.tips && (
                      <div className="flex items-start gap-2 p-2.5 rounded-md bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs">
                        <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{guide.tips}</span>
                      </div>
                    )}

                    {/* Action Button */}
                    {guide.targetUrl && (
                      <div className="pt-2 flex justify-end">
                        <Button asChild size="sm" variant="ghost" className="gap-1.5 text-xs text-primary hover:text-primary">
                          <Link href={guide.targetUrl}>
                            <span>Go to Feature</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Frequently Asked Questions */}
      <div className="pt-8 border-t space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            <span>Frequently Asked Questions</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Quick answers to common questions about using TeeScreen.
          </p>
        </div>

        <Card className="p-2">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger className="px-4 text-sm font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="px-4 text-xs text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>
    </div>
  );
}
