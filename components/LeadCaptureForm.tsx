"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function LeadCaptureForm({ user }: { user: any }) {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        message: "I'd like to request a quote for TeeScreen.",
    });

    function updateField(key: string, value: string) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function submitLead() {
        setLoading(true);

        try {
            const data = new FormData();
            Object.entries(form).forEach(([k, v]) => data.append(k, v));

            await fetch("/api/contact", {
                method: "POST",
                body: data,
            });

            setSubmitted(true);
        } catch (err) {
            console.error(err);
            alert("Something went wrong sending your request.");
        } finally {
            setLoading(false);
        }
    }

    if (submitted) {
        return (
            <Card className="p-6">
                <p className="text-green-600 font-medium">
                    Thank you — our sales team will contact you shortly.
                </p>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-6 space-y-6">

                <div className="space-y-2">
                    <Label>Your Name</Label>
                    <Input
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Your Message</Label>
                    <Textarea
                        value={form.message}
                        onChange={(e) => updateField("message", e.target.value)}
                    />
                </div>

                <Button onClick={submitLead} className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Request a Quote"}
                </Button>
            </CardContent>
        </Card>
    );
}