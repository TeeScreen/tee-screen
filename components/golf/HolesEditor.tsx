"use client";

import { useState } from "react";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import HoleEditor from "./HoleEditor";

type HolesEditorProps = {
    courseName: string;
    holesData: any[];
    form: any; // UseFormReturn<any>
    updateCourse: (courseName: string, path: string, value: any) => void;
};

export default function HolesEditor({
                                        courseName,
                                        holesData,
                                        form,
                                        updateCourse,
                                    }: HolesEditorProps) {
    const holeIds = holesData.map((_, i) => `hole-${i}`);
    const [openHoles, setOpenHoles] = useState<string[]>([]);

    const expandAllHoles = () => setOpenHoles(holeIds);
    const collapseAllHoles = () => setOpenHoles([]);

    return (
        <div className="space-y-3 border rounded p-2">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Holes Data</h3>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={expandAllHoles}>
                        Expand All Holes
                    </Button>
                    <Button type="button" variant="outline" onClick={collapseAllHoles}>
                        Collapse All Holes
                    </Button>
                </div>
            </div>

            <Accordion
                type="multiple"
                value={openHoles}
                onValueChange={(val) => setOpenHoles(val as string[])}
                className="border rounded p-2"
            >
                {holesData.map((hole, i) => (
                    <HoleEditor
                        key={i}
                        value={`hole-${i}`}
                        courseName={courseName}
                        hole={hole}
                        index={i}
                        form={form}
                        updateCourse={updateCourse}
                    />
                ))}
            </Accordion>
        </div>
    );
}