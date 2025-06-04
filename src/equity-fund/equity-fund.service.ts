import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class EquityFundService {
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

  validateEquityFundData(formData: any) {
    const errors: string[] = [];
    const requiredFields = [
      "fullName",
      "clientId",
      "email",
      "unitsToRedeemFigures",
      "unitsToRedeemWords",
      "bank",
      "branch",
      "sortCode",
      "accountNumber",
      "accountName",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        errors.push(`${field} is required`);
      }
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push("Invalid email format");
    }

    return { valid: errors.length === 0, errors };
  }

  async sendEquityFundRedemption(
    formData: any,
    pdfContent: string,
    adminEmail: string,
    currentDate: number
  ) {
    const referenceId = `PACAM-EQUITY-${currentDate}`;
    const htmlTemplate = this.createEmailTemplate(formData, referenceId);

    const mail_configs = {
      from: this.configService.get("EMAIL"),
      to: adminEmail,
      subject: "PACAM Equity Fund Redemption Request",
      html: htmlTemplate,
      attachments: [
        {
          filename: `PACAM_Equity_Redemption_${formData.fullName}_${currentDate}.pdf`,
          content: pdfContent,
          encoding: "base64",
        },
      ],
    };

    return new Promise((resolve, reject) => {
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
    formData: any,
    pdfContent: string,
    currentDate: number
  ) {
    const referenceId = `PACAM-EQUITY-${currentDate}`;
    const htmlTemplate = this.createClientConfirmationTemplate(
      formData,
      referenceId
    );

    const mail_configs = {
      from: this.configService.get("EMAIL"),
      to: formData.userEmail,
      subject: "PACAM Equity Fund Redemption - Confirmation",
      html: htmlTemplate,
      attachments: [
        {
          filename: `PACAM_Equity_Redemption_${formData.fullName}_${currentDate}.pdf`,
          content: pdfContent,
          encoding: "base64",
        },
      ],
    };

    return new Promise((resolve, reject) => {
      this.transporter.sendMail(mail_configs, function (error, info) {
        if (error) return reject({ message: "Confirmation email error" });
        return resolve({ message: "Confirmation email sent successfully" });
      });
    });
  }

  private createEmailTemplate(formData: any, referenceId: string): string {
    const brandColor = "#059669"; // Green for equity fund
    const brandName = "PACAM";
    const submissionDate = new Date().toLocaleString();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PACAM Equity Fund Redemption Request</title>
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
            background-color: #ecfdf5;
            border: 1px solid ${brandColor};
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .important-notes h3 {
            color: #065f46;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .important-notes ul {
            margin: 0;
            padding-left: 20px;
        }
        .important-notes li {
            margin-bottom: 8px;
            color: #047857;
        }
        .submission-info {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 25px 0;
        }
        .submission-info strong {
            color: #92400e;
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
            <h2 class="title">Equity Fund Redemption</h2>
            <p class="subtitle">New Redemption Request Received</p>
        </div>

        <div class="content">
            <div class="greeting">
                Dear Fund Management Team,
            </div>

            <p>A new equity fund redemption request has been submitted through the ${brandName} online portal. Please find the details below and process according to standard procedures.</p>

            <!-- Personal Information Section -->
            <div class="section">
                <h3 class="section-title">Client Information</h3>
                <div class="info-grid">
                    <div class="info-label">Full Name:</div>
                    <div class="info-value">${formData.fullName}</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Client ID:</div>
                    <div class="info-value">${formData.clientId}</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Email Address:</div>
                    <div class="info-value">${formData.email}</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Telephone:</div>
                    <div class="info-value">${
                      formData.telephoneNumber || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Request Date:</div>
                    <div class="info-value">${
                      formData.date || new Date().toLocaleDateString()
                    }</div>
                </div>
            </div>

            <!-- Redemption Details Section -->
            <div class="section">
                <h3 class="section-title">Redemption Details</h3>
                <div class="info-grid">
                    <div class="info-label">Units to Redeem (Figures):</div>
                    <div class="info-value">${
                      formData.unitsToRedeemFigures
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Units to Redeem (Words):</div>
                    <div class="info-value">${formData.unitsToRedeemWords}</div>
                </div>
            </div>

            <!-- Payment Details Section -->
            <div class="section">
                <h3 class="section-title">Payment Instructions</h3>
                <div class="info-grid">
                    <div class="info-label">Bank Name:</div>
                    <div class="info-value">${formData.bank}</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Branch:</div>
                    <div class="info-value">${formData.branch}</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Sort Code:</div>
                    <div class="info-value">${formData.sortCode}</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Account Number:</div>
                    <div class="info-value">${formData.accountNumber}</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Account Name:</div>
                    <div class="info-value">${formData.accountName}</div>
                </div>
            </div>

            <!-- Certificate Details Section -->
            ${
              formData.certificateNumbers ||
              formData.totalUnits ||
              formData.balance
                ? `
            <div class="section">
                <h3 class="section-title">Unit Certificate Details</h3>
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
                <strong>📎 Redemption Form Attached</strong><br>
                The complete equity fund redemption form with signatures is attached to this email as a PDF document.
            </div>

            <!-- Important Notes -->
            <div class="important-notes">
                <h3>⚠️ Important Processing Notes - PACAM Equity Fund</h3>
                <ul>
                    <li><strong>Early Redemption Charge:</strong> For redemptions within 90 days of purchase, 10% of the positive total returns will be charged</li>
                    <li>Payment must be made only in the name of the unit holder(s) as registered</li>
                    <li>Verify unit certificates and signatures against client records</li>
                    <li>Apply the bid price prevailing on the date of redemption processing</li>
                    <li>For partial redemption, send balance fund statement to client's registered email</li>
                    <li>Equity Fund characteristics: Long-term capital growth through equity investments</li>
                    <li>Ensure all calculations are verified before processing payment</li>
                    <li>Maintain audit trail for all redemption transactions</li>
                </ul>
            </div>

            <!-- Submission Information -->
            <div class="submission-info">
                <strong>🎯 Action Required</strong><br>
                <strong>Submitted on:</strong> ${submissionDate}<br>
                <strong>Reference ID:</strong> ${referenceId}<br>
                <strong>Fund Type:</strong> PACAM Equity Fund<br>
                <strong>Processing Priority:</strong> Standard (3-5 business days)
            </div>

            <p>Please process this equity fund redemption request according to standard procedures and notify the client upon completion. If any clarification is needed, contact the client using the provided information.</p>
        </div>

        <div class="footer">
            <div class="footer-content">
                <div class="contact-info">
                    <strong>${brandName} Fund Management</strong><br>
                    Email: info@pacassetmanagement.com | Phone: +234-XXX-XXXX<br>
                    Website: www.pacassetmanagement.com
                </div>
            </div>
            
            <div class="copyright">
                © ${new Date().getFullYear()} ${brandName}. All rights reserved.<br>
                This email was generated automatically from the ${brandName} equity fund portal.<br>
                For technical support, please contact our IT department.
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  private createClientConfirmationTemplate(
    formData: any,
    referenceId: string
  ): string {
    const brandColor = "#059669";
    const currentDate = new Date().toLocaleString();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Equity Fund Redemption Confirmation</title>
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
        .details-section {
            background-color: #f8fafc;
            border-left: 4px solid ${brandColor};
            padding: 20px;
            margin: 20px 0;
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
        }
        .next-steps {
            background-color: #f0f9ff;
            border-left: 4px solid ${brandColor};
            padding: 20px;
            margin: 20px 0;
        }
        .important-notice {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
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
            <h2>Equity Fund Redemption Confirmation</h2>
        </div>

        <div class="content">
            <p>Dear ${formData.fullName},</p>

            <div class="confirmation-badge">
                <h3 style="color: #065f46; margin: 0;">✅ Redemption Request Received</h3>
                <p style="margin: 10px 0 0 0; color: #047857;">Reference: <strong>${referenceId}</strong></p>
            </div>

            <p>Thank you for submitting your PACAM Equity Fund redemption request. We have received your application and it is now being processed by our fund management team.</p>

            <div class="details-section">
                <h4 style="color: ${brandColor}; margin-top: 0;">Redemption Summary:</h4>
                <div class="info-grid">
                    <div class="info-label">Units to Redeem:</div>
                    <div class="info-value">${formData.unitsToRedeemFigures} (${formData.unitsToRedeemWords})</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Payment Account:</div>
                    <div class="info-value">${formData.accountName}</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Bank:</div>
                    <div class="info-value">${formData.bank}</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Account Number:</div>
                    <div class="info-value">${formData.accountNumber}</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Client ID:</div>
                    <div class="info-value">${formData.clientId}</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Fund Type:</div>
                    <div class="info-value">PACAM Equity Fund</div>
                </div>
            </div>

            <div class="next-steps">
                <h4 style="color: ${brandColor}; margin-top: 0;">What Happens Next:</h4>
                <ul>
                    <li>Your redemption request will be processed within 3-5 business days</li>
                    <li>We will verify your unit certificates and calculate the redemption value</li>
                    <li>Payment will be made at the bid price prevailing on the processing date</li>
                    <li>Funds will be transferred to your designated bank account</li>
                    <li>You will receive a redemption confirmation and updated fund statement</li>
                    <li>For partial redemptions, your remaining balance will be clearly stated</li>
                </ul>
            </div>

            <div class="important-notice">
                <h4 style="color: #92400e; margin-top: 0;">⚠️ Important Information:</h4>
                <ul style="color: #92400e; margin: 0;">
                    <li><strong>Early Redemption:</strong> If your units were purchased within the last 90 days, a 10% charge will be applied to any positive returns</li>
                    <li><strong>Payment:</strong> All redemption payments are made only to registered unit holders</li>
                    <li><strong>Processing Time:</strong> Standard processing is 3-5 business days from submission</li>
                    <li><strong>Equity Fund:</strong> This fund focuses on long-term capital growth through equity investments</li>
                </ul>
            </div>

            <p><strong>Reference Number:</strong> Please keep your reference number (${referenceId}) for all future correspondence regarding this redemption request.</p>

            <p>If you have any questions about your redemption request or need to provide additional information, please contact our customer service team immediately.</p>

            <p>Thank you for choosing PACAM for your investment needs.</p>
        </div>

        <div class="footer">
            <div>
                <strong>PACAM Customer Service</strong><br>
                Email: info@pacassetmanagement.com | Phone: +234-XXX-XXXX<br>
                Website: www.pacassetmanagement.com
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }
}
