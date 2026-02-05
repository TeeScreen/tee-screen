import React from 'react'
import {EditProfile} from "@/components/EditProfileDialog";
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/dist/server/request/headers";
import {useUserState} from "@/stores/user-store";
import {getUserInfo} from "@/lib/actions/user.actions";
import {redirect} from "next/navigation";

const ProfileCard = async () => {

    const userInfo = await getUserInfo();
    return (
        <div className="p-5 border border-muted rounded-2xl lg:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h4 className="text-lg font-semibold lg:mb-6">
                        Personal Information
                    </h4>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                        <div>
                            <p className="mb-2 text-xs leading-normal text-muted-foreground">
                                Full Name
                            </p>
                            <p className="text-sm font-medium ">
                                {userInfo.fullName}
                            </p>
                        </div>

                        <div>
                            <p className="mb-2 text-xs leading-normal text-muted-foreground">
                                Phone Number
                            </p>
                            <p className="text-sm font-medium ">
                                {userInfo.phoneNumber}
                            </p>
                        </div>

                        <div>
                            <p className="mb-2 text-xs leading-normal text-muted-foreground">
                                Club Name
                            </p>
                            <p className="text-sm font-medium">
                                {userInfo.clubName}
                            </p>
                        </div>

                        <div>
                            <p className="mb-2 text-xs leading-normal text-muted-foreground">
                                Role
                            </p>
                            <p className="text-sm font-medium">
                                {userInfo.role}
                            </p>
                        </div>
                    </div>
                </div>
                <EditProfile fullName={userInfo.fullName} phoneNumber={userInfo.phoneNumber} clubName={userInfo.clubName} role={userInfo.role}/>
            </div>
        </div>
    )
}
export default ProfileCard
