import {ScreenItem} from "@/components/screen/ScreenItem";
import {getAdminScreenData, getUserInfo, isUserAdmin} from "@/lib/actions/user.actions";
import {redirect} from "next/navigation";
import {ShieldUser} from "lucide-react";
import {AdminScreenList} from "@/components/admin/AdminScreenList";

export default async function Page() {
    const user = await getUserInfo();
    const loadedAccount = user?.loadedAccount ?? "";
    const admin = await isUserAdmin(loadedAccount);

    if (!admin) {
        redirect("/dashboard/home");
    }

    const screensJson = await getAdminScreenData();

    // screensJson is an object, not an array
    const screens = screensJson ?? {};
    async function loadscreen(screenName: string) {
        // implement loading logic here
    }

    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto">
                <ShieldUser /> Admin Dashboard
            </h1>

            <AdminScreenList screens = {screens}/>
        </div>
    );
}
