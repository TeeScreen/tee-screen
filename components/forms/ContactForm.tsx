"use client";

import { useState } from "react";
import { MoveRight, LifeBuoy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import {SERVER_URL} from "@/lib/constants";

export const ContactForm = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        category: "general",
        message: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [serverMessage, setServerMessage] = useState("");

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) newErrors.name = "Name is required";
        if (!form.email.trim()) newErrors.email = "Email is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setStatus("loading");
        setServerMessage("");

        try {
            const res = await fetch(`${SERVER_URL}/contact_tech`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                setStatus("error");
                setServerMessage(`Server returned ${res.status}`);
                return;
            }

            const raw = await res.text();
            let data = null;

            try {
                data = JSON.parse(raw);
            } catch {
                setStatus("error");
                setServerMessage("Invalid JSON response from server");
                return;
            }

            if (data?.success) {
                setStatus("success");
                setServerMessage(data.message || "Your request has been submitted.");
                setForm({
                    name: "",
                    email: "",
                    category: "general",
                    message: "",
                });
            } else {
                setStatus("error");
                setServerMessage(data?.error || "Something went wrong.");
            }
        } catch (err: any) {
            setStatus("error");
            setServerMessage(err?.message || "Network error");
        }
    };

    return (
        <div id="contact-tech" className="w-full py-20 lg:py-40">
            <div className="w-[80%] container max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16">

                    {/* LEFT SIDE */}
                    <div className="flex flex-col gap-8">
                        <Badge variant="outline" className="w-fit">Tech Help</Badge>

                        <h4 className="text-3xl md:text-5xl tracking-tight max-w-xl font-light">
                            Get technical support
                        </h4>

                        <p className="text-lg leading-relaxed text-muted-foreground max-w-md">
                            Facing issues with your screens, software, or integrations? Our technical support team is here to help troubleshoot and resolve your problems quickly.
                        </p>

                        <div className="flex flex-col gap-6 mt-4">
                            {[
                                {
                                    title: "Quick assistance",
                                    desc: "We aim to respond to your request promptly.",
                                },
                                {
                                    title: "Expert troubleshooting",
                                    desc: "Our engineers will guide you through fixes and solutions.",
                                },
                                {
                                    title: "Clear communication",
                                    desc: "No jargon — just straightforward help.",
                                },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <LifeBuoy className="w-5 h-5 text-primary mt-1" />
                                    <div>
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT SIDE — FORM */}
                    <div className="flex justify-center items-center">
                        <div className="rounded-xl max-w-md w-full flex flex-col border p-8 gap-6 shadow-sm bg-background/60 backdrop-blur">

                            <p className="text-xl font-medium">Submit a support request</p>

                            {/* NAME */}
                            <div className="grid gap-1">
                                <Label>Full name *</Label>
                                <Input
                                    type="text"
                                    placeholder="Jane Doe"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                                {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                            </div>

                            {/* EMAIL */}
                            <div className="grid gap-1">
                                <Label>Email *</Label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                                {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                            </div>

                            {/* ISSUE CATEGORY */}
                            <div className="grid gap-1">
                                <Label>Issue category</Label>
                                <Select
                                    value={form.category}
                                    onValueChange={(v) => setForm({ ...form, category: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="portal">Portal</SelectItem>
                                        <SelectItem value="account">Account</SelectItem>
                                        <SelectItem value="screen software">Screen Software</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* MESSAGE */}
                            <div className="grid gap-1">
                                <Label>Describe your issue</Label>
                                <Textarea
                                    placeholder="Tell us what problem you're experiencing…"
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                />
                            </div>

                            <Button
                                className="gap-2 w-full"
                                onClick={handleSubmit}
                                disabled={status === "loading"}
                            >
                                {status === "loading" ? "Submitting…" : "Submit"}
                                <MoveRight className="w-4 h-4" />
                            </Button>

                            {status !== "idle" && (
                                <p
                                    className={
                                        status === "success"
                                            ? "text-green-600 text-sm"
                                            : "text-red-600 text-sm"
                                    }
                                >
                                    {serverMessage}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
