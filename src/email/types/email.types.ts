// email/types/email.types.ts
import { Readable } from "stream";
import * as nodemailer from "nodemailer";

// Create our own attachment interface based on nodemailer documentation
export interface EmailAttachment {
  filename?: string;
  content?: string | Buffer | Readable;
  path?: string;
  href?: string;
  httpHeaders?: { [key: string]: string };
  contentType?: string;
  contentDisposition?: "attachment" | "inline";
  cid?: string;
  encoding?: string;
  headers?: { [key: string]: string };
  raw?: string;
}

// Use nodemailer's built-in types for mail options
export type MailOptions = nodemailer.SendMailOptions;
export type TransportOptions = nodemailer.TransportOptions;
export type NodemailerSendResult = nodemailer.SentMessageInfo;

// Custom interfaces for our application
export interface ContactInfo {
  email: string;
  phone: string;
  website: string;
}

export interface EmailTemplateData {
  title: string;
  subtitle: string;
  greeting?: string;
  sections: EmailSection[];
  importantNotes?: string;
  isUserCopy?: boolean;
  brandName?: string;
  contactInfo?: ContactInfo;
}

export interface EmailSection {
  title: string;
  content: string;
}

export interface FormDataSection {
  [key: string]: string | number | undefined;
}

export interface RedemptionFormData {
  date?: string;
  fullName: string;
  clientId: string;
  telephoneNumber?: string;
  email: string;
  unitsToRedeemFigures: string;
  unitsToRedeemWords: string;
  bank: string;
  branch: string;
  sortCode: string;
  accountNumber: string;
  accountName: string;
  certificateNumbers?: string;
  totalUnits?: string;
  previousRedemption?: string;
  balance?: string;
  currentRedemption?: string;
  userEmail?: string;
  primarySignature?: string; // base64
  jointSignature?: string; // base64
}

export interface SendRedemptionEmailRequest {
  formData: RedemptionFormData;
  pdfContent: string; // base64 PDF content
  fundManagerEmail: string;
}

export interface EmailSendResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: {
    fundManagerSent: boolean;
    userCopySent: boolean;
    attachments: number;
  };
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

// Helper function to create properly typed attachments
export function createAttachment(
  filename: string,
  content: string,
  contentType: string,
  encoding: "base64" | "hex" | "binary" = "base64"
): EmailAttachment {
  return {
    filename,
    content,
    contentType,
    encoding,
    contentDisposition: "attachment",
  };
}

// Helper function to create inline image attachments
export function createInlineAttachment(
  filename: string,
  content: string,
  contentType: string,
  cid: string,
  encoding: "base64" | "hex" | "binary" = "base64"
): EmailAttachment {
  return {
    filename,
    content,
    contentType,
    encoding,
    contentDisposition: "inline",
    cid,
  };
}
