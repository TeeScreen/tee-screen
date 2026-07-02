"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function GlobalSSEListener({ screenName }: { screenName: string }) {
    useEffect(() => {
        if (!screenName) return;

        const es = new EventSource(`/api/events?screen=${screenName}`);

        es.addEventListener("screenUpdated", (event) => {
            const data = JSON.parse(event.data);
            console.log(data);
            // Toast notification
            if (data.editedBy) {
                if(data.message)
                {
                    toast.info(`${data.editedBy} ${data.message}`, {
                        description: "Your preview has been refreshed.",
                        duration: 4000,
                    });
                }
                else {
                    toast.info(`${data.editedBy} updated ${data.screen}`, {
                        description: "Your preview has been refreshed.",
                        duration: 4000,
                    });
                }

            }

            // Dispatch global event for other components
            window.dispatchEvent(
                new CustomEvent("screen-updated", { detail: data })
            );
        });

        return () => es.close();
    }, [screenName]);

    return null;
}
