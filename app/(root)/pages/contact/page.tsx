import React from "react";
import { Contact} from "lucide-react";
import ContactForm from "@/components/ContactForm";

export default function Page() {
    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto ">
                <Contact/> Contact Us
            </h1>
            <div className="@container/main flex flex-col gap-4 md:gap-6">
                <ContactForm/>
            </div>
        </div>
    );
}
