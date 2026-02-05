"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface JsonEditorProps {
    value: any;
    onChange: (updated: any) => void;
}

export function JsonEditor({ value, onChange }: JsonEditorProps) {
    const [text, setText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [collapsed, setCollapsed] = useState(false);

    // Load initial JSON
    useEffect(() => {
        setText(JSON.stringify(value, null, 2));
    }, [value]);

    function handleChange(newText: string) {
        setText(newText);

        try {
            const parsed = JSON.parse(newText);
            setError(null);
            onChange(parsed);
        } catch (err: any) {
            setError(err.message);
        }
    }

    function autoFormat() {
        try {
            const parsed = JSON.parse(text);
            const formatted = JSON.stringify(parsed, null, 2);
            setText(formatted);
            setError(null);
            onChange(parsed);
        } catch (err: any) {
            setError("Cannot format invalid JSON");
        }
    }

    return (
        <Card className="p-4 space-y-3">
            {/* Collapse / Expand Toggle */}
            <div className="flex items-center justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? "Expand JSON" : "Collapse JSON"}
                </Button>

                <Button
                    type="button"
                    variant="secondary"
                    onClick={autoFormat}
                >
                    Auto‑format
                </Button>
            </div>

            {/* Collapsed Preview */}
            {collapsed && (
                <div
                    className="font-mono text-sm bg-muted p-3 rounded cursor-pointer"
                    onClick={() => setCollapsed(false)}
                >
                    {text.trim().startsWith("{") ? "{ ... }" : "[ ... ]"}
                </div>
            )}

            {/* Full Editor */}
            {!collapsed && (
                <Textarea
                    className="font-mono text-sm min-h-[300px]"
                    value={text}
                    onChange={(e) => handleChange(e.target.value)}
                />
            )}

            {error && (
                <p className="text-destructive text-sm">
                    JSON Error: {error}
                </p>
            )}
        </Card>
    );
}