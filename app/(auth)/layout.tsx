import Link from "next/link";
import Image from "next/image";
import {headers} from "next/dist/server/request/headers";
import {auth} from "@/lib/better-auth/auth";
import {redirect} from "next/navigation";
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
                        The new Tee Screen Portal. Manage your screen content anywhere. Now supporting mobile
                    </blockquote>
                    <div className="flex items-center justify-between">
                        <div>
                            <cite className="auth-testimonial-author">- Arthur.J</cite>
                            <p className="max-md:test-xs text-gray-500">CTO</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 relative">
                    <Image src="/assets/images/forsite.jpg" alt ="forsite" width={1440} height={1140} className = "auth-dashboard-preview absolute top-0" />
                </div>
            </section>
        </main>
    )
}
export default Layout
