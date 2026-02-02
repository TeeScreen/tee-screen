"use client";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {useUserState} from "@/stores/user-store";
import {useForm} from "react-hook-form";
import InputField from "@/components/forms/InputField";
import SelectField from "@/components/forms/SelectField";
import {CLUB_TYPES} from "@/lib/constants";

export function EditProfile() {

    const {userData, setUser} = useUserState();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<UserData>({
        defaultValues:{
            fullName: '',
            email: '',
            phoneNumber: '',
            clubName: '',
            role: '',
        },
        mode: 'onBlur'
    })

    const onSubmit = async (data: UserData) => {
        setUser(data);
    }

    return (
        <Dialog>
            <form onSubmit={handleSubmit(onSubmit)} id="edit-profile" >
                <DialogTrigger asChild>
                    <Button variant="outline">Edit Profile</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <InputField
                            name="fullName"
                            label="Full Name"
                            placeholder="John Doe"
                            register={register}
                            error={errors.fullName}
                            validation={{required: 'Full Name is required', minLength: 2}}
                        />
                        <InputField
                            name="email"
                            label="Email"
                            placeholder="johndoe@gmail.com"
                            type="email"
                            register={register}
                            error={errors.email}
                            validation={{required: 'Email is required', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ , message: 'Email address is required'}}
                        />
                        <InputField
                            name="phoneNumber"
                            label="Phone Number"
                            placeholder="Please enter a phone number"
                            type="phoneNumber"
                            register={register}
                            error={errors.phoneNumber}
                        />
                        <InputField
                            name="clubName"
                            label="Club Name"
                            placeholder="Enter your club's name"
                            type="clubName"
                            register={register}
                            error={errors.clubName}
                        />
                        <InputField
                            name="role"
                            label="Role"
                            placeholder="Enter your role in the club"
                            type="role"
                            register={register}
                            error={errors.role}
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting} form="edit-profile">
                            {isSubmitting ? 'Saving Changes' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
