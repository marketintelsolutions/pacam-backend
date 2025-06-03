// src/types/redemption.types.ts
export interface RedemptionFormData {
  date: string;
  fullName: string;
  clientId: string;
  telephoneNumber: string;
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
  primarySignature: string | null;
  jointSignature?: string | null;
}

export interface SubmitRedemptionRequest {
  formData: RedemptionFormData;
  pdfContent: string;
  fundManagerEmail: string;
}
