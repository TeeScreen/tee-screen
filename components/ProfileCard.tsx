"use client";
import React from 'react'
import {EditProfile} from "@/components/EditProfileDialog";
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/dist/server/request/headers";
import {useUserState} from "@/stores/user-store";

const ProfileCard = () => {

    const user = useUserState();

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
                                {user.userData.fullName}
                            </p>
                        </div>

                        <div>
                            <p className="mb-2 text-xs leading-normal text-muted-foreground">
                                Email
                            </p>
                            <p className="text-sm font-medium">
                                {user.userData.email}
                            </p>
                        </div>

                        <div>
                            <p className="mb-2 text-xs leading-normal text-muted-foreground">
                                Phone Number
                            </p>
                            <p className="text-sm font-medium ">
                                {user.userData.phoneNumber}
                            </p>
                        </div>

                        <div>
                            <p className="mb-2 text-xs leading-normal text-muted-foreground">
                                Club Name
                            </p>
                            <p className="text-sm font-medium">
                                {user.userData.clubName}
                            </p>
                        </div>

                        <div>
                            <p className="mb-2 text-xs leading-normal text-muted-foreground">
                                Role
                            </p>
                            <p className="text-sm font-medium">
                                {user.userData.role}
                            </p>
                        </div>
                    </div>
                </div>
                <EditProfile/>
            </div>
        </div>
    )
}
export default ProfileCard
