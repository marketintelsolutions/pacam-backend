// src/corporate-investment/corporate-investment.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Logger,
  Get,
} from "@nestjs/common";
import { CorporateInvestmentService } from "./corporate-investment.service";
import { EmailTemplateService } from "../email/email-template.service";
import { SubmitCorporateInvestmentRequest } from "../types/corporate-investment.types";

@Controller("corporate-investment")
export class CorporateInvestmentController {
  private readonly logger = new Logger(CorporateInvestmentController.name);

  constructor(
    private readonly corporateInvestmentService: CorporateInvestmentService,
    private readonly emailTemplateService: EmailTemplateService
  ) {}

  @Post("submit")
  async submitCorporateInvestmentForm(
    @Body() request: SubmitCorporateInvestmentRequest
  ) {
    try {
      this.logger.log(
        `Received corporate investment submission for: ${request.formData.companyName}`
      );

      // Validate request structure
      if (!request.formData || !request.pdfContent || !request.adminEmail) {
        throw new HttpException(
          "Missing required fields: formData, pdfContent, and adminEmail are required",
          HttpStatus.BAD_REQUEST
        );
      }

      // Validate form data
      const validation = this.corporateInvestmentService.validateCorporateInvestmentData(
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
      const referenceId = `PACAM-CORP-INV-${currentDate}`;

      // Prepare attachments for email
      const emailAttachments = [
        {
          filename: `Corporate_Investment_${request.formData.companyName}_${currentDate}.pdf`,
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
      await this.corporateInvestmentService.sendCorporateInvestmentForm(
        request.formData,
        request.adminEmail,
        currentDate,
        emailAttachments
      );

      // Send confirmation to company
      if (request.formData.emailAddress) {
        await this.corporateInvestmentService.sendClientConfirmationEmail(
          request.formData,
          currentDate,
          emailAttachments
        );
      }

      // Send copy to user if different email provided
      if (
        request.formData.userEmail &&
        request.formData.userEmail !== request.formData.emailAddress
      ) {
        await this.corporateInvestmentService.sendClientConfirmationEmail(
          { ...request.formData, emailAddress: request.formData.userEmail },
          currentDate,
          emailAttachments
        );
      }

      return {
        success: true,
        message: "Corporate investment application submitted successfully",
        referenceId,
      };
    } catch (error) {
      this.logger.error(
        "Failed to submit corporate investment form",
        error.stack
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Internal server error while processing corporate investment application",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("health")
  healthCheck() {
    return {
      status: "ok",
      service: "corporate-investment",
      timestamp: new Date().toISOString(),
    };
  }
}
