// src/contact/contact.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

@Injectable()
export class ContactService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.configService.get("EMAIL"),
        pass: this.configService.get("PASSWORD"),
      },
    });
  }

  validateContactData(formData: ContactFormData) {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name?.trim()) errors.push("Name is required");
    if (!formData.email?.trim()) errors.push("Email is required");
    else if (!emailRegex.test(formData.email))
      errors.push("Invalid email format");
    if (!formData.subject?.trim()) errors.push("Subject is required");
    if (!formData.message?.trim()) errors.push("Message is required");

    return { valid: errors.length === 0, errors };
  }

  async sendContactMessage(
    formData: ContactFormData,
    adminEmail: string,
    currentDate: number
  ) {
    const referenceId = `PACAM-CONTACT-${currentDate}`;
    const submissionDate = new Date(currentDate).toLocaleString();
    const htmlTemplate = this.createAdminEmailTemplate(
      formData,
      submissionDate,
      referenceId
    );

    return new Promise((resolve, reject) => {
      const mail_configs = {
        from: this.configService.get("EMAIL"),
        to: adminEmail,
        subject: `PACAM Contact Form: ${formData.subject}`,
        html: htmlTemplate,
        replyTo: formData.email,
      };

      this.transporter.sendMail(mail_configs, function (error, info) {
        if (error) {
          console.log(error);
          return reject({ message: "An error occurred sending email" });
        }
        return resolve({ message: "Email sent successfully" });
      });
    });
  }

  async sendClientConfirmationEmail(
    formData: ContactFormData,
    currentDate: number
  ) {
    const referenceId = `PACAM-CONTACT-${currentDate}`;
    const htmlTemplate = this.createClientConfirmationTemplate(
      formData,
      referenceId
    );

    return new Promise((resolve, reject) => {
      const mail_configs = {
        from: this.configService.get("EMAIL"),
        to: formData.email,
        subject: "PACAM - We received your message",
        html: htmlTemplate,
      };

      this.transporter.sendMail(mail_configs, function (error, info) {
        if (error) {
          console.log(error);
          return reject({
            message: "An error occurred sending confirmation email",
          });
        }
        return resolve({ message: "Confirmation email sent successfully" });
      });
    });
  }

  private createAdminEmailTemplate(
    formData: ContactFormData,
    submissionDate: string,
    referenceId: string
  ): string {
    const brandColor = "#1e40af";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PACAM Contact Form Submission</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; }
        .container { max-width: 700px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0 0 8px 0; font-size: 24px; }
        .header h2 { margin: 0; font-size: 20px; font-weight: 300; }
        .content { padding: 30px; }
        .greeting { font-size: 16px; margin-bottom: 20px; color: ${brandColor}; font-weight: 600; }
        .section { margin-bottom: 24px; background-color: #f8fafc; border-radius: 8px; padding: 20px; border-left: 4px solid ${brandColor}66; }
        .section-title { font-size: 16px; font-weight: bold; color: ${brandColor}; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
        .info-row { display: flex; gap: 12px; margin-bottom: 8px; }
        .info-label { font-weight: 600; color: #374151; min-width: 100px; }
        .info-value { color: #1f2937; }
        .message-box { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; white-space: pre-wrap; color: #1f2937; }
        .submission-info { background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
        .submission-info strong { color: #065f46; }
        .footer { background-color: #1f2937; color: white; padding: 24px; text-align: center; font-size: 13px; }
        .footer .copyright { font-size: 11px; opacity: 0.7; border-top: 1px solid #374151; padding-top: 12px; margin-top: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PACAM</h1>
            <h2>New Contact Form Message</h2>
        </div>
        <div class="content">
            <div class="greeting">Dear Administrator,</div>
            <p>A new message has been submitted through the PACAM contact form. Details below.</p>

            <div class="section">
                <p class="section-title">Sender Details</p>
                <div class="info-row"><span class="info-label">Name:</span><span class="info-value">${formData.name}</span></div>
                <div class="info-row"><span class="info-label">Email:</span><span class="info-value">${formData.email}</span></div>
                <div class="info-row"><span class="info-label">Phone:</span><span class="info-value">${formData.phone || "Not provided"}</span></div>
                <div class="info-row"><span class="info-label">Subject:</span><span class="info-value">${formData.subject}</span></div>
            </div>

            <div class="section">
                <p class="section-title">Message</p>
                <div class="message-box">${formData.message}</div>
            </div>

            <div class="submission-info">
                <strong>Submitted:</strong> ${submissionDate} &nbsp;|&nbsp; <strong>Reference:</strong> ${referenceId}
            </div>

            <p>You can reply directly to this email to respond to <strong>${formData.name}</strong>.</p>
        </div>
        <div class="footer">
            <strong>PACAM Customer Service</strong><br>
            Email: info@pacassetmanagement.com | Phone: +234 811 111 1006
            <div class="copyright">© ${new Date().getFullYear()} PACAM. All rights reserved. Generated automatically from the PACAM online portal.</div>
        </div>
    </div>
</body>
</html>`;
  }

  private createClientConfirmationTemplate(
    formData: ContactFormData,
    referenceId: string
  ): string {
    const brandColor = "#1e40af";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PACAM - Message Received</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0 0 8px 0; }
        .header h2 { margin: 0; font-weight: 300; font-size: 18px; }
        .content { padding: 30px; }
        .confirmation-badge { background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
        .confirmation-badge h3 { color: #065f46; margin: 0 0 8px 0; }
        .confirmation-badge p { margin: 0; color: #047857; }
        .info-box { background-color: #f0f9ff; border-left: 4px solid ${brandColor}; padding: 16px; margin: 20px 0; border-radius: 4px; }
        .footer { background-color: #1f2937; color: white; padding: 24px; text-align: center; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PACAM</h1>
            <h2>Message Received</h2>
        </div>
        <div class="content">
            <p>Dear ${formData.name},</p>

            <div class="confirmation-badge">
                <h3>✅ Your message has been received</h3>
                <p>Reference: <strong>${referenceId}</strong></p>
            </div>

            <p>Thank you for reaching out to us. We have received your message regarding "<strong>${formData.subject}</strong>" and our team will get back to you shortly.</p>

            <div class="info-box">
                <strong>What happens next?</strong>
                <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                    <li>Our team will review your message</li>
                    <li>We will respond to you at <strong>${formData.email}</strong></li>
                    <li>Typical response time is 1–2 business days</li>
                </ul>
            </div>

            <p>If your enquiry is urgent, please call us directly at <strong>+234 811 111 1006</strong> or visit our office at Plot 8A, Elsie Femi Pearse Street, Victoria Island, Lagos.</p>
        </div>
        <div class="footer">
            <strong>PACAM Customer Service</strong><br>
            Email: info@pacassetmanagement.com | Phone: +234 811 111 1006
        </div>
    </div>
</body>
</html>`;
  }
}
