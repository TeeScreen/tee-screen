'use client';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import InputField from "@/components/forms/InputField";
import { saveUserInfo } from "@/lib/actions/user.actions";
import {Input} from "postcss";
import {useState} from "react";

type EditProfileProps = {
    fullName: string;
    phoneNumber: string;
    clubName: string;
    role: string;
};

export function EditProfile({ fullName, phoneNumber, clubName, role }: EditProfileProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<UserData>({
        defaultValues: {
            fullName,
            phoneNumber,
            clubName,
            role,
        },
        mode: "onBlur",
    });

    const [open, setOpen] = useState(false);

    const onSubmit = async (data: UserData) => {
        console.log(data);
        await saveUserInfo({
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            clubName: data.clubName,
            role: data.role,
        });

        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Edit Profile</Button>
            </DialogTrigger>
                <DialogContent className="flex flex-col gap-2">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <InputField
                            name="fullName"
                            label="Full Name"
                            placeholder="John Doe"
                            register={register}
                            error={errors.fullName}
                        />

                        <InputField
                            name="phoneNumber"
                            label="Phone Number"
                            placeholder="Please enter a phone number"
                            register={register}
                            error={errors.phoneNumber}
                        />

                        <InputField
                            name="clubName"
                            label="Club Name"
                            placeholder="Enter your club's name"
                            register={register}
                            error={errors.clubName}
                        />

                        <InputField
                            name="role"
                            label="Role"
                            placeholder="Enter your role in the club"
                            register={register}
                            error={errors.role}
                        />
                    </div>

                    <DialogFooter className="gap-4">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving Changes" : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
                </DialogContent>
        </Dialog>
    );
}