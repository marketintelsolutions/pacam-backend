// src/types/mutual-fund.types.ts

export interface ApplicantDetails {
  surname: string;
  name: string;
  otherName?: string;
  residentialAddress?: string;
  nationality?: string;
  dateOfBirth?: string;
  occupation?: string;
  gender?: "male" | "female" | "";
  stateOfOrigin?: string;
  townCity?: string;
  mobileNumber?: string;
  emailAddress: string;
  taxId?: string;
  idType?: string;
  idNumber?: string;
  idIssuedDate?: string;
  idExpiryDate?: string;
  bvn?: string;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  signature?: string;
  signatureDate: string;
}

export interface MinorInvestmentDetails {
  isForMinor: boolean;
  surname?: string;
  name?: string;
  otherName?: string;
  residentialAddress?: string;
  nationality?: string;
  stateOfOrigin?: string;
  relationship?: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  relationshipToApplicant?: string;
  emailAddress?: string;
}

export interface NextOfKinDetails {
  surname?: string;
  name?: string;
  otherName?: string;
  residentialAddress?: string;
  nationality?: string;
  stateOfOrigin?: string;
  relationship?: string;
  mobileNumber?: string;
  emailAddress?: string;
}

export interface MutualFundFormData {
  // Investment Information
  fundType: string;
  dividendMandate?: "reinvest" | "payout" | "";
  investmentValue: string;
  investorType: string;

  // Account Type
  isJointAccount: boolean;

  // Applicants
  primaryApplicant: ApplicantDetails;
  jointApplicant?: ApplicantDetails;

  // Minor Investment (optional)
  minorInvestment?: MinorInvestmentDetails;

  // Next of Kin
  nextOfKin?: NextOfKinDetails;

  // PEP Information
  isPep: "yes" | "no" | "";
  pepDetails?: string;
  isFinanciallyExposed: "yes" | "no" | "";
  financiallyExposedDetails?: string;

  // Investor Domicile
  investorDomicile?: string;

  // Attestations
  agreedToTerms: boolean;
  agreedToRisks: boolean;

  // Document uploads
  uploadedDocuments?: Record<string, any>;
  attachments?: any[];
}

export interface SubmitMutualFundRequest {
  formData: MutualFundFormData;
  pdfContent: string;
  adminEmail: string;
  attachments?: {
    filename: string;
    content: string;
    type: string;
    size: number;
    documentType?: string;
  }[];
}

export interface MutualFundSubmissionResponse {
  success: boolean;
  message: string;
  referenceId?: string;
  errors?: string[];
}

export interface MutualFundValidationResponse {
  valid: boolean;
  errors: string[];
}

export interface MutualFundStatusResponse {
  status: string;
  referenceId: string;
  submissionDate: string;
  primaryApplicant: {
    name: string;
    email: string;
  };
  isJointAccount: boolean;
  fundType: string;
}

// Fund type options
export const FUND_TYPES = {
  PACAM_MONEY_MARKET: "pacam_money_market",
  PACAM_FIXED_INCOME: "pacam_fixed_income",
  PACAM_BALANCED: "pacam_balanced",
  PACAM_EQUITY: "pacam_equity",
  PACAM_EUROBOND: "pacam_eurobond",
} as const;

// Investor type options
export const INVESTOR_TYPES = {
  RETAIL_DOMESTIC: "retail_domestic",
  RETAIL_FOREIGN: "retail_foreign",
  INSTITUTIONAL_DOMESTIC: "institutional_domestic",
  INSTITUTIONAL_FOREIGN: "institutional_foreign",
} as const;

// Dividend mandate options
export const DIVIDEND_MANDATES = {
  REINVEST: "reinvest",
  PAYOUT: "payout",
} as const;

// Gender options
export const GENDER_OPTIONS = {
  MALE: "male",
  FEMALE: "female",
} as const;

// ID types
export const ID_TYPES = {
  NATIONAL_ID: "national_id",
  DRIVERS_LICENSE: "drivers_license",
  INTERNATIONAL_PASSPORT: "international_passport",
  VOTERS_CARD: "voters_card",
} as const;

// Domicile zones
export const DOMICILE_ZONES = {
  NORTH_CENTRAL: "north_central",
  NORTH_EAST: "north_east",
  NORTH_WEST: "north_west",
  SOUTH_EAST: "south_east",
  SOUTH_SOUTH: "south_south",
  SOUTH_WEST: "south_west",
  DIASPORA: "diaspora",
} as const;
