import { getUserInfo } from "@/lib/actions/user.actions";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { ChangeEmailDialog } from "@/components/profile/ChangeEmailDialog";
import { ChangePasswordDialog } from "@/components/profile/ChangePasswordDialog";

const SecurityCard = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) return null;

    const email = session.user.email;

    return (
        <div className="p-5 border border-muted rounded-2xl lg:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h4 className="text-lg font-semibold lg:mb-6">
                        Security Settings
                    </h4>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                        <div>
                            <p className="mb-2 text-xs leading-normal text-muted-foreground">
                                Email
                            </p>
                            <p className="text-sm font-medium">
                                {email}
                            </p>
                        </div>

                        <div>
                            <p className="mb-2 text-xs leading-normal text-muted-foreground">
                                Password
                            </p>
                            <p className="text-sm font-medium tracking-widest">
                                ••••••••••••••
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <ChangeEmailDialog />
                    <ChangePasswordDialog />
                </div>
            </div>
        </div>
    );
};

export default SecurityCard;