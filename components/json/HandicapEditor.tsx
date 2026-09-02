"use client";

import {closestCenter, DndContext, PointerSensor, useSensor, useSensors,} from "@dnd-kit/core";

import {arrayMove, SortableContext, verticalListSortingStrategy,} from "@dnd-kit/sortable";

import {Button} from "@/components/ui/button";
import SortableHandicapRow from "./SortableHandicapRow";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

export default function HandicapEditor({
                                           courseName,
                                           handicapData,
                                           form,
                                           updateCourse,
                                           updateJson,
                                           localJson,
                                       }: {
    courseName: string;
    handicapData: any[];
    form: any;
    updateCourse: (courseName: string, path: string, value: any) => void;
    updateJson: (json: any) => void;
    localJson: any;
}) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {distance: 8},
        })
    );

    function handleDragEnd(event: any) {
        const {active, over} = event;
        if (!over || active.id === over.id) return;

        const oldIndex = active.data.current.index;
        const newIndex = over.data.current.index;

        const updated = structuredClone(localJson);
        const arr = updated.golfCoursesData[courseName].handicapData;

        updated.golfCoursesData[courseName].handicapData = arrayMove(arr, oldIndex, newIndex);

        updateJson(updated);
    }

    function addHandicap() {
        const updated = structuredClone(localJson);
        updated.golfCoursesData[courseName].handicapData.push({
            teeName: "Colour-Gender",
            displayedName: "Colour",
            gender: "Gender",
            par: 0,
            courseRating: 0,
            slopeRating: 0,

            frontNinePar: 0,
            frontNineCourseRating: 0,
            frontNineSlopeRating: 0,

            backNinePar: 0,
            backNineCourseRating: 0,
            backNineSlopeRating: 0,
        });
        updateJson(updated);
    }

    return (
        <Accordion type="multiple" className="border rounded p-2">
            <AccordionItem value="handicaps">
                <AccordionTrigger className="text-lg font-medium">
                    Handicap Data
                </AccordionTrigger>

                <AccordionContent className="space-y-4">
                    <Button type="button" onClick={addHandicap}>
                        Add Handicap
                    </Button>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext
                            items={handicapData.map((_, i) => `handicap-${i}`)}
                            strategy={verticalListSortingStrategy}
                        >
                            <table className="w-full border-collapse">
                                <tbody className="space-y-2">
                                {handicapData.map((handicap, index) => (
                                    <SortableHandicapRow
                                        key={index}
                                        id={`handicap-${index}`}
                                        index={index}
                                        courseName={courseName}
                                        handicap={handicap}
                                        form={form}
                                        updateCourse={updateCourse}
                                        updateJson={updateJson}
                                        localJson={localJson}
                                    />
                                ))}
                                </tbody>
                            </table>
                        </SortableContext>
                    </DndContext>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
