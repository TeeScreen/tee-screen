import React from "react";
import { DocumentationHub } from "@/components/guide/DocumentationHub";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "User Documentation & Guides | TeeScreen",
  description: "Comprehensive guides, PDF manuals, video walkthroughs, and help resources for TeeScreen displays.",
};

export default function GuidePage() {
  return (
    <div className="container mx-auto py-2">
      <DocumentationHub />
    </div>
  );
}
