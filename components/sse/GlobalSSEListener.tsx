"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import {useDirtyState} from "@/stores/user-store";
import {getUserInfo} from "@/lib/actions/user.actions";

export function GlobalSSEListener({ screenName, userId }: { screenName: string, userId: string }) {
    const {setDirty } = useDirtyState();

    useEffect(() => {
        if (!screenName) return;

        const es = new EventSource(`/api/events?screen=${screenName}`);

        es.addEventListener("screenUpdated", (event) => {
            const data = JSON.parse(event.data);

            if (data.editedBy) {
                if (data.editedBy == userId)
                {
                    return;
                }

                if(data.message && data.editedByName)
                {
                    toast.info(`${data.editedByName} ${data.message}`, {
                        description: "Your preview has been refreshed.",
                        duration: 4000,
                    });
                }
                else {
                    toast.info(`${data.editedByName} updated ${data.screen}`, {
                        description: "Your preview has been refreshed.",
                        duration: 4000,
                    });
                }

                if(data?.type == "reset")
                {
                    setDirty(false);
                }
                else
                {
                    setDirty(true);
                }

                // Dispatch global event for other components
                window.dispatchEvent(
                    new CustomEvent("screen-updated", { detail: data })
                );
            }
        });

        return () => es.close();
    }, [screenName]);

    return null;
}
