// src/mutual-fund/mutual-fund.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Logger,
  Get,
} from "@nestjs/common";
import { MutualFundService } from "./mutual-fund.service";
import { EmailTemplateService } from "../email/email-template.service";
import { SubmitMutualFundRequest } from "../types/mutual-fund.types";

@Controller("mutual-fund")
export class MutualFundController {
  private readonly logger = new Logger(MutualFundController.name);

  constructor(
    private readonly mutualFundService: MutualFundService,
    private readonly emailTemplateService: EmailTemplateService
  ) {}

  @Post("submit")
  async submitMutualFundForm(@Body() request: SubmitMutualFundRequest) {
    try {
      this.logger.log(
        `Received mutual fund submission for: ${request.formData.primaryApplicant.surname} ${request.formData.primaryApplicant.name}`
      );

      // Validate request structure
      if (!request.formData || !request.pdfContent || !request.adminEmail) {
        throw new HttpException(
          "Missing required fields: formData, pdfContent, and adminEmail are required",
          HttpStatus.BAD_REQUEST
        );
      }

      // Validate form data
      const validation = this.mutualFundService.validateMutualFundData(
        request.formData
      );

      if (!validation.valid) {
        throw new HttpException(
          {
            message: "Form validation failed",
            errors: validation.errors,
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const currentDate = Date.now();
      const referenceId = `PACAM-MF-${currentDate}`;

      // Prepare attachments for email
      const emailAttachments = [
        {
          filename: `Mutual_Fund_${request.formData.primaryApplicant.surname}_${request.formData.primaryApplicant.name}_${currentDate}.pdf`,
          content: request.pdfContent,
          encoding: "base64",
        },
      ];

      // Add file attachments if provided
      if (request.attachments && request.attachments.length > 0) {
        request.attachments.forEach((attachment) => {
          emailAttachments.push({
            filename: attachment.filename,
            content: attachment.content,
            encoding: "base64",
          });
        });
      }

      // Send emails
      await this.mutualFundService.sendMutualFundForm(
        request.formData,
        request.adminEmail,
        currentDate,
        emailAttachments
      );

      // Send confirmation to primary applicant
      if (request.formData.primaryApplicant.emailAddress) {
        await this.mutualFundService.sendClientConfirmationEmail(
          request.formData,
          currentDate,
          emailAttachments
        );
      }

      // Send copy to joint applicant if different email provided
      if (
        request.formData.isJointAccount &&
        request.formData.jointApplicant?.emailAddress &&
        request.formData.jointApplicant.emailAddress !==
          request.formData.primaryApplicant.emailAddress
      ) {
        await this.mutualFundService.sendClientConfirmationEmail(
          {
            ...request.formData,
            primaryApplicant: {
              ...request.formData.jointApplicant,
              surname: request.formData.jointApplicant.surname,
              name: request.formData.jointApplicant.name,
              emailAddress: request.formData.jointApplicant.emailAddress,
            },
          },
          currentDate,
          emailAttachments
        );
      }

      return {
        success: true,
        message: "Mutual fund application submitted successfully",
        referenceId,
      };
    } catch (error) {
      this.logger.error("Failed to submit mutual fund form", error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Internal server error while processing mutual fund application",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("health")
  healthCheck() {
    return {
      status: "ok",
      service: "mutual-fund",
      timestamp: new Date().toISOString(),
    };
  }
}
