import React from "react";
import ProfileCard from "@/components/ProfileCard";

export default function Page() {
  return (
      <div>
        <div className="@container/main flex flex-col gap-4 md:gap-6">
            <ProfileCard/>
            <ProfileCard/>
            <ProfileCard/>
        </div>
      </div>
  );
}
