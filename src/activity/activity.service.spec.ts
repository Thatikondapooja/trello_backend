import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { Activity } from './activity.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ActivityService', () => {
  let service: ActivityService;
  let activityRepo: jest.Mocked<Repository<Activity>>;

  const mockActivityRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: getRepositoryToken(Activity),
          useValue: mockActivityRepo,
        },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    activityRepo = module.get(getRepositoryToken(Activity));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log activity successfully', async () => {
    const message = 'Test activity';
    const board = { id: 1, title: 'Test Board' } as any;
    const user = { id: 1, username: 'testuser' } as any;

    const mockActivity = {
      id: 1,
      message,
      board,
      user,
      createdAt: new Date(),
    };

    activityRepo.create.mockReturnValue(mockActivity as any);
    activityRepo.save.mockResolvedValue(mockActivity as any);

    const result = await service.log(message, board, user);

    expect(activityRepo.create).toHaveBeenCalledWith({
      message,
      board,
      user,
    });

    expect(activityRepo.save).toHaveBeenCalledWith(mockActivity);

    expect(result).toEqual(mockActivity);
  });
});