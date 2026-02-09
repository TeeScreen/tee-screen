import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const message = formData.get("message") as string;

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Configure Nodemailer transport
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        //
        // 1. SEND EMAIL TO SALES TEAM
        //
        await transporter.sendMail({
            from: `"TeeScreen Lead" <${process.env.SMTP_USER}>`,
            to: process.env.CONTACT_RECEIVER,
            subject: `New Sales Lead from ${name}`,
            text: `
Name: ${name}
Email: ${email}

Message:
${message}
            `,
            html: `
                <div style="
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
                    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    background: #f7f7f8;
                    padding: 24px;
                ">
                    <div style="
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 12px;
                        padding: 32px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    ">
                        <h2 style="margin-top: 0; color: #111; font-size: 22px;">
                            📩 New Sales Lead
                        </h2>

                        <p style="font-size: 15px; color: #444;">
                            A new potential customer has reached out via the TeeScreen platform.
                        </p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

                        <h3 style="margin-bottom: 6px; font-size: 16px; color: #333;">👤 Name</h3>
                        <p style="margin-top: 0; font-size: 15px; color: #555;">${name}</p>

                        <h3 style="margin-bottom: 6px; font-size: 16px; color: #333;">📧 Email</h3>
                        <p style="margin-top: 0; font-size: 15px; color: #555;">${email}</p>

                        <h3 style="margin-bottom: 6px; font-size: 16px; color: #333;">💬 Message</h3>
                        <p style="margin-top: 0; font-size: 15px; color: #555; white-space: pre-line;">
                            ${message}
                        </p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

                        <p style="font-size: 13px; color: #888; text-align: center;">
                            Lead submitted via TeeScreen Sales Form.
                        </p>
                    </div>
                </div>
            `,
        });

        //
        // 2. SEND AUTO‑REPLY TO USER
        //
        await transporter.sendMail({
            from: `"TeeScreen Sales" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "We've received your request — TeeScreen Sales",
            text: `
Hi ${name},

Thanks for reaching out to the TeeScreen team. This is a quick confirmation that we’ve received your message and a member of our sales team will get back to you shortly.

Your message:
${message}

Best regards,
The TeeScreen Team
            `,
            html: `
                <div style="
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
                    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    background: #f7f7f8;
                    padding: 24px;
                ">
                    <div style="
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 12px;
                        padding: 32px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    ">
                        <h2 style="margin-top: 0; color: #111; font-size: 22px;">
                            👋 Thanks for contacting TeeScreen
                        </h2>

                        <p style="font-size: 15px; color: #444;">
                            Hi ${name},<br/><br/>
                            Thanks for reaching out to our sales team. This is a quick confirmation that we’ve received your message.
                            One of our team members will get back to you shortly.
                        </p>

                        <h3 style="margin-top: 24px; font-size: 16px; color: #333;">Your Message</h3>
                        <p style="font-size: 15px; color: #555; white-space: pre-line;">
                            ${message}
                        </p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

                        <p style="font-size: 14px; color: #666;">
                            In the meantime, feel free to reply directly to this email if you have any additional questions.
                        </p>

                        <p style="font-size: 14px; color: #666; margin-top: 16px;">
                            Best regards,<br/>
                            <strong>The TeeScreen Team</strong>
                        </p>
                    </div>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Sales form error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}