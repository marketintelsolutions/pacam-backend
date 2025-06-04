// src/mutual-fund/mutual-fund.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { MutualFundFormData } from "../types/mutual-fund.types";

@Injectable()
export class MutualFundService {
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

  validateMutualFundData(formData: MutualFundFormData) {
    const errors: string[] = [];

    // Required fields
    const requiredFields = [
      "fundType",
      "investmentValue",
      "investorType",
      "isPep",
      "isFinanciallyExposed",
      "agreedToTerms",
      "agreedToRisks",
    ];

    requiredFields.forEach((field) => {
      if (
        !formData[field] ||
        (typeof formData[field] === "string" &&
          formData[field].toString().trim() === "")
      ) {
        errors.push(`${field} is required`);
      }
    });

    // Primary applicant validation
    if (!formData.primaryApplicant) {
      errors.push("Primary applicant information is required");
    } else {
      if (!formData.primaryApplicant.surname) {
        errors.push("Primary applicant surname is required");
      }
      if (!formData.primaryApplicant.name) {
        errors.push("Primary applicant name is required");
      }
      if (!formData.primaryApplicant.emailAddress) {
        errors.push("Primary applicant email is required");
      }
      if (!formData.primaryApplicant.signature) {
        errors.push("Primary applicant signature is required");
      }
      if (!formData.primaryApplicant.signatureDate) {
        errors.push("Primary applicant signature date is required");
      }
    }

    // Joint applicant validation (if joint account)
    if (formData.isJointAccount) {
      if (!formData.jointApplicant) {
        errors.push(
          "Joint applicant information is required for joint accounts"
        );
      } else {
        if (!formData.jointApplicant.surname) {
          errors.push("Joint applicant surname is required");
        }
        if (!formData.jointApplicant.name) {
          errors.push("Joint applicant name is required");
        }
        if (!formData.jointApplicant.signature) {
          errors.push("Joint applicant signature is required");
        }
        if (!formData.jointApplicant.signatureDate) {
          errors.push("Joint applicant signature date is required");
        }
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      formData.primaryApplicant?.emailAddress &&
      !emailRegex.test(formData.primaryApplicant.emailAddress)
    ) {
      errors.push("Invalid primary applicant email format");
    }

    if (
      formData.jointApplicant?.emailAddress &&
      !emailRegex.test(formData.jointApplicant.emailAddress)
    ) {
      errors.push("Invalid joint applicant email format");
    }

    // Boolean validations
    if (
      typeof formData.agreedToTerms !== "boolean" ||
      !formData.agreedToTerms
    ) {
      errors.push("Agreement to terms is required");
    }

    if (
      typeof formData.agreedToRisks !== "boolean" ||
      !formData.agreedToRisks
    ) {
      errors.push("Agreement to risks is required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async sendMutualFundForm(
    formData: MutualFundFormData,
    adminEmail: string,
    currentDate: number,
    attachments: any[]
  ) {
    return new Promise((resolve, reject) => {
      const referenceId = `PACAM-MF-${currentDate}`;

      const htmlTemplate = this.createMutualFundTemplate(
        formData,
        new Date(currentDate).toLocaleString(),
        referenceId
      );

      const mail_configs = {
        from: this.configService.get("EMAIL"),
        to: adminEmail,
        subject: "PACAM Mutual Fund Application Submission",
        html: htmlTemplate,
        attachments: attachments,
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
    formData: MutualFundFormData,
    currentDate: number,
    attachments: any[]
  ) {
    const referenceId = `PACAM-MF-${currentDate}`;

    const htmlTemplate = this.createClientConfirmationTemplate(
      formData,
      referenceId
    );

    const mail_configs = {
      from: this.configService.get("EMAIL"),
      to: formData.primaryApplicant.emailAddress,
      subject: "PACAM Mutual Fund Application - Confirmation",
      html: htmlTemplate,
      attachments: attachments,
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

  private createMutualFundTemplate(
    formData: MutualFundFormData,
    submissionDate: string,
    referenceId: string
  ): string {
    const brandColor = "#1e40af";
    const brandName = "PACAM";

    const fundOptions = {
      pacam_money_market: "PACAM Money Market Fund (N)",
      pacam_fixed_income: "PACAM Fixed Income Fund (N)",
      pacam_balanced: "PACAM Balanced Fund (N)",
      pacam_equity: "PACAM Equity Fund (N)",
      pacam_eurobond: "PACAM Eurobond Fund ($)",
    };

    const investorTypes = {
      retail_domestic: "Retail Investors (Domestic)",
      retail_foreign: "Retail Investors (Foreign)",
      institutional_domestic: "Institutional Investors (Domestic)",
      institutional_foreign: "Institutional Investors (Foreign)",
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PACAM Mutual Fund Application</title>
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
            <h2 class="title">Mutual Fund Application</h2>
            <p class="subtitle">New Application Submission Received</p>
        </div>

        <div class="content">
            <div class="greeting">
                Dear Investment Team,
            </div>

            <p>A new mutual fund application has been submitted through the ${brandName} online portal. Please find the details below and the complete application with attachments.</p>

            <!-- Investment Information Section -->
            <div class="section">
                <h3 class="section-title">Investment Information</h3>
                <div class="info-grid">
                    <div class="info-label">Fund Type:</div>
                    <div class="info-value">${
                      fundOptions[formData.fundType] || formData.fundType
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Investment Value:</div>
                    <div class="info-value">${formData.investmentValue}</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Dividend Mandate:</div>
                    <div class="info-value">${
                      formData.dividendMandate === "reinvest"
                        ? "Re-invest"
                        : "Pay Out"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Investor Type:</div>
                    <div class="info-value">${
                      investorTypes[formData.investorType] ||
                      formData.investorType
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Account Type:</div>
                    <div class="info-value">${
                      formData.isJointAccount
                        ? "Joint Account"
                        : "Individual Account"
                    }</div>
                </div>
            </div>

            <!-- Primary Applicant Section -->
            <div class="section">
                <h3 class="section-title">Primary Applicant Information</h3>
                <div class="info-grid">
                    <div class="info-label">Full Name:</div>
                    <div class="info-value">${
                      formData.primaryApplicant.surname
                    } ${formData.primaryApplicant.name} ${
      formData.primaryApplicant.otherName || ""
    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Email Address:</div>
                    <div class="info-value">${
                      formData.primaryApplicant.emailAddress
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Mobile Number:</div>
                    <div class="info-value">${
                      formData.primaryApplicant.mobileNumber || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Residential Address:</div>
                    <div class="info-value">${
                      formData.primaryApplicant.residentialAddress ||
                      "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Nationality:</div>
                    <div class="info-value">${
                      formData.primaryApplicant.nationality || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Date of Birth:</div>
                    <div class="info-value">${
                      formData.primaryApplicant.dateOfBirth || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Occupation:</div>
                    <div class="info-value">${
                      formData.primaryApplicant.occupation || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">BVN:</div>
                    <div class="info-value">${
                      formData.primaryApplicant.bvn || "Not provided"
                    }</div>
                </div>
            </div>

            ${
              formData.isJointAccount
                ? `
            <!-- Joint Applicant Section -->
            <div class="section">
                <h3 class="section-title">Joint Applicant Information</h3>
                <div class="info-grid">
                    <div class="info-label">Full Name:</div>
                    <div class="info-value">${
                      formData.jointApplicant?.surname || ""
                    } ${formData.jointApplicant?.name || ""} ${
                    formData.jointApplicant?.otherName || ""
                  }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Email Address:</div>
                    <div class="info-value">${
                      formData.jointApplicant?.emailAddress || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Mobile Number:</div>
                    <div class="info-value">${
                      formData.jointApplicant?.mobileNumber || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">BVN:</div>
                    <div class="info-value">${
                      formData.jointApplicant?.bvn || "Not provided"
                    }</div>
                </div>
            </div>
            `
                : ""
            }

            <!-- Banking Information Section -->
            <div class="section">
                <h3 class="section-title">Banking Information</h3>
                <div class="info-grid">
                    <div class="info-label">Account Name:</div>
                    <div class="info-value">${
                      formData.primaryApplicant.accountName || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Account Number:</div>
                    <div class="info-value">${
                      formData.primaryApplicant.accountNumber || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Bank Name:</div>
                    <div class="info-value">${
                      formData.primaryApplicant.bankName || "Not provided"
                    }</div>
                </div>
            </div>

            <!-- Compliance Information Section -->
            <div class="section">
                <h3 class="section-title">Compliance Information</h3>
                <div class="info-grid">
                    <div class="info-label">Politically Exposed Person:</div>
                    <div class="info-value">${
                      formData.isPep === "yes" ? "Yes" : "No"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Financially Exposed:</div>
                    <div class="info-value">${
                      formData.isFinanciallyExposed === "yes" ? "Yes" : "No"
                    }</div>
                </div>
                ${
                  formData.investorDomicile
                    ? `
                <div class="info-grid">
                    <div class="info-label">Area of Domicile:</div>
                    <div class="info-value">${formData.investorDomicile
                      .replace("_", " ")
                      .toUpperCase()}</div>
                </div>
                `
                    : ""
                }
            </div>

            <!-- Attachment Notice -->
            <div class="attachment-notice">
                <strong>📎 Application Documents</strong><br>
                The complete mutual fund application form and supporting documents are attached to this email.
            </div>

            <!-- Important Notes -->
            <div class="important-notes">
                <h3>⚠️ Important Processing Notes</h3>
                <ul>
                    <li>Please verify all documentation as per the checklist: Passport photograph, Recent utility bill, Valid ID, Board Resolution, CAC Forms</li>
                    <li>20% handling charge applies if units are redeemed within 30, 90 and 180 days of purchase</li>
                    <li>Verify BVN and other identification details for all applicants</li>
                    <li>Conduct enhanced due diligence if any applicant is marked as PEP or financially exposed</li>
                    <li>Ensure all required attestations have been acknowledged by the client(s)</li>
                    <li>Process according to standard KYC and AML procedures</li>
                </ul>
            </div>

            <!-- Submission Information -->
            <div class="submission-info">
                <strong>✅ Application Received</strong><br>
                <strong>Submitted on:</strong> ${submissionDate}<br>
                <strong>Reference ID:</strong> ${referenceId}<br>
                <strong>Primary Email:</strong> ${
                  formData.primaryApplicant.emailAddress
                }
            </div>

            <p>Please process this mutual fund application according to standard procedures. If you need any clarification or additional documentation, please contact the applicant(s) directly using the provided contact information.</p>
        </div>

        <div class="footer">
            <div class="footer-content">
                <div class="contact-info">
                    <strong>${brandName} Customer Service</strong><br>
                    Email: info@pacassetmanagement.com | Phone: +234-XXX-XXXX<br>
                    Website: www.pacassetmanagement.com
                </div>
            </div>
            
            <div class="copyright">
                © ${new Date().getFullYear()} ${brandName}. All rights reserved.<br>
                This email was generated automatically from the ${brandName} mutual fund portal.<br>
                For technical support, please contact our IT department.
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  private createClientConfirmationTemplate(
    formData: MutualFundFormData,
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
    <title>Mutual Fund Application Confirmation</title>
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
            <h2>Mutual Fund Application Received</h2>
        </div>

        <div class="content">
            <p>Dear ${formData.primaryApplicant.surname} ${
      formData.primaryApplicant.name
    },</p>

            <div class="confirmation-badge">
                <h3 style="color: #065f46; margin: 0;">✅ Application Successfully Submitted</h3>
                <p style="margin: 10px 0 0 0; color: #047857;">Reference: <strong>${referenceId}</strong></p>
            </div>

            <p>Thank you for your mutual fund application. We have received your request and it is now being processed by our investment team.</p>

            <div class="next-steps">
                <h4 style="color: ${brandColor}; margin-top: 0;">Next Steps:</h4>
                <ul>
                    <li>Your application will be reviewed within 3-5 business days</li>
                    <li>We will verify all documentation and conduct due diligence</li>
                    <li>Our team will contact you for any clarifications if needed</li>
                    <li>You will receive a separate communication once your account is activated</li>
                    <li>Fund subscription instructions will be provided upon account activation</li>
                    <li>Unit certificates will be issued after successful fund subscription</li>
                </ul>
            </div>

            <p><strong>Important:</strong> Please keep your reference number (${referenceId}) for your records. You may need it for any future inquiries about this application.</p>

            <p>If you have any questions or need to provide additional documentation, please contact our customer service team immediately.</p>

            ${
              formData.isJointAccount
                ? `
            <p><strong>Note:</strong> As this is a joint account application, both applicants will need to be present for any account-related activities and both signatures will be required for transactions.</p>
            `
                : ""
            }
        </div>

        <div class="footer">
            <div>
                <strong>PACAM Customer Service</strong><br>
                Email: info@pacassetmanagement.com | Phone: +234-XXX-XXXX
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }
}
