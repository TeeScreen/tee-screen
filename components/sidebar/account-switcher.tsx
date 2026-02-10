"use client";

import { useState } from "react";

import {BadgeCheck, Bell, Bug, Contact, CreditCard, LogOut} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";
import {useRouter} from "next/navigation";
import {signOut} from "@/lib/actions/auth.actions";
import Link from "next/link";


export function AccountSwitcher({
                                  userName,
                                  userRole,
                                }: {
  userName: string;
  userRole: string;
}) {
  const router = useRouter();
  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  }

  return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="size-9 rounded-lg">
            <AvatarImage src={undefined} alt={userName} />
            <AvatarFallback className="rounded-lg">{getInitials(userName)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={4}>
              <DropdownMenuItem
                  className={cn("p-0 border-l-2 border-l-primary bg-accent/50")}
              >
                <div className="flex w-full items-center justify-between gap-2 px-1 py-1.5">
                  <Avatar className="size-9 rounded-lg">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback className="rounded-lg">{getInitials(userName)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs capitalize">{userRole}</span>
                  </div>
                </div>
              </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link href="/pages/settings">
              <BadgeCheck />
              Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/pages/bug-report">
                <Bug />Report Bug
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/pages/contact">
              <Contact />
              Contact Us
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );
}
