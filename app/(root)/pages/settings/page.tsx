import React from "react";
import ProfileCard from "@/components/ProfileCard";
import {BadgeCheck} from "lucide-react";
import { DeleteUserDialog } from "@/components/DeleteUserDialog";
import SecurityCard from "@/components/SecurityCard";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
      <div>
          <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto ">
              <BadgeCheck/> Account Settings
          </h1>
          <div className="@container/main flex flex-col gap-4 md:gap-6">
            <ProfileCard/>
            <SecurityCard/>
            <DeleteUserDialog/>
        </div>
      </div>
  );
}
