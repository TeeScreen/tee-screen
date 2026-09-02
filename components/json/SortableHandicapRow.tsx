"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import HandicapItem from "@/components/json/HandicapItem";

export default function SortableHandicapRow(props : any) {
    const { id, index } = props;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id,
        data: { index },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || "transform 150ms cubic-bezier(0.25, 1, 0.5, 1)",
    };

    return (
        <tr ref={setNodeRef} style={style} className="border-b">
            <td
                {...attributes}
                {...listeners}
                className="cursor-grab select-none px-2 w-8 text-muted-foreground hover:text-foreground transition-colors"
            >
                <GripVertical size={18} />
            </td>

            <HandicapItem {...props} />
        </tr>
    );
}
