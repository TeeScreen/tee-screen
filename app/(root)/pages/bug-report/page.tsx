import React from "react";
import {Bug} from "lucide-react";
import BugReportForm from "@/components/BugReportForm";

export const dynamic = "force-dynamic";

export default function Page() {
    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto ">
                <Bug/> Report a Bug
            </h1>
            <div className="@container/main flex flex-col gap-4 md:gap-6">
                <BugReportForm/>
            </div>
        </div>
    );
}
