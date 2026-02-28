import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otps, OtpPurpose } from './otp.entity';
import { User } from 'src/user/user.entity';
import { MailService } from 'src/mail/mail.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

jest.mock('bcrypt');

describe('OtpService', () => {
  let service: OtpService;
  let otpRepo: jest.Mocked<Repository<Otps>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let mailService: jest.Mocked<MailService>;

  const mockOtpRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepo = {
    findOne: jest.fn(),
  };

  const mockMailService = {
    sendOtpEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        { provide: getRepositoryToken(Otps), useValue: mockOtpRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
    otpRepo = module.get(getRepositoryToken(Otps));
    userRepo = module.get(getRepositoryToken(User));
    mailService = module.get(MailService);
  });

  afterEach(() => jest.clearAllMocks());

  /* ================= CREATE OTP ================= */

  it('should create and send OTP successfully', async () => {
    const user = { id: 1, email: 'test@mail.com' };

    userRepo.findOne.mockResolvedValue(user as any);
    otpRepo.delete.mockResolvedValue({} as any);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedOtp');
    otpRepo.create.mockReturnValue({ id: 10 } as any);
    otpRepo.save.mockResolvedValue({ id: 10 } as any);
    mailService.sendOtpEmail.mockResolvedValue(undefined);

    const result = await service.createAndSendOtp(
      'test@mail.com',
      OtpPurpose.LOGIN,
    );

    expect(result).toEqual({ message: 'OTP sent successfully' });
    expect(mailService.sendOtpEmail).toHaveBeenCalledWith(
      'test@mail.com',
      '123456',
      OtpPurpose.LOGIN,
    );
  });

  it('should throw NotFoundException if user not found', async () => {
    userRepo.findOne.mockResolvedValue(null);

    await expect(
      service.createAndSendOtp('wrong@mail.com', OtpPurpose.LOGIN),
    ).rejects.toThrow(NotFoundException);
  });

  /* ================= VERIFY OTP ================= */

  it('should verify OTP successfully (LOGIN)', async () => {
    const user = { id: 1, email: 'test@mail.com' };

    const otpEntity = {
      id: 1,
      otpHash: 'hashed',
      expiresAt: new Date(Date.now() + 60000),
      attempts: 0,
      isUsed: false,
      user,
    };

    userRepo.findOne.mockResolvedValue(user as any);
    otpRepo.findOne.mockResolvedValue(otpEntity as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    otpRepo.save.mockResolvedValue(otpEntity as any);

    const result = await service.verifyOtp(
      'test@mail.com',
      '123456',
      OtpPurpose.LOGIN,
    );

    expect(result.message).toBe('OTP verified successfully');
    expect(otpEntity.isUsed).toBe(true);
  });

  it('should delete OTP for FORGOT_PASSWORD', async () => {
    const user = { id: 1, email: 'test@mail.com' };

    const otpEntity = {
      id: 1,
      otpHash: 'hashed',
      expiresAt: new Date(Date.now() + 60000),
      attempts: 0,
      user,
    };

    userRepo.findOne.mockResolvedValue(user as any);
    otpRepo.findOne.mockResolvedValue(otpEntity as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await service.verifyOtp(
      'test@mail.com',
      '123456',
      OtpPurpose.FORGOT_PASSWORD,
    );

    expect(otpRepo.delete).toHaveBeenCalledWith(1);
  });

  it('should throw if OTP expired', async () => {
    const user = { id: 1 };

    const otpEntity = {
      id: 1,
      expiresAt: new Date(Date.now() - 60000),
      attempts: 0,
    };

    userRepo.findOne.mockResolvedValue(user as any);
    otpRepo.findOne.mockResolvedValue(otpEntity as any);

    await expect(
      service.verifyOtp('mail', '123', OtpPurpose.LOGIN),
    ).rejects.toThrow(BadRequestException);

    expect(otpRepo.delete).toHaveBeenCalled();
  });

  it('should throw if too many attempts', async () => {
    const user = { id: 1 };

    const otpEntity = {
      id: 1,
      expiresAt: new Date(Date.now() + 60000),
      attempts: 3,
    };

    userRepo.findOne.mockResolvedValue(user as any);
    otpRepo.findOne.mockResolvedValue(otpEntity as any);

    await expect(
      service.verifyOtp('mail', '123', OtpPurpose.LOGIN),
    ).rejects.toThrow(BadRequestException);

    expect(otpRepo.delete).toHaveBeenCalled();
  });

  it('should increment attempts if OTP invalid', async () => {
    const user = { id: 1 };

    const otpEntity = {
      id: 1,
      otpHash: 'hashed',
      expiresAt: new Date(Date.now() + 60000),
      attempts: 0,
    };

    userRepo.findOne.mockResolvedValue(user as any);
    otpRepo.findOne.mockResolvedValue(otpEntity as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    otpRepo.save.mockResolvedValue(otpEntity as any);

    await expect(
      service.verifyOtp('mail', 'wrong', OtpPurpose.LOGIN),
    ).rejects.toThrow(BadRequestException);

    expect(otpEntity.attempts).toBe(1);
  });

  it('should throw if no OTP found', async () => {
    userRepo.findOne.mockResolvedValue({ id: 1 } as any);
    otpRepo.findOne.mockResolvedValue(null);

    await expect(
      service.verifyOtp('mail', '123', OtpPurpose.LOGIN),
    ).rejects.toThrow(BadRequestException);
  });
});
