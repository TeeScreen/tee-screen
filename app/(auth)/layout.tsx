import Link from "next/link";
import Image from "next/image";
import { headers } from "next/dist/server/request/headers";
import { auth } from "@/lib/better-auth/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {
    if (!auth) {
        // If auth is not initialised, fail loudly and predictably.
        throw new Error("Auth module not initialised");
    }

    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) redirect("/");

    return (
        <main className="auth-layout flex flex-col lg:flex-row min-h-screen overflow-auto">

            {/* LEFT SECTION */}
            <section className="auth-left-section w-full lg:w-1/2 flex flex-col p-6">
                <Link href="/" className="auth-logo mb-6">
                    <Image
                        src="/assets/icons/logo.png"
                        alt="logo"
                        width={140}
                        height={32}
                        className="h-8 w-auto"
                    />
                </Link>

                <div className="flex-1 pb-6 lg:pb-8">
                    {children}
                </div>
            </section>

            {/* RIGHT SECTION — COMPLETELY HIDDEN ON MOBILE */}
            <section className="auth-right-section hidden lg:flex lg:w-1/2 lg:flex-col">

                {/* WELCOME BLOCKQUOTE */}
                <div className="p-6 lg:mt-4 lg:mb-8">
                    <blockquote className="auth-blockquote">
                        Welcome to the new Tee Screen portal — rebuilt for clarity, speed, and a smoother account experience.
                        Create your personal account to get started, then link any existing screen accounts directly inside
                        your dashboard.
                    </blockquote>
                </div>

                {/* WHITE LONG LOGO — FITS RIGHT SECTION */}
                <div className="p-6 flex items-center justify-center h-[180px] relative">
                    <Image
                        src="/assets/icons/logo_long.png"
                        alt="Tee Screen Portal"
                        fill
                        className="
                object-contain
                drop-shadow-[0_0_8px_black]
                drop-shadow-[0_0_8px_black]
                drop-shadow-[0_0_8px_black]
                drop-shadow-[0_0_8px_black]
            "
                        priority
                    />
                </div>

            </section>

        </main>
    );
};

export default Layout;