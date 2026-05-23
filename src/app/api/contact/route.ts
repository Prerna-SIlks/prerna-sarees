import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789");

export async function POST(req: Request) {
  try {
    const { name, email, phone, message } = await req.json();

    // If there's no real API key, just mock success for development
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_123456789") {
      console.log("Mocking email send for:", { name, email, phone, message });
      return NextResponse.json({ success: true });
    }

    const data = await resend.emails.send({
      from: "Prerna Sarees <onboarding@resend.dev>",
      to: ["prernasilks@gmail.com"], // Using the provided email
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Message:
${message}
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
