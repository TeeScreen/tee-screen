"use client";

import { useState } from "react";
import { PhoneCall, MoveRight } from "lucide-react";
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

export const LeadCaptureForm = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        method: "phone",
        screen: "wall",
        message: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [serverMessage, setServerMessage] = useState("");

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!form.name.trim()) newErrors.name = "Name is required";
        if (!form.email.trim()) newErrors.email = "Email is required";

        // NEW RULE: If preferred method is phone, phone is required
        if (form.method === "phone" && !form.phone.trim()) {
            newErrors.phone = "Phone number is required when phone is the preferred contact method";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setStatus("loading");
        setServerMessage("");

        try {
            const res = await fetch("https://teescreenapp.com/api/lead", {
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
                setServerMessage(data.message || "Message sent successfully.");

                setForm({
                    name: "",
                    email: "",
                    phone: "",
                    method: "phone",
                    screen: "wall",
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
        <div id="contact" className="w-full py-20 lg:py-40">
            <div className="w-[80%] container max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16">

                    {/* LEFT SIDE */}
                    <div className="flex flex-col gap-8">
                        <Badge variant="outline" className="w-fit">Contact</Badge>

                        <h4 className="text-3xl md:text-5xl tracking-tight max-w-xl font-light">
                            Speak with our team
                        </h4>

                        <p className="text-lg leading-relaxed text-muted-foreground max-w-md">
                            Whether you're upgrading a stadium, modernising a golf club, or installing
                            digital signage across your venue, our team will guide you through the
                            right screens, software, and installation options.
                        </p>

                        <div className="flex flex-col gap-6 mt-4">
                            {[
                                {
                                    title: "Fast response",
                                    desc: "A member of our sales team will contact you shortly.",
                                },
                                {
                                    title: "Tailored recommendations",
                                    desc: "Get expert guidance based on your venue and requirements.",
                                },
                                {
                                    title: "No pressure",
                                    desc: "Just clear answers and honest advice.",
                                },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <PhoneCall className="w-5 h-5 text-primary mt-1" />
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

                            <p className="text-xl font-medium">Request a callback</p>

                            {/* NAME */}
                            <div className="grid gap-1">
                                <Label>Full name *</Label>
                                <Input
                                    type="text"
                                    placeholder="John Smith"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                                {errors.name && (
                                    <p className="text-red-600 text-sm">{errors.name}</p>
                                )}
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
                                {errors.email && (
                                    <p className="text-red-600 text-sm">{errors.email}</p>
                                )}
                            </div>

                            {/* PHONE */}
                            <div className="grid gap-1">
                                <Label>Phone number {form.method === "phone" && "*"}</Label>
                                <Input
                                    type="tel"
                                    placeholder="+44 7123 456789"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                                {errors.phone && (
                                    <p className="text-red-600 text-sm">{errors.phone}</p>
                                )}
                            </div>

                            {/* CONTACT METHOD */}
                            <div className="grid gap-1">
                                <Label>Preferred contact method</Label>
                                <Select
                                    value={form.method}
                                    onValueChange={(v) => {
                                        setForm({ ...form, method: v });
                                        setErrors({ ...errors, phone: "" });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="phone">Phone Call</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* SCREEN TYPE */}
                            <div className="grid gap-1">
                                <Label>Which screen are you most interested in?</Label>
                                <Select
                                    value={form.screen}
                                    onValueChange={(v) => setForm({ ...form, screen: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a screen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="wall">Wall Mounted</SelectItem>
                                        <SelectItem value="framed">Framed</SelectItem>
                                        <SelectItem value="free-stand">Free Standing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* MESSAGE */}
                            <div className="grid gap-1">
                                <Label>How can we help?</Label>
                                <Textarea
                                    placeholder="Tell us about your project…"
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
