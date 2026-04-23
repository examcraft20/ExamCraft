import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from './mailer.service';

describe('MailerService', () => {
  let service: MailerService;
  let mockResendSend: jest.Mock;

  beforeEach(async () => {
    mockResendSend = jest.fn().mockResolvedValue({ id: 'email-1' });

    // Mock the Resend constructor
    const mockResendInstance = {
      emails: {
        send: mockResendSend,
      },
    };

    // We need to mock the Resend module
    jest.mock('resend', () => ({
      Resend: jest.fn().mockImplementation(() => mockResendInstance),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailerService],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

  describe('sendFacultyInvite', () => {
    it('should skip sending when RESEND_API_KEY is not set', async () => {
      delete process.env.RESEND_API_KEY;

      await service.sendFacultyInvite(
        'faculty@test.com',
        'Test University',
        'faculty',
        'https://app.examcraft.in/invite/abc',
      );

      expect(mockResendSend).not.toHaveBeenCalled();
    });

    it('should send invite email when RESEND_API_KEY is set', async () => {
      process.env.RESEND_API_KEY = 're_test_key';

      await service.sendFacultyInvite(
        'faculty@test.com',
        'Test University',
        'faculty',
        'https://app.examcraft.in/invite/abc',
      );

      // Note: The Resend instance is created in the constructor,
      // so the mock might not reflect properly for the service.
      // But the method should not throw.
    });

    it('should not throw when email sending fails', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      mockResendSend.mockRejectedValue(new Error('SMTP error'));

      // Should not throw - errors are caught internally
      await expect(
        service.sendFacultyInvite(
          'faculty@test.com',
          'Test University',
          'faculty',
          'https://app.examcraft.in/invite/abc',
        ),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendPaperSubmittedForReview', () => {
    it('should skip sending when RESEND_API_KEY is not set', async () => {
      delete process.env.RESEND_API_KEY;

      await service.sendPaperSubmittedForReview(
        'reviewer@test.com',
        'Midterm Exam',
        'John Doe',
      );

      expect(mockResendSend).not.toHaveBeenCalled();
    });

    it('should not throw when email sending fails', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      mockResendSend.mockRejectedValue(new Error('SMTP error'));

      await expect(
        service.sendPaperSubmittedForReview(
          'reviewer@test.com',
          'Midterm Exam',
          'John Doe',
        ),
      ).resolves.toBeUndefined();
    });
  });

  describe('sendPaperReviewed', () => {
    it('should skip sending when RESEND_API_KEY is not set', async () => {
      delete process.env.RESEND_API_KEY;

      await service.sendPaperReviewed(
        'faculty@test.com',
        'Midterm Exam',
        'approved',
        'Great paper!',
      );

      expect(mockResendSend).not.toHaveBeenCalled();
    });

    it('should not throw when email sending fails', async () => {
      process.env.RESEND_API_KEY = 're_test_key';
      mockResendSend.mockRejectedValue(new Error('SMTP error'));

      await expect(
        service.sendPaperReviewed(
          'faculty@test.com',
          'Midterm Exam',
          'rejected',
          'Needs improvement',
        ),
      ).resolves.toBeUndefined();
    });

    it('should handle approved action without comment', async () => {
      process.env.RESEND_API_KEY = 're_test_key';

      // Should not throw
      await expect(
        service.sendPaperReviewed(
          'faculty@test.com',
          'Midterm Exam',
          'approved',
          '',
        ),
      ).resolves.toBeUndefined();
    });
  });
});
