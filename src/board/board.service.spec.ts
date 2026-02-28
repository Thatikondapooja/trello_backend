import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { User } from 'src/user/user.entity';
import { List } from 'src/list/list.entity';
import { ActivityService } from 'src/activity/activity.service';
import { find } from 'rxjs';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('BoardService', () => {
  let service: BoardService;
  let boardRepo:Repository<Board>;
  let userRepo: Repository<User>;
  let listRepo: Repository<List>;
  let activityService: ActivityService;

  const mockboardRepo ={
    create: jest.fn(),
    save: jest.fn(),  
    findOne: jest.fn(),
    find: jest.fn(),
  }

  const mockUserRepo = {
    findOne: jest.fn(),
  }
  const mockListRepo = {
    create: jest.fn(),
    save: jest.fn(),
  }
  const mockActivityService = {
    log: jest.fn(),
  } 

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      BoardService,
      { provide: getRepositoryToken(Board), useValue: mockboardRepo },
      { provide: getRepositoryToken(User), useValue: mockUserRepo },
      { provide: getRepositoryToken(List), useValue: mockListRepo },
      { provide: ActivityService, useValue: mockActivityService },
    ],
  }).compile();

  service = module.get<BoardService>(BoardService);
  boardRepo = module.get(getRepositoryToken(Board));
  userRepo = module.get(getRepositoryToken(User));
  listRepo = module.get(getRepositoryToken(List));
  activityService = module.get(ActivityService);
});

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
    
  
  it('should create board successfully with default lists', async () => {
  const dto = { title: 'Test Board', description: 'desc' };

  const mockUser = { id: 1 };
  const mockBoard = { id: 10, title: 'Test Board' };

  mockUserRepo.findOne.mockResolvedValue(mockUser);
  mockboardRepo.create.mockReturnValue(mockBoard);
  mockboardRepo.save.mockResolvedValue(mockBoard);

  mockListRepo.create.mockImplementation((data) => data);
  mockListRepo.save.mockResolvedValue({});

  const result = await service.createBoard(dto as any, 1);

  expect(mockUserRepo.findOne).toHaveBeenCalledWith({
    where: { id: 1 },
  });

  expect(mockboardRepo.save).toHaveBeenCalled();
  expect(mockListRepo.save).toHaveBeenCalledTimes(3); // 🔥 3 default lists
  expect(mockActivityService.log).toHaveBeenCalled();

  expect(result).toEqual(mockBoard);
});

it('should throw error if user not found', async () => {
  mockUserRepo.findOne.mockResolvedValue(null);

  await expect(
    service.createBoard({ title: 'Test', description: '' } as any, 1),
  ).rejects.toThrow('User not found');
});
   
it('should return boards for user', async () => {
  const boards = [{ id: 1 }, { id: 2 }];

  mockboardRepo.find = jest.fn().mockResolvedValue(boards);

  const result = await service.getBoards(1);

  expect(mockboardRepo.find).toHaveBeenCalledWith({
    where: { owner: { id: 1 } },
    order: { createdAt: 'DESC' },
  });

  expect(result).toEqual(boards);
});

it('should return board members', async () => {
  const mockBoard = {
    id: 1,
    members: [{ id: 1 }, { id: 2 }],
  };

  mockboardRepo.findOne.mockResolvedValue(mockBoard);

  const result = await service.getBoardMembers(1);

  expect(result).toEqual(mockBoard.members);
});

it('should throw if board not found', async () => {
  mockboardRepo.findOne.mockResolvedValue(null);

  await expect(service.getBoardMembers(1))
    .rejects.toThrow('Board not found');
});

});
