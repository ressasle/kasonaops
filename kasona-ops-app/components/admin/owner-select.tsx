"use client";

import { User } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export type OwnerOption = {
    value: string;
    label: string;
};

type OwnerSelectProps = {
    value: string | null | undefined;
    onChange: (value: string) => void;
    options: OwnerOption[];
    label?: string;
    disabled?: boolean;
    placeholder?: string;
};

export function OwnerSelect({
    value,
    onChange,
    options,
    label = "Owner",
    disabled = false,
    placeholder = "Select owner…",
}: OwnerSelectProps) {
    return (
        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {label}
            </Label>
            <Select value={value ?? ""} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
