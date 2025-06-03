// src/types/email-indemnity.types.ts
export interface EmailIndemnityFormData {
  preferredEmail: string;
  preferredPhone?: string;
  accountHolderName?: string; // Only for individual
  companyName?: string; // Only for corporate
  signatureDate?: string;
  agreedToTerms: boolean;
  signature?: string | null; // For individual
  primarySignature?: string | null; // For corporate (first signatory)
  secondarySignature?: string | null; // For corporate (second signatory)
  variant: "individual" | "corporate";
}

export interface SubmitEmailIndemnityRequest {
  formData: EmailIndemnityFormData;
  pdfContent: string;
  adminEmail: string;
}
