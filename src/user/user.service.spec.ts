import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;

  const mockUserRepo = {
    findOneBy: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* ================= FIND BY ID ================= */

  it('should return user if found', async () => {
    const mockUser = { id: 1, email: 'test@mail.com' };

    userRepo.findOneBy.mockResolvedValue(mockUser as User);

    const result = await service.findById(1);

    expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(mockUser);
  });

  it('should return null if user not found', async () => {
    userRepo.findOneBy.mockResolvedValue(null);

    const result = await service.findById(999);

    expect(result).toBeNull();
  });

  /* ================= SET REFRESH TOKEN ================= */

  it('should update refresh token', async () => {
    userRepo.update.mockResolvedValue({} as any);

    await service.setRefreshToken(1, 'hashedToken');

    expect(userRepo.update).toHaveBeenCalledWith(1, {
      refreshToken: 'hashedToken',
    });
  });

  /* ================= CLEAR REFRESH TOKEN ================= */

  it('should clear refresh token', async () => {
    userRepo.update.mockResolvedValue({} as any);

    await service.clearRefreshToken(1);

    expect(userRepo.update).toHaveBeenCalledWith(1, {
      refreshToken: null,
    });
  });

  /* ================= VALIDATE REFRESH TOKEN ================= */

  it('should return false if user has no refresh token', async () => {
    const user = { id: 1, refreshToken: null };

    const result = await service.validateRefreshToken(
      'token',
      user as User,
    );

    expect(result).toBe(false);
  });

  it('should return true if refresh token matches', async () => {
    const user = { id: 1, refreshToken: 'hashedToken' };

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validateRefreshToken(
      'plainToken',
      user as User,
    );

    expect(bcrypt.compare).toHaveBeenCalledWith(
      'plainToken',
      'hashedToken',
    );

    expect(result).toBe(true);
  });

  it('should return false if refresh token does not match', async () => {
    const user = { id: 1, refreshToken: 'hashedToken' };

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await service.validateRefreshToken(
      'wrongToken',
      user as User,
    );

    expect(result).toBe(false);
  });
});