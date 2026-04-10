import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class MailerService {
  private resend: Resend;
  private readonly logger = new Logger(MailerService.name);

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_fallback");
  }

  async sendFacultyInvite(email: string, institutionName: string, role: string, inviteUrl: string) {
    if (!process.env.RESEND_API_KEY) {
      this.logger.warn(`Resend API key missing. Would have sent invite to ${email}`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: "ExamCraft <onboarding@examcraft.in>",
        to: email,
        subject: `You have been invited to join ${institutionName} on ExamCraft`,
        html: `
          <h3>Welcome to ExamCraft</h3>
          <p>You have been invited to join <strong>${institutionName}</strong> as a <strong>${role}</strong>.</p>
          <p>Click the link below to accept your invitation:</p>
          <a href="${inviteUrl}">Accept Invitation</a>
        `,
      });
    } catch (err) {
      this.logger.error("Failed to send welcome email", err);
    }
  }

  async sendPaperSubmittedForReview(reviewerEmail: string, paperTitle: string, submitterName: string) {
    if (!process.env.RESEND_API_KEY) {
      this.logger.warn(`Resend API key missing. Would have sent paper submission to ${reviewerEmail}`);
      return;
    }

    try {
      await this.resend.emails.send({
        from: "ExamCraft <notifications@examcraft.in>",
        to: reviewerEmail,
        subject: `Action Required: Review requested for "${paperTitle}"`,
        html: `
          <h3>Review Requested</h3>
          <p>${submitterName} has submitted the paper <strong>${paperTitle}</strong> for your review.</p>
          <p>Please log in to the ExamCraft dashboard to review and approve the paper.</p>
        `,
      });
    } catch (err) {
      this.logger.error("Failed to send review requested email", err);
    }
  }

  async sendPaperReviewed(facultyEmail: string, paperTitle: string, action: string, comment: string) {
    if (!process.env.RESEND_API_KEY) {
      this.logger.warn(`Resend API key missing. Would have sent paper reviewed to ${facultyEmail}`);
      return;
    }

    const color = action === 'approved' ? 'green' : 'red';
    try {
      await this.resend.emails.send({
        from: "ExamCraft <notifications@examcraft.in>",
        to: facultyEmail,
        subject: `Paper Status Update: ${paperTitle} was ${action}`,
        html: `
          <h3>Paper ${action.charAt(0).toUpperCase() + action.slice(1)}</h3>
          <p>Your paper <strong>${paperTitle}</strong> has been <span style="color: ${color}; font-weight: bold;">${action}</span>.</p>
          ${comment ? `<p><strong>Reviewer Comment:</strong> ${comment}</p>` : ''}
          <p>Log in to view the paper details.</p>
        `,
      });
    } catch (err) {
      this.logger.error("Failed to send paper status email", err);
    }
  }
}
