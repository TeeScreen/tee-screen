'use client';
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import SelectField from "@/components/forms/SelectField";
import {CLUB_TYPES} from "@/lib/constants";
import FooterLink from "@/components/forms/FooterLink";
import { toast } from "sonner"
import {signUpWithEmail} from "@/lib/actions/auth.actions";
import {useRouter} from "next/navigation";

const SignUp = () => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        defaultValues:{
            fullName: '',
            email: '',
            password: '',
            phoneNumber: '',
            clubName: '',
            clubType: '',
            role: '',
        },
        mode: 'onBlur'
    })
    const onSubmit = async (data: SignUpFormData) => {
        try {
            const result = await signUpWithEmail(data);

            if(result.success) {
                router.push("/");
                toast("Sign up was successful");
            }
        } catch (e) {
           console.log(e);
            toast.error("Sign up was failed", {
                description: e instanceof Error ? e.message : "Failed to create account",
            });

        }
    }

    return (
        <>
            <h1 className = "form-title">Sign Up & Personalize</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    name="password"
                    label="Password"
                    placeholder="Enter a strong password"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{required: 'Password is required', minLength: 8}}
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

                <SelectField
                    name = "clubType"
                    label = "Club Type"
                    placeholder = "Select your club type"
                    options = {CLUB_TYPES}
                    control = {control}
                    error = {errors.clubType}
                />

                <InputField
                    name="role"
                    label="Role"
                    placeholder="Enter your role in the club"
                    type="role"
                    register={register}
                    error={errors.role}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full mt-5">
                    {isSubmitting ? 'Creating Account' : 'Start Your Investment Journey'}
                </Button>

                <FooterLink text={"Already have an account"} linkText={"Sign In"} href={"/sign-in"}/>
            </form>
        </>
    )
}
export default SignUp
