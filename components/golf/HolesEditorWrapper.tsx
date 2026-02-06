"use client";

import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import HolesEditor from "@/components/golf/HolesEditor";

type HolesEditorWrapperProps = {
    courseName: string;
    holesData: any[];
    form: any;
    updateCourse: (courseName: string, path: string, value: any) => void;
};

export default function HolesEditorWrapper({
                                               courseName,
                                               holesData,
                                               form,
                                               updateCourse,
                                           }: HolesEditorWrapperProps) {
    return (
        <Accordion type="multiple" className="border rounded p-2">
            <AccordionItem value={`${courseName}-holes`}>
                <AccordionTrigger className="text-lg font-medium">
                    Holes Data
                </AccordionTrigger>

                <AccordionContent className="space-y-4 p-2">
                    <HolesEditor
                        courseName={courseName}
                        holesData={holesData}
                        form={form}
                        updateCourse={updateCourse}
                    />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}