import { MailService } from './mail.service';
import * as https from 'https';
import * as nodemailer from 'nodemailer';
import { OtpPurpose } from 'src/otp/otp.entity';

jest.mock('https');
jest.mock('nodemailer');

describe('MailService', () => {
  let service: MailService;

  const mockSendMail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.SENDGRID_API_KEY;
    delete process.env.MAIL_USER;
    delete process.env.MAIL_PASS;
  });

  /* ================= SENDGRID MODE ================= */

  it('should send reminder via SendGrid API', async () => {
    process.env.SENDGRID_API_KEY = 'test-key';

    const mockRequest = {
      on: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
    };

    (https.request as jest.Mock).mockImplementation((options, callback) => {
      const res = {
        statusCode: 202,
        on: jest.fn((event, cb) => {
          if (event === 'end') cb();
        }),
      };
      callback(res);
      return mockRequest;
    });

    service = new MailService();

    const result = await service.sendReminderEmail(
      'test@mail.com',
      'Card 1',
      new Date(),
    );

    expect(result).toBe(true);
  });

  /* ================= SMTP MODE ================= */

  it('should send reminder via SMTP', async () => {
    process.env.MAIL_USER = 'test@gmail.com';
    process.env.MAIL_PASS = 'password';

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail.mockResolvedValue(true),
    });

    service = new MailService();

    const result = await service.sendReminderEmail(
      'test@mail.com',
      'Card 1',
      new Date(),
    );

    expect(mockSendMail).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should return false if SMTP fails', async () => {
    process.env.MAIL_USER = 'test@gmail.com';
    process.env.MAIL_PASS = 'password';

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail.mockRejectedValue(new Error('SMTP error')),
    });

    service = new MailService();

    const result = await service.sendReminderEmail(
      'test@mail.com',
      'Card 1',
      new Date(),
    );

    expect(result).toBe(false);
  });

  /* ================= NO CONFIG MODE ================= */

  it('should return false if no email config exists', async () => {
    service = new MailService();

    const result = await service.sendReminderEmail(
      'test@mail.com',
      'Card 1',
      new Date(),
    );

    expect(result).toBe(false);
  });

  /* ================= OTP EMAIL ================= */

  it('should throw if OTP email recipient missing', async () => {
    service = new MailService();

    await expect(
      service.sendOtpEmail('', '123456', OtpPurpose.LOGIN),
    ).rejects.toThrow('Recipient email is required');
  });

  it('should send OTP via SMTP', async () => {
    process.env.MAIL_USER = 'test@gmail.com';
    process.env.MAIL_PASS = 'password';

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail.mockResolvedValue(true),
    });

    service = new MailService();

    await service.sendOtpEmail('test@mail.com', '123456', OtpPurpose.LOGIN);

    expect(mockSendMail).toHaveBeenCalled();
  });

  it('should send OTP via SendGrid', async () => {
    process.env.SENDGRID_API_KEY = 'test-key';

    const mockRequest = {
      on: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
    };

    (https.request as jest.Mock).mockImplementation((options, callback) => {
      const res = {
        statusCode: 202,
        on: jest.fn((event, cb) => {
          if (event === 'end') cb();
        }),
      };
      callback(res);
      return mockRequest;
    });

    service = new MailService();

    await service.sendOtpEmail('test@mail.com', '123456', OtpPurpose.LOGIN);
  });
});
