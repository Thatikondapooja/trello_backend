import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

/**
 * ✅ IMPORTANT: mock bcrypt at TOP LEVEL
 */
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;
  let userService: jest.Mocked<UserService>;

  const mockUserRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUserService = {
    setRefreshToken: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- REGISTER SUCCESS ----------------
  it('should register successfully', async () => {
    userRepo.findOne.mockResolvedValue(null);

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

    userRepo.create.mockReturnValue({
      id: 1,
      FullName: 'John',
      email: 'john@gmail.com',
      password: 'hashedPassword',
    } as User);

    userRepo.save.mockResolvedValue({ id: 1 } as User);

    const result = await service.register('John', 'john@gmail.com', '123456');

    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);

    expect(result).toEqual({
      message: 'User registered successfully',
      userId: 1,
      username: 'John',
      email: 'john@gmail.com',
    });
  });

  // ---------------- REGISTER FAIL ----------------
  it('should throw if email already exists', async () => {
    userRepo.findOne.mockResolvedValue({ id: 1 } as User);

    await expect(
      service.register('John', 'john@gmail.com', '123456'),
    ).rejects.toThrow('User with this email already exists');
  });

  // ---------------- LOGIN SUCCESS ----------------
  it('should login successfully', async () => {
    userRepo.findOne.mockResolvedValue({
      id: 1,
      email: 'john@gmail.com',
      FullName: 'John',
      password: 'hashedPassword',
    } as User);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');

    jwtService.sign
      .mockReturnValueOnce('accessToken')
      .mockReturnValueOnce('refreshToken');

    const result = await service.login('john@gmail.com', '123456');

    expect(result).toEqual({
      message: 'Login successful',
      userId: 1,
      FullName: 'John',
      email: 'john@gmail.com',
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    });
  });

  // ---------------- LOGIN USER NOT FOUND ----------------
  it('should throw if user not found', async () => {
    userRepo.findOne.mockResolvedValue(null);

    await expect(service.login('wrong@gmail.com', '123456')).rejects.toThrow(
      'Invalid email or password',
    );
  });

  // ---------------- LOGIN PASSWORD INVALID ----------------
  it('should throw if password invalid', async () => {
    userRepo.findOne.mockResolvedValue({
      id: 1,
      password: 'hashedPassword',
    } as User);

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login('john@gmail.com', 'wrong')).rejects.toThrow(
      'Invalid email or password',
    );
  });

  // ---------------- REFRESH SUCCESS ----------------
  it('should refresh successfully', async () => {
    jwtService.verify.mockReturnValue({ sub: 1 });

    userService.findById.mockResolvedValue({
      id: 1,
      email: 'john@gmail.com',
      refreshToken: 'hashedRefreshToken',
    } as unknown as User);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    jwtService.sign.mockReturnValue('newAccessToken');

    const result = await service.refresh('refreshToken');

    expect(result).toEqual({
      accessToken: 'newAccessToken',
    });
  });

  // ---------------- RESET PASSWORD SUCCESS ----------------
  it('should resetPassword successfully', async () => {
    userRepo.findOne.mockResolvedValue({
      id: 1,
      email: 'john@gmail.com',
      password: 'oldPassword',
    } as User);

    (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

    userRepo.save.mockResolvedValue({} as User);

    const result = await service.resetPassword({
      email: 'john@gmail.com',
      password: '123456',
    });

    expect(result).toEqual({
      message: 'Password updated successfully',
    });
  });

  // ---------------- RESET PASSWORD USER NOT FOUND ----------------
  it('should throw if user not found during resetPassword', async () => {
    userRepo.findOne.mockResolvedValue(null);

    await expect(
      service.resetPassword({
        email: 'john@gmail.com',
        password: '123456',
      }),
    ).rejects.toThrow('User not found');
  });
});
