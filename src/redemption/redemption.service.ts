// src/redemption/redemption.service.ts
import { Injectable } from "@nestjs/common";
import { RedemptionFormData } from "../types/redemption.types";

@Injectable()
export class RedemptionService {
  validateRedemptionData(formData: RedemptionFormData) {
    const errors: string[] = [];

    // Required fields
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push("Invalid email format");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
