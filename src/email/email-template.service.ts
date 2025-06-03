// email/email-template.service.ts
import { Injectable } from "@nestjs/common";
import {
  EmailTemplateData,
  EmailSection,
  FormDataSection,
  RedemptionFormData,
  EmailAttachment,
  ContactInfo,
} from "./types/email.types";

@Injectable()
export class EmailTemplateService {
  private readonly defaultContactInfo: ContactInfo = {
    email: "info@pacam.com",
    phone: "+234-XXX-XXXX",
    website: "www.pacam.com",
  };

  private readonly brandColor = "#1e40af";

  createTemplate(data: EmailTemplateData): string {
    const currentDate = new Date().toLocaleString();
    const referenceId = `${
      data.brandName?.toUpperCase() || "PACAM"
    }-${Date.now()}`;
    const contactInfo = data.contactInfo || this.defaultContactInfo;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
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
            background: linear-gradient(135deg, ${this.brandColor} 0%, ${
      this.brandColor
    }dd 100%);
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
            color: ${this.brandColor};
        }
        .section {
            margin-bottom: 30px;
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            border-left: 4px solid ${this.brandColor}66;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: ${this.brandColor};
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
        }
        .attachment-section {
            background-color: #ecfdf5;
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .attachment-section h4 {
            color: #047857;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .attachment-list {
            list-style: none;
            padding: 0;
            margin: 10px 0;
        }
        .attachment-list li {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 8px 0;
            color: #047857;
        }
        .attachment-list li::before {
            content: "📎";
            margin-right: 5px;
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
            padding: 15px;
            text-align: center;
            margin: 25px 0;
        }
        .summary-box {
            background-color: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .summary-box h4 {
            color: #0369a1;
            margin-top: 0;
            margin-bottom: 15px;
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
        .status-badge {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin: 0 5px;
        }
        .priority-banner {
            background-color: #dc2626;
            color: white;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            margin-bottom: 0;
        }
        .timeline-item {
            display: flex;
            align-items: flex-start;
            margin: 10px 0;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .timeline-item:last-child {
            border-bottom: none;
        }
        .timeline-number {
            background-color: #0369a1;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            margin-right: 15px;
            flex-shrink: 0;
        }
        .timeline-content {
            flex: 1;
        }
        .timeline-title {
            font-weight: 600;
            color: #0369a1;
            margin-bottom: 4px;
        }
        .timeline-description {
            color: #6b7280;
            font-size: 14px;
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
            .timeline-item {
                flex-direction: column;
                text-align: center;
            }
            .timeline-number {
                margin-right: 0;
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        ${
          !data.isUserCopy
            ? '<div class="priority-banner">⚡ PRIORITY: New Redemption Request Requires Processing</div>'
            : ""
        }
        
        <div class="header">
            <div class="logo">
                <h1>${data.brandName || "PACAM"}</h1>
            </div>
            <h2 class="title">${data.title}</h2>
            <p class="subtitle">${data.subtitle}</p>
        </div>

        <div class="content">
            ${
              data.greeting
                ? `<div class="greeting">${data.greeting}</div>`
                : ""
            }

            ${data.sections
              .map(
                (section) => `
                <div class="section">
                    <h3 class="section-title">${section.title}</h3>
                    ${section.content}
                </div>
            `
              )
              .join("")}

            ${
              data.importantNotes
                ? `
                <div class="important-notes">
                    <h3>Important Notes</h3>
                    ${data.importantNotes}
                </div>
            `
                : ""
            }

            <div class="submission-info">
                <strong>Submission Details:</strong><br>
                Submitted on: ${currentDate}<br>
                Reference: ${referenceId}
            </div>
        </div>

        <div class="footer">
            <div class="footer-content">
                <div class="contact-info">
                    <strong>${data.brandName || "PACAM"}</strong><br>
                    Customer Service: ${contactInfo.email} | ${
      contactInfo.phone
    }<br>
                    Website: ${contactInfo.website}
                </div>
            </div>
            
            <div class="copyright">
                © ${new Date().getFullYear()} ${
      data.brandName || "PACAM"
    }. All rights reserved.<br>
                This email was generated automatically from the ${
                  data.brandName || "PACAM"
                } online portal.<br>
                Please do not reply to this email. For assistance, contact our customer service team.
            </div>
        </div>
    </div>
</body>
</html>
        `;
  }

  createFormDataSection(title: string, data: FormDataSection): EmailSection {
    const content = Object.entries(data)
      .filter(
        ([_, value]) => value !== "" && value !== null && value !== undefined
      )
      .map(
        ([label, value]) => `
          <div class="info-grid">
              <div class="info-label">${label}:</div>
              <div class="info-value">${value}</div>
          </div>
      `
      )
      .join("");

    return { title, content };
  }

  createAttachmentSection(attachments: EmailAttachment[]): EmailSection {
    const attachmentList = attachments
      .map(
        (att) => `
        <li>${att.filename} <span class="status-badge">✓ Attached</span></li>
    `
      )
      .join("");

    return {
      title: "Document Attachments",
      content: `
          <div class="attachment-section">
              <h4>📎 Files Attached to This Email:</h4>
              <ul class="attachment-list">
                  ${attachmentList}
              </ul>
              <p><em>All documents are securely attached and ready for processing.</em></p>
          </div>
      `,
    };
  }

  createSummarySection(formData: RedemptionFormData): EmailSection {
    return {
      title: "Request Summary",
      content: `
          <div class="summary-box">
              <h4>📋 Your Redemption Request Details:</h4>
              <div class="info-grid">
                  <div class="info-label">Client ID:</div>
                  <div class="info-value">${formData.clientId}</div>
              </div>
              <div class="info-grid">
                  <div class="info-label">Units to Redeem:</div>
                  <div class="info-value">${formData.unitsToRedeemFigures} (${
        formData.unitsToRedeemWords
      })</div>
              </div>
              <div class="info-grid">
                  <div class="info-label">Payment Account:</div>
                  <div class="info-value">${formData.accountName} - ${
        formData.bank
      }</div>
              </div>
              <div class="info-grid">
                  <div class="info-label">Account Number:</div>
                  <div class="info-value">${formData.accountNumber}</div>
              </div>
              <div class="info-grid">
                  <div class="info-label">Request Date:</div>
                  <div class="info-value">${
                    formData.date || new Date().toLocaleDateString()
                  }</div>
              </div>
          </div>
      `,
    };
  }

  createProcessingSection(): EmailSection {
    return {
      title: "Processing Instructions",
      content: `
          <div class="summary-box">
              <h4>📋 Processing Checklist:</h4>
              <div class="timeline-item">
                  <div class="timeline-number">1</div>
                  <div class="timeline-content">
                      <div class="timeline-title">Document Verification</div>
                      <div class="timeline-description">Review attached PDF form and verify all required fields are completed</div>
                  </div>
              </div>
              <div class="timeline-item">
                  <div class="timeline-number">2</div>
                  <div class="timeline-content">
                      <div class="timeline-title">Signature Authentication</div>
                      <div class="timeline-description">Compare attached signatures against records on file</div>
                  </div>
              </div>
              <div class="timeline-item">
                  <div class="timeline-number">3</div>
                  <div class="timeline-content">
                      <div class="timeline-title">Unit Certificate Validation</div>
                      <div class="timeline-description">Confirm unit holdings and certificate details</div>
                  </div>
              </div>
              <div class="timeline-item">
                  <div class="timeline-number">4</div>
                  <div class="timeline-content">
                      <div class="timeline-title">Redemption Calculation</div>
                      <div class="timeline-description">Calculate redemption amount at current bid price (minus 10% charge)</div>
                  </div>
              </div>
              <div class="timeline-item">
                  <div class="timeline-number">5</div>
                  <div class="timeline-content">
                      <div class="timeline-title">Payment Processing</div>
                      <div class="timeline-description">Process payment to specified bank account and send confirmation</div>
                  </div>
              </div>
              <p style="margin-top: 15px;"><em><strong>Priority:</strong> Please process within 2 business days and notify client of completion.</em></p>
          </div>
      `,
    };
  }

  createUserTimelineSection(): EmailSection {
    return {
      title: "What Happens Next",
      content: `
          <div class="summary-box">
              <h4>🔄 Processing Timeline:</h4>
              <div class="timeline-item">
                  <div class="timeline-number">1</div>
                  <div class="timeline-content">
                      <div class="timeline-title">Form Verification</div>
                      <div class="timeline-description">1-2 business days - Review and validation of your submission</div>
                  </div>
              </div>
              <div class="timeline-item">
                  <div class="timeline-number">2</div>
                  <div class="timeline-content">
                      <div class="timeline-title">Certificate Validation</div>
                      <div class="timeline-description">Unit holdings and certificate verification</div>
                  </div>
              </div>
              <div class="timeline-item">
                  <div class="timeline-number">3</div>
                  <div class="timeline-content">
                      <div class="timeline-title">Redemption Processing</div>
                      <div class="timeline-description">Calculation and approval at current bid price</div>
                  </div>
              </div>
              <div class="timeline-item">
                  <div class="timeline-number">4</div>
                  <div class="timeline-content">
                      <div class="timeline-title">Payment</div>
                      <div class="timeline-description">5-7 business days - Funds transferred to your account</div>
                  </div>
              </div>
              <div class="timeline-item">
                  <div class="timeline-number">5</div>
                  <div class="timeline-content">
                      <div class="timeline-title">Confirmation</div>
                      <div class="timeline-description">Email confirmation sent upon completion</div>
                  </div>
              </div>
              <p style="margin-top: 15px;"><em>You will receive updates at each major step of the process.</em></p>
          </div>
      `,
    };
  }

  createUrgentProcessingNote(amount: string): EmailSection | null {
    const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));

    if (numericAmount > 1000000) {
      return {
        title: "High-Value Transaction Notice",
        content: `
            <div style="background-color: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h4 style="color: #dc2626; margin-top: 0;">⚠️ High-Value Redemption Alert</h4>
                <p style="color: #7f1d1d; margin-bottom: 0;">
                    <strong>This redemption request exceeds 1,000,000 units and requires senior management approval.</strong><br>
                    Please escalate to the Investment Committee and follow enhanced verification procedures.
                </p>
            </div>
        `,
      };
    }
    return null;
  }
}
