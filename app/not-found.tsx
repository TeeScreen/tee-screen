import GridShape from "@/components/GridShape";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {APP_CONFIG} from "@/config/app-config";

export default function Error404() {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
            <GridShape />
            <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
                <h1 className="mb-8 font-bold text-destructive text-title-md xl:text-title-2xl">
                    ERROR
                </h1>

                <Image
                    src="/assets/images/404.svg"
                    alt="404"
                    className="dark:hidden"
                    width={472}
                    height={152}
                />
                <Image
                    src="/assets/images/404-dark.svg"
                    alt="404"
                    className="hidden dark:block"
                    width={472}
                    height={152}
                />

                <p className="mt-10 mb-6 text-base sm:text-lg">
                    We can’t seem to find the page you are looking for!
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-lg border bg-muted-foreground px-5 py-3.5 text-sm font-medium hover:bg-muted hover:text-muted-foreground"
                >
                    Back to Home Page
                </Link>
            </div>
            {/* <!-- Footer --> */}
            <p className="absolute text-sm text-center -translate-x-1/2 bottom-6 left-1/2">
                {APP_CONFIG.copyright}
            </p>
        </div>
    );
}
