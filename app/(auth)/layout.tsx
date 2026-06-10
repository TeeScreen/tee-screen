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

                {/* BLOCKQUOTE */}
                <div className="p-6 lg:mt-4 lg:mb-8">
                    <blockquote className="auth-blockquote">
                        Your previous screen account will not work to login for this portal like the old portal.
                        Please create a personal account if you have not used the new portal before. Once your
                        personal account has been made you can then link your pre-existing screen accounts.
                    </blockquote>
                </div>

                {/* BUTTON TO OLD PORTAL */}
                <div className="p-6">
                    <Link
                        href="https://teescreen.co.uk/old-portal"
                        className="inline-block px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
                    >
                        Go to Old Portal
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default Layout;