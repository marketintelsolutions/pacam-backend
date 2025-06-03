// src/email-indemnity/email-indemnity.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { EmailIndemnityFormData } from "../types/email-indemnity.types";
import { EmailTemplateService } from "../email/email-template.service";

@Injectable()
export class EmailIndemnityService {
  private transporter;

  constructor(
    private configService: ConfigService,
    private emailTemplateService: EmailTemplateService
  ) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.configService.get("EMAIL"),
        pass: this.configService.get("PASSWORD"),
      },
    });
  }

  validateEmailIndemnityData(formData: EmailIndemnityFormData) {
    const errors: string[] = [];

    // Required fields for both variants
    const requiredFields = ["preferredEmail", "agreedToTerms"];

    if (formData.variant === "corporate") {
      requiredFields.push("companyName", "primarySignature");
    } else {
      requiredFields.push("accountHolderName", "signature");
    }

    requiredFields.forEach((field) => {
      if (
        !formData[field] ||
        (typeof formData[field] === "string" &&
          formData[field].toString().trim() === "")
      ) {
        errors.push(`${field} is required`);
      }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.preferredEmail && !emailRegex.test(formData.preferredEmail)) {
      errors.push("Invalid email format");
    }

    // Agreement validation
    if (!formData.agreedToTerms) {
      errors.push("Agreement to terms is required");
    }

    // Signature validation based on variant
    if (formData.variant === "corporate") {
      if (!formData.primarySignature) {
        errors.push("Primary signature is required for corporate forms");
      }
    } else {
      if (!formData.signature) {
        errors.push("Signature is required");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async sendEmailIndemnityForm(
    formData: EmailIndemnityFormData,
    pdfContent: string,
    adminEmail: string,
    currentDate: number
  ) {
    return new Promise((resolve, reject) => {
      const referenceId = `PACAM-INDEMNITY-${currentDate}`;

      const htmlTemplate = this.createEmailIndemnityTemplate(
        formData,
        new Date(currentDate).toLocaleString(),
        referenceId
      );

      const mail_configs = {
        from: this.configService.get("EMAIL"),
        to: adminEmail,
        subject: "PACAM Email Indemnity Agreement Submission",
        html: htmlTemplate,
        attachments: [
          {
            filename: `PACAM_Email_Indemnity_${formData.accountHolderName}_${currentDate}.pdf`,
            content: pdfContent,
            encoding: "base64",
          },
        ],
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
    formData: EmailIndemnityFormData,
    pdfContent: string,
    currentDate: number
  ) {
    const referenceId = `PACAM-INDEMNITY-${currentDate}`;

    const htmlTemplate = this.createClientConfirmationTemplate(
      formData,
      referenceId
    );

    const mail_configs = {
      from: this.configService.get("EMAIL"),
      to: formData.preferredEmail,
      subject: "PACAM Email Indemnity Agreement - Confirmation",
      html: htmlTemplate,
      attachments: [
        {
          filename: `PACAM_Email_Indemnity_${formData.accountHolderName}_${currentDate}.pdf`,
          content: pdfContent,
          encoding: "base64",
        },
      ],
    };

    return new Promise((resolve, reject) => {
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

  private createEmailIndemnityTemplate(
    formData: EmailIndemnityFormData,
    submissionDate: string,
    referenceId: string
  ): string {
    const brandColor = "#1e40af";
    const brandName = "PACAM";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PACAM Email Indemnity Agreement Submission</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .logo {
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            padding: 15px 25px;
            margin-bottom: 20px;
            display: inline-block;
        }
        .logo h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        .title {
            font-size: 28px;
            margin: 0;
            font-weight: 300;
        }
        .subtitle {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 25px;
            color: ${brandColor};
            font-weight: 600;
        }
        .section {
            margin-bottom: 30px;
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            border-left: 4px solid ${brandColor}66;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: ${brandColor};
            margin-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 5px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 10px;
            margin-bottom: 10px;
        }
        .info-label {
            font-weight: 600;
            color: #374151;
        }
        .info-value {
            color: #1f2937;
            word-break: break-word;
        }
        .important-notes {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .important-notes h3 {
            color: #92400e;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .important-notes ul {
            margin: 0;
            padding-left: 20px;
        }
        .important-notes li {
            margin-bottom: 8px;
            color: #92400e;
        }
        .submission-info {
            background-color: #ecfdf5;
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 25px 0;
        }
        .submission-info strong {
            color: #065f46;
            font-size: 16px;
        }
        .footer {
            background-color: #1f2937;
            color: white;
            padding: 25px;
            text-align: center;
        }
        .footer-content {
            margin-bottom: 15px;
        }
        .copyright {
            font-size: 12px;
            opacity: 0.8;
            border-top: 1px solid #374151;
            padding-top: 15px;
            margin-top: 15px;
        }
        .contact-info {
            font-size: 14px;
            margin-bottom: 10px;
        }
        .attachment-notice {
            background-color: #e0f2fe;
            border: 1px solid #0288d1;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        .attachment-notice strong {
            color: #01579b;
        }
        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            .content {
                padding: 20px;
            }
            .header {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <h1>${brandName}</h1>
            </div>
            <h2 class="title">Email Indemnity Agreement</h2>
            <p class="subtitle">New Agreement Submission Received</p>
        </div>

        <div class="content">
            <div class="greeting">
                Dear Administrator,
            </div>

            <p>A new Email Indemnity Agreement has been submitted through the ${brandName} online portal. Please find the details below and the complete PDF form attached to this email.</p>

            <!-- Contact Information Section -->
            <div class="section">
                <h3 class="section-title">Contact Information</h3>
                <div class="info-grid">
                    <div class="info-label">Account Holder Name:</div>
                    <div class="info-value">${
                      formData.accountHolderName || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Preferred Email:</div>
                    <div class="info-value">${
                      formData.preferredEmail || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Preferred Phone:</div>
                    <div class="info-value">${
                      formData.preferredPhone || "Not provided"
                    }</div>
                </div>
                ${
                  formData.variant === "corporate" && formData.companyName
                    ? `
                <div class="info-grid">
                    <div class="info-label">Company Name:</div>
                    <div class="info-value">${formData.companyName}</div>
                </div>
                `
                    : ""
                }
                <div class="info-grid">
                    <div class="info-label">Agreement Type:</div>
                    <div class="info-value">${
                      formData.variant === "corporate"
                        ? "Corporate"
                        : "Individual"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Signature Date:</div>
                    <div class="info-value">${
                      formData.signatureDate || "Not provided"
                    }</div>
                </div>
            </div>

            <!-- Attachment Notice -->
            <div class="attachment-notice">
                <strong>📎 PDF Attachment</strong><br>
                The complete Email Indemnity Agreement is attached to this email as a PDF document.
            </div>

            <!-- Important Notes -->
            <div class="important-notes">
                <h3>⚠️ Important Processing Notes</h3>
                <ul>
                    <li>The account holder has consented to electronic communication including email, SMS, WhatsApp, etc.</li>
                    <li>Instructions transmitted electronically are binding for all purposes including evidence</li>
                    <li>The account holder indemnifies PAC Asset Management Limited against all losses from electronic communication</li>
                    <li>There are acknowledged risks with electronic communication including delays, non-receipt, and third-party interference</li>
                    <li>PAC Asset Management Limited is authorized to rely on electronic communications from the specified email account</li>
                    <li>Please update the client's communication preferences in your system</li>
                    <li>File this agreement in the client's permanent records</li>
                </ul>
            </div>

            <!-- Submission Information -->
            <div class="submission-info">
                <strong>✅ Submission Confirmed</strong><br>
                <strong>Submitted on:</strong> ${submissionDate}<br>
                <strong>Reference ID:</strong> ${referenceId}<br>
                <strong>Client Email:</strong> ${formData.preferredEmail}
            </div>

            <p>Please process this agreement and update the client's communication preferences accordingly. If you need any clarification, please contact the client directly using the provided contact information.</p>
        </div>

        <div class="footer">
            <div class="footer-content">
                <div class="contact-info">
                    <strong>${brandName} Customer Service</strong><br>
                    Email: info@pacam.com | Phone: +234-XXX-XXXX<br>
                    Website: www.pacam.com
                </div>
            </div>
            
            <div class="copyright">
                © ${new Date().getFullYear()} ${brandName}. All rights reserved.<br>
                This email was generated automatically from the ${brandName} online portal.<br>
                For technical support, please contact our IT department.
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  private createClientConfirmationTemplate(
    formData: EmailIndemnityFormData,
    referenceId: string
  ): string {
    const brandColor = "#1e40af";
    const currentDate = new Date().toLocaleString();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Indemnity Agreement Confirmation</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        .confirmation-badge {
            background-color: #ecfdf5;
            border: 2px solid #10b981;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .next-steps {
            background-color: #f0f9ff;
            border-left: 4px solid ${brandColor};
            padding: 20px;
            margin: 20px 0;
        }
        .footer {
            background-color: #1f2937;
            color: white;
            padding: 25px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PACAM</h1>
            <h2>Email Indemnity Agreement Received</h2>
        </div>

        <div class="content">
            <p>Dear ${formData.accountHolderName},</p>

            <div class="confirmation-badge">
                <h3 style="color: #065f46; margin: 0;">✅ Agreement Successfully Submitted</h3>
                <p style="margin: 10px 0 0 0; color: #047857;">Reference: <strong>${referenceId}</strong></p>
            </div>

            <p>Thank you for submitting your Email Indemnity Agreement. We have received your consent for electronic communication and it is now being processed by our team.</p>

            <div class="next-steps">
                <h4 style="color: ${brandColor}; margin-top: 0;">What This Means:</h4>
                <ul>
                    <li>You have consented to receive communications via email, SMS, WhatsApp, and other electronic means</li>
                    <li>Electronic instructions from your specified email account will be considered binding</li>
                    <li>This agreement will be added to your account records</li>
                    <li>You can now receive account statements and communications electronically</li>
                </ul>
            </div>

            <p><strong>Important:</strong> Please keep your reference number (${referenceId}) for your records. This agreement remains in effect until formally revoked in writing.</p>

            <p>If you have any questions about electronic communication or need to make changes to your agreement, please contact our customer service team.</p>
        </div>

        <div class="footer">
            <div>
                <strong>PACAM Customer Service</strong><br>
                Email: info@pacam.com | Phone: +234-XXX-XXXX
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }
}
