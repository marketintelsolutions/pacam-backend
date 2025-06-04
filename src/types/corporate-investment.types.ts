// src/types/corporate-investment.types.ts
export interface CorporateInvestmentSignatory {
  surname: string;
  name: string;
  otherName?: string;
  residentialAddress?: string;
  nationality?: string;
  stateOfOrigin?: string;
  dateOfBirth?: string;
  gender?: string;
  employmentDetails?: string;
  townCity?: string;
  bvn?: string;
  emailAddress?: string;
  mobileNumber?: string;
  taxId?: string;
  signatureDate?: string;
  idType?: string;
  idNumber?: string;
  idIssuedDate?: string;
  idExpiryDate?: string;
}

export interface CorporateInvestmentFormData {
  // Investment Information
  investmentType: string;
  investmentValue: string;
  tenor?: string;
  otherTenor?: string;
  investorType: string;

  // Company Information
  date?: string;
  cacNumber: string;
  typeOfBusiness?: string;
  companyName: string;
  registeredAddress?: string;
  country?: string;
  stateOfOrigin?: string;
  townCity?: string;
  emailAddress: string;
  phoneNumber?: string;
  taxId?: string;
  companySignatureDate?: string;

  // Signatories
  signatories: CorporateInvestmentSignatory[];

  // PEP Information
  isPep: string;
  pepDetails?: string;
  isFinanciallyExposed: string;
  financiallyExposedDetails?: string;

  // Bank Details
  accountName?: string;
  accountNumber?: string;
  bankName?: string;

  // Investor Domicile
  investorDomicile?: string;

  // Attestations
  agreedToTerms: boolean;
  agreedToRisks: boolean;

  // Copy email
  userEmail?: string;
}

export interface FileAttachment {
  filename: string;
  content: string; // base64 encoded
  type: string;
  size: number;
}

export interface SubmitCorporateInvestmentRequest {
  formData: CorporateInvestmentFormData;
  pdfContent: string;
  adminEmail: string;
  attachments?: FileAttachment[];
}
