import { Test, TestingModule } from '@nestjs/testing';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { AuthService } from 'src/auth/auth.service';

describe('OtpController', () => {
  let controller: OtpController;
  let otpService: jest.Mocked<OtpService>;
  let authService: jest.Mocked<AuthService>;

  const mockOtpService = {
    createAndSendOtp: jest.fn(),
    verifyOtp: jest.fn(),
  };

  const mockAuthService = {
    issueTokensForUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpController],
      providers: [
        { provide: OtpService, useValue: mockOtpService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<OtpController>(OtpController);
    otpService = module.get(OtpService);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* ================= BASIC ================= */

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /* ================= SEND OTP ================= */

  it('should send OTP successfully', async () => {
    const dto = {
      email: 'test@example.com',
      purpose: 'login',
    };

    mockOtpService.createAndSendOtp.mockResolvedValue(undefined);

    const result = await controller.sendOtp(dto as any);

    expect(otpService.createAndSendOtp).toHaveBeenCalledWith(
      dto.email,
      dto.purpose,
    );

    expect(result).toBeUndefined();
  });

  /* ================= VERIFY OTP ================= */

  it('should verify OTP and return tokens', async () => {
    const dto = {
      email: 'test@example.com',
      otp: '123456',
      purpose: 'login',
    };

    const mockUser = { id: 1, email: dto.email };

    mockOtpService.verifyOtp.mockResolvedValue({
      user: mockUser,
    });

    mockAuthService.issueTokensForUser.mockResolvedValue({
      access_token: 'access123',
      refresh_token: 'refresh123',
    });

    const result = await controller.verifyOtp(dto as any);

    expect(otpService.verifyOtp).toHaveBeenCalledWith(
      dto.email,
      dto.otp,
      dto.purpose,
    );

    expect(authService.issueTokensForUser).toHaveBeenCalledWith(mockUser);

    expect(result).toEqual({
      access_token: 'access123',
      refresh_token: 'refresh123',
    });
  });
});
