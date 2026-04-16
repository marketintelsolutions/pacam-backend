// src/contact/contact.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Logger,
  Get,
} from "@nestjs/common";
import { ContactService, ContactFormData } from "./contact.service";

interface SubmitContactRequest {
  formData: ContactFormData;
  adminEmail: string;
}

@Controller("contact")
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly contactService: ContactService) {}

  @Post("submit")
  async submitContactForm(@Body() request: SubmitContactRequest) {
    try {
      this.logger.log(
        `Received contact form submission from: ${request.formData?.name}`
      );

      if (!request.formData || !request.adminEmail) {
        throw new HttpException(
          "Missing required fields: formData and adminEmail are required",
          HttpStatus.BAD_REQUEST
        );
      }

      const validation = this.contactService.validateContactData(
        request.formData
      );

      if (!validation.valid) {
        throw new HttpException(
          { message: "Form validation failed", errors: validation.errors },
          HttpStatus.BAD_REQUEST
        );
      }

      const currentDate = Date.now();

      await this.contactService.sendContactMessage(
        request.formData,
        request.adminEmail,
        currentDate
      );

      await this.contactService.sendClientConfirmationEmail(
        request.formData,
        currentDate
      );

      return {
        success: true,
        message: "Message sent successfully",
        referenceId: `PACAM-CONTACT-${currentDate}`,
      };
    } catch (error) {
      this.logger.error("Failed to submit contact form", error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Internal server error while processing contact form",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("health")
  healthCheck() {
    return {
      status: "ok",
      service: "contact",
      timestamp: new Date().toISOString(),
    };
  }
}
