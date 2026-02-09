declare global {

    type UserData = {
        fullName: string;
        email: string;
        phoneNumber: string;
        clubName: string;
        clubType: string;
        role: string;
        loadedScreen:string;
    };

    type SignInFormData = {
        email: string;
        password: string;
        rememberMe: boolean;
    };

    type SignUpFormData = {
        fullName: string;
        email: string;
        password: string;
        phoneNumber: string;
        clubName: string;
        clubType: string;
        role: string;
    };

    type FormInputProps = {
        name: string;
        label: string;
        placeholder?: string;
        type?: string;
        register: UseFormRegister<any>;
        error?: FieldError;
        validation?: RegisterOptions;
        disabled?: boolean;
        value?: string | number | boolean | null;
        defaultValue?: string | number | boolean | null;
    };

    type Option = {
        value: string;
        label: string;
    };

    type SelectFieldProps = {
        name: string;
        label: string;
        placeholder: string;
        options: readonly Option[];
        control: Control;
        error?: FieldError;
        required?: boolean;
        onChange?: (value: string) => void;
        defaultValue?: string | number | boolean | null; // <-- add this
    };

    type InputFileProps = {
        id: string;
    };

    type FooterLinkProps = {
        text: string;
        linkText: string;
        href: string;
    };

    type SearchCommandProps = {
        renderAs?: 'button' | 'text';
        label?: string;
        initialStocks: StockWithWatchlistStatus[];
    };

    type WelcomeEmailData = {
        email: string;
        name: string;
        intro: string;
    };

    type User = {
        id: string;
        name: string;
        email: string;
    };

    type SearchCommandProps = {
        open?: boolean;
        setOpen?: (open: boolean) => void;
        renderAs?: 'button' | 'text';
        buttonLabel?: string;
        buttonVariant?: 'primary' | 'secondary';
        className?: string;
    };
}

export {};