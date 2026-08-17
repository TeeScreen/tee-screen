import { TableMeta } from "@tanstack/react-table";
import { ScheduleEntry } from "@/components/ScheduleUploader";

declare module "@tanstack/react-table" {
    interface TableMeta<TData extends unknown> {
        setData?: React.Dispatch<React.SetStateAction<ScheduleEntry[]>>;
        updateData?: (updatedDay: ScheduleEntry[]) => void;
    }
}
