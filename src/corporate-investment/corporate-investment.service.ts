// src/corporate-investment/corporate-investment.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { CorporateInvestmentFormData } from "../types/corporate-investment.types";

@Injectable()
export class CorporateInvestmentService {
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

  validateCorporateInvestmentData(formData: CorporateInvestmentFormData) {
    const errors: string[] = [];

    // Required fields
    const requiredFields = [
      "investmentType",
      "investmentValue",
      "investorType",
      "companyName",
      "emailAddress",
      "cacNumber",
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.emailAddress && !emailRegex.test(formData.emailAddress)) {
      errors.push("Invalid email format");
    }

    if (formData.userEmail && !emailRegex.test(formData.userEmail)) {
      errors.push("Invalid user email format");
    }

    // Signatory validation
    if (!formData.signatories || formData.signatories.length === 0) {
      errors.push("At least one signatory is required");
    } else {
      formData.signatories.forEach((signatory, index) => {
        if (!signatory.surname || !signatory.name) {
          errors.push(`Signatory ${index + 1}: surname and name are required`);
        }
      });
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

  async sendCorporateInvestmentForm(
    formData: CorporateInvestmentFormData,
    adminEmail: string,
    currentDate: number,
    attachments: any[]
  ) {
    return new Promise((resolve, reject) => {
      const referenceId = `PACAM-CORP-INV-${currentDate}`;

      const htmlTemplate = this.createCorporateInvestmentTemplate(
        formData,
        new Date(currentDate).toLocaleString(),
        referenceId
      );

      const mail_configs = {
        from: this.configService.get("EMAIL"),
        to: adminEmail,
        subject: "PACAM Corporate Investment Application Submission",
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
    formData: CorporateInvestmentFormData,
    currentDate: number,
    attachments: any[]
  ) {
    const referenceId = `PACAM-CORP-INV-${currentDate}`;

    const htmlTemplate = this.createClientConfirmationTemplate(
      formData,
      referenceId
    );

    const mail_configs = {
      from: this.configService.get("EMAIL"),
      to: formData.emailAddress,
      subject: "PACAM Corporate Investment Application - Confirmation",
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

  private createCorporateInvestmentTemplate(
    formData: CorporateInvestmentFormData,
    submissionDate: string,
    referenceId: string
  ): string {
    const brandColor = "#1e40af";
    const brandName = "PACAM";

    const investmentOptions = {
      pacam_high_yield: "PACAM High Yield Note",
      pacam_fixed_income: "PACAM Fixed Income Note",
      treasury_bill: "Treasury Bill",
      others: "Others",
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
    <title>PACAM Corporate Investment Application</title>
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
            <h2 class="title">Corporate Investment Application</h2>
            <p class="subtitle">New Application Submission Received</p>
        </div>

        <div class="content">
            <div class="greeting">
                Dear Investment Team,
            </div>

            <p>A new corporate investment application has been submitted through the ${brandName} online portal. Please find the details below and the complete application with attachments.</p>

            <!-- Investment Information Section -->
            <div class="section">
                <h3 class="section-title">Investment Information</h3>
                <div class="info-grid">
                    <div class="info-label">Investment Type:</div>
                    <div class="info-value">${
                      investmentOptions[formData.investmentType] ||
                      formData.investmentType
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Investment Value:</div>
                    <div class="info-value">${formData.investmentValue}</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Tenor:</div>
                    <div class="info-value">${
                      formData.tenor
                        ? `${formData.tenor} Days`
                        : formData.otherTenor || "Not specified"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Investor Type:</div>
                    <div class="info-value">${
                      investorTypes[formData.investorType] ||
                      formData.investorType
                    }</div>
                </div>
            </div>

            <!-- Company Information Section -->
            <div class="section">
                <h3 class="section-title">Company Information</h3>
                <div class="info-grid">
                    <div class="info-label">Company Name:</div>
                    <div class="info-value">${formData.companyName}</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">CAC/RC Number:</div>
                    <div class="info-value">${formData.cacNumber}</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Type of Business:</div>
                    <div class="info-value">${
                      formData.typeOfBusiness || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Email Address:</div>
                    <div class="info-value">${formData.emailAddress}</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Phone Number:</div>
                    <div class="info-value">${
                      formData.phoneNumber || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Registered Address:</div>
                    <div class="info-value">${
                      formData.registeredAddress || "Not provided"
                    }</div>
                </div>
            </div>

            <!-- Signatories Section -->
            <div class="section">
                <h3 class="section-title">Account Signatories (${
                  formData.signatories.length
                })</h3>
                ${formData.signatories
                  .map(
                    (sig, index) => `
                    <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <h4 style="color: #1e40af; margin-bottom: 10px;">Signatory ${
                          index + 1
                        }</h4>
                        <div class="info-grid">
                            <div class="info-label">Full Name:</div>
                            <div class="info-value">${sig.surname} ${
                      sig.name
                    } ${sig.otherName || ""}</div>
                        </div>
                        <div class="info-grid">
                            <div class="info-label">Email:</div>
                            <div class="info-value">${
                              sig.emailAddress || "Not provided"
                            }</div>
                        </div>
                        <div class="info-grid">
                            <div class="info-label">Mobile:</div>
                            <div class="info-value">${
                              sig.mobileNumber || "Not provided"
                            }</div>
                        </div>
                        <div class="info-grid">
                            <div class="info-label">Employment:</div>
                            <div class="info-value">${
                              sig.employmentDetails || "Not provided"
                            }</div>
                        </div>
                        <div class="info-grid">
                            <div class="info-label">BVN:</div>
                            <div class="info-value">${
                              sig.bvn || "Not provided"
                            }</div>
                        </div>
                    </div>
                `
                  )
                  .join("")}
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
                ${
                  formData.pepDetails
                    ? `
                <div class="info-grid">
                    <div class="info-label">PEP Details:</div>
                    <div class="info-value">${formData.pepDetails}</div>
                </div>
                `
                    : ""
                }
                <div class="info-grid">
                    <div class="info-label">Financially Exposed:</div>
                    <div class="info-value">${
                      formData.isFinanciallyExposed === "yes" ? "Yes" : "No"
                    }</div>
                </div>
                ${
                  formData.financiallyExposedDetails
                    ? `
                <div class="info-grid">
                    <div class="info-label">Financial Exposure Details:</div>
                    <div class="info-value">${formData.financiallyExposedDetails}</div>
                </div>
                `
                    : ""
                }
            </div>

            ${
              formData.accountName ||
              formData.accountNumber ||
              formData.bankName
                ? `
            <!-- Banking Information Section -->
            <div class="section">
                <h3 class="section-title">Banking Information</h3>
                <div class="info-grid">
                    <div class="info-label">Account Name:</div>
                    <div class="info-value">${
                      formData.accountName || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Account Number:</div>
                    <div class="info-value">${
                      formData.accountNumber || "Not provided"
                    }</div>
                </div>
                <div class="info-grid">
                    <div class="info-label">Bank Name:</div>
                    <div class="info-value">${
                      formData.bankName || "Not provided"
                    }</div>
                </div>
            </div>
            `
                : ""
            }

            <!-- Attachment Notice -->
            <div class="attachment-notice">
                <strong>📎 Application Documents</strong><br>
                The complete investment application form and supporting documents are attached to this email.
            </div>

            <!-- Important Notes -->
            <div class="important-notes">
                <h3>⚠️ Important Processing Notes</h3>
                <ul>
                    <li>Please verify all documentation as per the checklist: Passport photograph, Recent utility bill, Valid ID, CAC Forms (C07, C02), Board Resolution</li>
                    <li>25% pre-liquidation charge applies if investments are liquidated before maturity</li>
                    <li>All signatories must be verified and their details cross-checked with provided documentation</li>
                    <li>Conduct enhanced due diligence if any signatory is marked as PEP or financially exposed</li>
                    <li>Ensure all required attestations have been acknowledged by the client</li>
                    <li>Process according to standard KYC and AML procedures</li>
                </ul>
            </div>

            <!-- Submission Information -->
            <div class="submission-info">
                <strong>✅ Application Received</strong><br>
                <strong>Submitted on:</strong> ${submissionDate}<br>
                <strong>Reference ID:</strong> ${referenceId}<br>
                <strong>Company Email:</strong> ${formData.emailAddress}
            </div>

            <p>Please process this corporate investment application according to standard procedures. If you need any clarification or additional documentation, please contact the company directly using the provided contact information.</p>
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
                This email was generated automatically from the ${brandName} corporate investment portal.<br>
                For technical support, please contact our IT department.
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  private createClientConfirmationTemplate(
    formData: CorporateInvestmentFormData,
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
    <title>Investment Application Confirmation</title>
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
            <h2>Investment Application Received</h2>
        </div>

        <div class="content">
            <p>Dear ${formData.companyName} Team,</p>

            <div class="confirmation-badge">
                <h3 style="color: #065f46; margin: 0;">✅ Application Successfully Submitted</h3>
                <p style="margin: 10px 0 0 0; color: #047857;">Reference: <strong>${referenceId}</strong></p>
            </div>

            <p>Thank you for your corporate investment application. We have received your request and it is now being processed by our investment team.</p>

            <div class="next-steps">
                <h4 style="color: ${brandColor}; margin-top: 0;">Next Steps:</h4>
                <ul>
                    <li>Your application will be reviewed within 3-5 business days</li>
                    <li>We will verify all documentation and conduct due diligence</li>
                    <li>Our team will contact you for any clarifications if needed</li>
                    <li>You will receive a separate communication once your account is activated</li>
                    <li>Investment instructions will be provided upon account activation</li>
                </ul>
            </div>

            <p><strong>Important:</strong> Please keep your reference number (${referenceId}) for your records. You may need it for any future inquiries about this application.</p>

            <p>If you have any questions or need to provide additional documentation, please contact our customer service team immediately.</p>
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
