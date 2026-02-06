"use client";

import { useState } from "react";
import {
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
    Accordion,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import HoleCoordinatesEditor from "./HoleCoordinatesEditor";
import HoleYardageEditor from "./HoleYardageEditor";
import HoleDetailsEditor from "./HoleDetailsEditor";

type HoleEditorProps = {
    value: string;
    courseName: string;
    hole: any;
    index: number;
    form: any; // UseFormReturn<any>
    updateCourse: (courseName: string, path: string, value: any) => void;
};

export default function HoleEditor({
                                       value,
                                       courseName,
                                       hole,
                                       index,
                                       form,
                                       updateCourse,
                                   }: HoleEditorProps) {
    const sectionIds = ["coordinates", "yardages", "details"];
    const [openSections, setOpenSections] = useState<string[]>([]);

    const expandAllSections = () => setOpenSections(sectionIds);
    const collapseAllSections = () => setOpenSections([]);

    return (
        <AccordionItem value={value}>
            <AccordionTrigger>
                Hole {hole.holeNumber ?? index + 1}
            </AccordionTrigger>

            <AccordionContent className="space-y-3 p-2">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-base">Hole Sections</h4>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={expandAllSections}
                        >
                            Expand Sections
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={collapseAllSections}
                        >
                            Collapse Sections
                        </Button>
                    </div>
                </div>

                <Accordion
                    type="multiple"
                    value={openSections}
                    onValueChange={(val) => setOpenSections(val as string[])}
                    className="border rounded p-2"
                >
                    <AccordionItem value="coordinates">
                        <AccordionTrigger>Coordinates</AccordionTrigger>
                        <AccordionContent className="space-y-3 p-2">
                            <HoleCoordinatesEditor
                                courseName={courseName}
                                hole={hole}
                                index={index}
                                form={form}
                                updateCourse={updateCourse}
                            />
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="yardages">
                        <AccordionTrigger>Yardages</AccordionTrigger>
                        <AccordionContent className="space-y-3 p-2">
                            <HoleYardageEditor
                                courseName={courseName}
                                hole={hole}
                                index={index}
                                form={form}
                                updateCourse={updateCourse}
                            />
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="details">
                        <AccordionTrigger>Details</AccordionTrigger>
                        <AccordionContent className="space-y-3 p-2">
                            <HoleDetailsEditor
                                courseName={courseName}
                                hole={hole}
                                index={index}
                                form={form}
                                updateCourse={updateCourse}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </AccordionContent>
        </AccordionItem>
    );
}