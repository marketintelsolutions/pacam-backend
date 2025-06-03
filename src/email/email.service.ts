// src/email/email.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { RedemptionFormData } from "../types/redemption.types";

@Injectable()
export class EmailService {
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

  async sendRedemptionForm(
    formData: RedemptionFormData,
    pdfContent: string,
    fundManagerEmail: string,
    currentDate
  ) {
    return new Promise((resolve, reject) => {
      const referenceId = `PACAM-${currentDate}`;

      const htmlTemplate = this.createRedemptionEmailTemplate(
        formData,
        currentDate,
        referenceId
      );

      const mail_configs = {
        from: this.configService.get("EMAIL"),
        to: fundManagerEmail,
        subject: "PACAM Fund Redemption Form Submission",
        html: htmlTemplate,
        attachments: [
          {
            filename: `PACAM_Redemption_${formData.clientId}_${currentDate}.pdf`,
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

  private createRedemptionEmailTemplate(
    formData: RedemptionFormData,
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
    <title>PACAM Fund Redemption Form Submission</title>
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
            <h2 class="title">Fund Redemption Form</h2>
            <p class="subtitle">New Redemption Request Received</p>
        </div>

        <div class="content">
            <div class="greeting">
                Dear Fund Manager,
            </div>

            <p>A new redemption form has been submitted through the ${brandName} online portal. Please find the details below and the complete PDF form attached to this email.</p>

            <!-- Personal Information Section -->
            <div class="section">
                <h3 class="section-title">Personal Information</h3>
                <div class="info-grid">
                    <div class="info-label">Full Name:</div>
                    <div class="info-value">${
                      formData.fullName || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Client ID:</div>
                    <div class="info-value">${
                      formData.clientId || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Email:</div>
                    <div class="info-value">${
                      formData.email || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Telephone:</div>
                    <div class="info-value">${
                      formData.telephoneNumber || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Date:</div>
                    <div class="info-value">${
                      formData.date || "Not provided"
                    }</div>
                </div>
            </div>

            <!-- Redemption Details Section -->
            <div class="section">
                <h3 class="section-title">Redemption Details</h3>
                <div class="info-grid">
                    <div class="info-label">Units to Redeem (Figures):</div>
                    <div class="info-value">${
                      formData.unitsToRedeemFigures || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Units to Redeem (Words):</div>
                    <div class="info-value">${
                      formData.unitsToRedeemWords || "Not provided"
                    }</div>
                </div>
            </div>

            <!-- Payment Details Section -->
            <div class="section">
                <h3 class="section-title">Payment Details</h3>
                <div class="info-grid">
                    <div class="info-label">Bank:</div>
                    <div class="info-value">${
                      formData.bank || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Branch:</div>
                    <div class="info-value">${
                      formData.branch || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Sort Code:</div>
                    <div class="info-value">${
                      formData.sortCode || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Account Number:</div>
                    <div class="info-value">${
                      formData.accountNumber || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Account Name:</div>
                    <div class="info-value">${
                      formData.accountName || "Not provided"
                    }</div>
                </div>
            </div>

            ${
              formData.certificateNumbers ||
              formData.totalUnits ||
              formData.previousRedemption ||
              formData.balance ||
              formData.currentRedemption
                ? `
            <!-- Certificate Details Section -->
            <div class="section">
                <h3 class="section-title">Certificate Details</h3>
                ${
                  formData.certificateNumbers
                    ? `
                <div class="info-grid">
                    <div class="info-label">Certificate Numbers:</div>
                    <div class="info-value">${formData.certificateNumbers}</div>
                </div>
                `
                    : ""
                }
                ${
                  formData.totalUnits
                    ? `
                <div class="info-grid">
                    <div class="info-label">Total Units:</div>
                    <div class="info-value">${formData.totalUnits}</div>
                </div>
                `
                    : ""
                }
                ${
                  formData.previousRedemption
                    ? `
                <div class="info-grid">
                    <div class="info-label">Previous Redemption:</div>
                    <div class="info-value">${formData.previousRedemption}</div>
                </div>
                `
                    : ""
                }
                ${
                  formData.balance
                    ? `
                <div class="info-grid">
                    <div class="info-label">Balance:</div>
                    <div class="info-value">${formData.balance}</div>
                </div>
                `
                    : ""
                }
                ${
                  formData.currentRedemption
                    ? `
                <div class="info-grid">
                    <div class="info-label">Current Redemption:</div>
                    <div class="info-value">${formData.currentRedemption}</div>
                </div>
                `
                    : ""
                }
            </div>
            `
                : ""
            }

            <!-- Attachment Notice -->
            <div class="attachment-notice">
                <strong>📎 PDF Attachment</strong><br>
                The complete redemption form with signatures is attached to this email as a PDF document.
            </div>

            <!-- Important Notes -->
            <div class="important-notes">
                <h3>⚠️ Important Processing Notes</h3>
                <ul>
                    <li>Please verify all client information against your records</li>
                    <li>Ensure the signature(s) match those on file</li>
                    <li>Process redemption at the bid price prevailing on the date of redemption</li>
                    <li>10% of positive total returns will be charged as applicable</li>
                    <li>Payment should only be made to the account details provided</li>
                    <li>In case of partial redemption, send balance statement to client's email</li>
                </ul>
            </div>

            <!-- Submission Information -->
            <div class="submission-info">
                <strong>✅ Submission Confirmed</strong><br>
                <strong>Submitted on:</strong> ${submissionDate}<br>
                <strong>Reference ID:</strong> ${referenceId}<br>
                <strong>Client Email:</strong> ${formData.email}
            </div>

            <p>Please process this redemption request in accordance with your standard procedures. If you need any clarification or additional documentation, please contact the client directly using the provided contact information.</p>
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
                This email was generated automatically from the ${brandName} online redemption portal.<br>
                For technical support, please contact our IT department.
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  //Send confirmation email to client
  async sendClientConfirmationEmail(
    formData: RedemptionFormData,
    pdfContent: string,
    currentDate
  ) {
    const referenceId = `PACAM-${currentDate}`;

    const htmlTemplate = this.createClientConfirmationTemplate(
      formData,
      referenceId
    );

    const mail_configs = {
      from: this.configService.get("EMAIL"),
      to: formData.userEmail,
      subject: "PACAM Fund Redemption - Submission Confirmation",
      html: htmlTemplate,
      attachments: [
        {
          filename: `PACAM_Redemption_${formData.clientId}_${currentDate}.pdf`,
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

  private createClientConfirmationTemplate(
    formData: RedemptionFormData,
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
    <title>Redemption Form Confirmation</title>
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
            <h2>Redemption Form Received</h2>
        </div>

        <div class="content">
            <p>Dear ${formData.fullName},</p>

            <div class="confirmation-badge">
                <h3 style="color: #065f46; margin: 0;">✅ Form Successfully Submitted</h3>
                <p style="margin: 10px 0 0 0; color: #047857;">Reference: <strong>${referenceId}</strong></p>
            </div>

            <p>Thank you for submitting your redemption form. We have received your request and it is now being processed by our fund management team.</p>

            <div class="next-steps">
                <h4 style="color: ${brandColor}; margin-top: 0;">Next Steps:</h4>
                <ul>
                    <li>Your form will be reviewed within 1-2 business days</li>
                    <li>We will verify your information and process the redemption</li>
                    <li>Payment will be made to the account details you provided</li>
                    <li>You will receive an email confirmation once processing is complete</li>
                </ul>
            </div>

            <p><strong>Important:</strong> Please keep your reference number (${referenceId}) for your records. You may need it for any future inquiries about this redemption.</p>

            <p>If you have any questions or need to make changes to your request, please contact our customer service team immediately.</p>
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
