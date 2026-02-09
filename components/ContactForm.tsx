"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactForm() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        message: "",
    });

    function updateField(key: string, value: string) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function submitContact() {
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
            alert("Something went wrong sending your message.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="@container/main flex flex-col gap-4 md:gap-6">
                {submitted ? (
                    <Card className="p-6">
                        <p className="text-green-600 font-medium">
                            Thank you — your message has been sent.
                        </p>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-6 space-y-6">

                            {/* NAME */}
                            <div className="space-y-2">
                                <Label>Your Name</Label>
                                <Input
                                    placeholder="John Doe"
                                    value={form.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                />
                            </div>

                            {/* EMAIL */}
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={(e) => updateField("email", e.target.value)}
                                />
                            </div>

                            {/* MESSAGE */}
                            <div className="space-y-2">
                                <Label>Your Message</Label>
                                <Textarea
                                    placeholder="How can we help?"
                                    value={form.message}
                                    onChange={(e) => updateField("message", e.target.value)}
                                />
                            </div>

                            <Button
                                onClick={submitContact}
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send Message"}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}