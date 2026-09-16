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
  PanelsTopLeft,
  Flag,
  LifeBuoy,
  Layers,
  Sparkles,
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
import {FAQS, GUIDES_DATA} from "@/data/guide";


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
