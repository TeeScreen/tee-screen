import {
    getUserInfo,
    addScreenData,
    removeScreenData,
    saveUserInfo,
} from "@/lib/actions/user.actions";

import { revalidatePath } from "next/cache";
import { AddScreenDialog } from "@/components/screen/AddScreenDialog";
import { ScreenList } from "@/components/screen/ScreenList";

export default async function HomePage() {
    const user = await getUserInfo();
    const screens = user?.screenDetails || [];
    const loadedScreen = user?.loadedScreen || null;

    // Add Screen
    async function handleAddScreen(formData: FormData) {
        "use server";

        const screenLogin = formData.get("screenLogin") as string;
        const screenPW = formData.get("screenPW") as string;

        await addScreenData({ screenLogin, screenPW });
        revalidatePath("/");
    }

    // Delete Screen
    async function handleDeleteScreen(screenLogin: string) {
        "use server";
        await removeScreenData(screenLogin);
        revalidatePath("/");
    }

    // Load Screen
    async function handleLoadScreen(screenLogin: string) {
        "use server";
        await saveUserInfo({ loadedScreen: screenLogin });
        revalidatePath("/");
    }

    return (
        <div className="@container/main flex flex-col gap-4 md:gap-6">
            <h1 className="text-3xl font-bold mb-6">Your Screens</h1>

            <AddScreenDialog action={handleAddScreen} />

            <ScreenList
                screens={screens}
                loadedScreen={loadedScreen}
                onLoad={handleLoadScreen}
                onDelete={handleDeleteScreen}
            />
        </div>
    );
}