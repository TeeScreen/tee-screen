import Link from "next/link";
import Image from "next/image";
import {headers} from "next/dist/server/request/headers";
import {auth} from "@/lib/better-auth/auth";
import {redirect} from "next/navigation";
import {Toaster} from "@/components/ui/sonner";
import {ClientToaster} from "@/components/ClientToaster";
export const dynamic = "force-dynamic";
const Layout = async ({children}: {children:React.ReactNode}) => {

    const session = await auth.api.getSession({headers: await headers()});

    if(session?.user) redirect("/");

    return (
        <main className="auth-layout">
            <section className="auth-left-section scrollbar-hide-default">
                <Link href = "/" className = "auth-logo">
                    <Image src ="/assets/icons/logo.png" alt ="logo" width={140} height={32} className = "h-8 w-auto"/>
                </Link>
                <div className="pb-6 lg:pb-8 flex-1">
                    {children}
                </div>
            </section>
            <section className="auth-right-section">
                <div className="z-10 relative lg:mt-4 lg:mb-16">
                    <blockquote className="auth-blockquote">
                        Your previous screen account will not work to login for this portal like the old portal.
                        Please create a personal account if you have not used the new portal before. Once your personal account has been made you can then link your pre-existing screen accounts
                    </blockquote>
                </div>

                <div className="flex-1 relative">
                    <Image src="/assets/images/forsite.jpg" alt ="forsite" width={1440} height={1140} className = "auth-dashboard-preview absolute top-0" />
                </div>
            </section>
        </main>

    )
}
export default Layout
