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
            secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for others
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Send email
        await transporter.sendMail({
            from: `"Contact Form" <${process.env.SMTP_USER}>`,
            to: process.env.CONTACT_RECEIVER,
            subject: `New Contact Message from ${name}`,
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
            📬 New Contact Message
          </h2>

          <p style="font-size: 15px; color: #444;">
            You’ve received a new message from your website contact form.
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
            This message was sent from your website’s contact form.
          </p>
        </div>
      </div>
    `,
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Contact form error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}