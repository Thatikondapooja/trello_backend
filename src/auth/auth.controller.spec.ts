import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { OtpService } from 'src/otp/otp.service';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  resetPassword: jest.fn(),
  refresh: jest.fn(),
};

const mockOtpService = {
  verifyOtp: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: OtpService, useValue: mockOtpService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authService.register with correct parameters', async () => {
    const registerData = {
      FullName: 'jhow',
      email: 'jhow@gmail.com',
      password: 'jhow123',
    };
    mockAuthService.register.mockResolvedValue({
      message: 'User registered',
    });
    const results = await controller.register(registerData);
    // expect(mockAuthService.register).toHaveBeenCalledWith(registerData.FullName, registerData.email, registerData.password);
    expect(mockAuthService.register).toHaveBeenCalledWith(
      'jhow',
      'jhow@gmail.com',
      'jhow123',
    );

    expect(results).toEqual({ message: 'User registered' });
  });

  it('should return user profile', () => {
    const mockReq = {
      user: { id: 1, email: 'jhow@gmail.com' },
    };

    const result = controller.getProfile(mockReq);

    expect(result).toEqual({
      message: 'JWT is working',
      user: mockReq.user,
    });
  });

  it('should call authService.login with correct parameters', async () => {
    const loginData = { email: 'jhow@gmail.com', password: 'jhow123' };
    mockAuthService.login.mockResolvedValue({
      message: 'User logged in',
    });
    const results = await controller.login(loginData);
    expect(mockAuthService.login).toHaveBeenCalledWith(
      loginData.email,
      loginData.password,
    );
    expect(results).toEqual({ message: 'User logged in' });
  });

  it('should call authService.refresh with correct parameters', async () => {
    const resetData = { refreshToken: 'jhow123' };
    mockAuthService.refresh.mockResolvedValue({
      message: 'Refresh token used successfully',
    });
    const results = await controller.refresh(resetData);
    expect(mockAuthService.refresh).toHaveBeenCalledWith(
      resetData.refreshToken,
    );
    expect(results).toEqual({ message: 'Refresh token used successfully' });
  });

  it('should call otpService.verifyOtp correctly', async () => {
    const verifyData = {
      email: 'jhow@gmail.com',
      otp: '009123',
      purpose: 'FORGOT_PASSWORD',
    };

    mockOtpService.verifyOtp.mockResolvedValue(true);

    const result = await controller.verifyForgotOtp(verifyData);

    expect(mockOtpService.verifyOtp).toHaveBeenCalledWith(
      'jhow@gmail.com',
      '009123',
      expect.anything(), // OtpPurpose.FORGOT_PASSWORD
    );

    expect(result).toEqual({ message: 'OTP verified successfully' });
  });

  it('should call authService.resetPassword with correct parameters', async () => {
    const resetData = { email: 'jhow@gmail.com', password: 'jhow123' };
    mockAuthService.resetPassword.mockResolvedValue({
      message: 'Password reset successfully',
    });
    const results = await controller.resetPassword(resetData);
    expect(mockAuthService.resetPassword).toHaveBeenCalledWith(resetData);
    expect(results).toEqual({ message: 'Password reset successfully' });
  });
});
