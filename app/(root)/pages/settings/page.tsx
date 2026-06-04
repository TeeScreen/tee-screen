import React from "react";
import ProfileCard from "@/components/profile/ProfileCard";
import {BadgeCheck} from "lucide-react";
import { DeleteUserDialog } from "@/components/profile/DeleteUserDialog";
import SecurityCard from "@/components/profile/SecurityCard";
import ScreenAccountsCard from "@/components/profile/ScreenAccountsCard";
import { getUserInfo } from "@/lib/actions/user.actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  const userInfo = await getUserInfo();
  const accounts = userInfo?.accountDetails || [];

  return (
      <div>
          <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto ">
              <BadgeCheck/> Account Settings
          </h1>
          <div className="@container/main flex flex-col gap-4 md:gap-6">
            <ProfileCard/>
            <ScreenAccountsCard accounts={accounts} loadedAccount={userInfo?.loadedAccount || null} />
            <SecurityCard/>
            <DeleteUserDialog/>
        </div>
      </div>
  );
}

