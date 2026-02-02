import React from "react";
import ProfileCard from "@/components/ProfileCard";

export default function Page() {
  return (
    <div>
      <div className="rounded-2xl border lg:p-6">
        <h3 className="mb-5 text-lg font-semibold lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
            <ProfileCard/>
        </div>
      </div>
    </div>
  );
}
