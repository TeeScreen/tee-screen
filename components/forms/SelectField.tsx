import {Label} from "@/components/ui/label";
import {Controller} from "react-hook-form";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const SelectField = ({name, label, placeholder, options, control, error, required = false}: SelectFieldProps) => {
    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="form-label">
                {label}
            </Label>

            <Controller
                name={name}
                control={control}
                rules={{
                    required: required ? `Please select ${label.toLowerCase()}` : false,
                }}
                render = {({field}) => (
                    <Select value = {field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="select-trigger">
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent className="bg-muted border-muted-foreground text-base">
                            {options.map((option) => (
                                <SelectItem value={option.value} key={option.value} className="focus:bg-muted-foreground/10 focus:text-primary">
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                        {error && <p className="text-sm text-red-500">{error.message}</p>}
                    </Select>
                )}
            />
        </div>
    )
}
export default SelectField
