"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { ScreenData } from "@/database/models/user.model";

export function ScreenItem({
                               screen,
                               isLoaded,
                               onLoad,
                               onDelete,
                           }: {
    screen: ScreenData;
    isLoaded: boolean;
    onLoad: (login: string) => void;
    onDelete: (login: string) => void;
}) {
    return (
        <div
            className={`p-4 border rounded-lg flex justify-between items-center ${
                isLoaded ? "bg-muted border-primary/10" : ""
            }`}
        >
            <div>
                <p className="font-medium">
                    {screen.screenLogin}
                    {isLoaded && (
                        <span className="ml-2 text-xs text-primary font-semibold">
              (Loaded)
            </span>
                    )}
                </p>

                {screen.screenLogin && (
                    <p className="text-sm">Login: {screen.screenLogin}</p>
                )}
            </div>

            <div className="flex gap-2">
                {/* Load Screen */}
                <form action={() => onLoad(screen.screenLogin)}>
                    <Button type="submit" variant={isLoaded ? "secondary" : "default"}>
                        {isLoaded ? "Loaded" : "Load Screen"}
                    </Button>
                </form>

                {/* Delete Dialog */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive">Delete</Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Screen</DialogTitle>
                        </DialogHeader>

                        <p>
                            Are you sure you want to delete{" "}
                            <strong>{screen.screenLogin}</strong>?
                        </p>

                        <DialogFooter>
                            <form action={() => onDelete(screen.screenLogin)}>
                                <Button variant="destructive" type="submit">
                                    Confirm Delete
                                </Button>
                            </form>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}