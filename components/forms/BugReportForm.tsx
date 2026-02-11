"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function BugReportForm() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [form, setForm] = useState({
        title: "",
        steps: "",
        expected: "",
        actual: "",
        environment: "",
        extra: "",
    });

    function updateField(key: string, value: string) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function submitBug() {
        setLoading(true);

        try {
            const data = new FormData();
            Object.entries(form).forEach(([k, v]) => data.append(k, v));

            const res = await fetch("/api/report-bug", {
                method: "POST",
                body: data,
            });

            if (!res.ok) throw new Error("Failed to submit bug");

            setSubmitted(true);
        } catch (err) {
            console.error(err);
            alert("Something went wrong submitting the bug.");
        } finally {
            setLoading(false);
        }
    }

    if (submitted) {
        return (
            <Card className="p-6">
                <p className="text-green-600 font-medium">
                    Thank you — your bug report has been submitted.
                </p>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-6 space-y-6">

                {/* TITLE */}
                <div className="space-y-2">
                    <Label>Short Title</Label>
                    <Input
                        placeholder="e.g. Map picker freezes on mobile"
                        value={form.title}
                        onChange={(e) => updateField("title", e.target.value)}
                    />
                </div>

                {/* STEPS */}
                <div className="space-y-2">
                    <Label>Steps to Reproduce</Label>
                    <Textarea
                        placeholder={`1. Open the map picker\n2. Tap on the map\n3. App freezes`}
                        value={form.steps}
                        onChange={(e) => updateField("steps", e.target.value)}
                    />
                </div>

                {/* EXPECTED */}
                <div className="space-y-2">
                    <Label>Expected Behaviour</Label>
                    <Textarea
                        placeholder="What did you expect to happen?"
                        value={form.expected}
                        onChange={(e) => updateField("expected", e.target.value)}
                    />
                </div>

                {/* ACTUAL */}
                <div className="space-y-2">
                    <Label>Actual Behaviour</Label>
                    <Textarea
                        placeholder="What actually happened?"
                        value={form.actual}
                        onChange={(e) => updateField("actual", e.target.value)}
                    />
                </div>

                {/* ENVIRONMENT */}
                <div className="space-y-2">
                    <Label>Environment</Label>
                    <Textarea
                        placeholder="Browser, device, OS, screen size, etc."
                        value={form.environment}
                        onChange={(e) => updateField("environment", e.target.value)}
                    />
                </div>

                {/* EXTRA */}
                <div className="space-y-2">
                    <Label>Additional Notes (optional)</Label>
                    <Textarea
                        placeholder="Anything else that might help?"
                        value={form.extra}
                        onChange={(e) => updateField("extra", e.target.value)}
                    />
                </div>

                <Button onClick={submitBug} className="w-full" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Bug Report"}
                </Button>
            </CardContent>
        </Card>
    );
}