import { Test, TestingModule } from '@nestjs/testing';
import { ListsService } from './list.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from './list.entity';
import { Board } from '../board/board.entity';
import { ActivityService } from '../activity/activity.service';
import { NotFoundException } from '@nestjs/common';

describe('ListsService', () => {
  let service: ListsService;
  let listRepo: jest.Mocked<Repository<List>>;
  let boardRepo: jest.Mocked<Repository<Board>>;
  let activityService: jest.Mocked<ActivityService>;

  const mockListRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockBoardRepo = {
    findOne: jest.fn(),
  };

  const mockActivityService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListsService,
        { provide: getRepositoryToken(List), useValue: mockListRepo },
        { provide: getRepositoryToken(Board), useValue: mockBoardRepo },
        { provide: ActivityService, useValue: mockActivityService },
      ],
    }).compile();

    service = module.get<ListsService>(ListsService);
    listRepo = module.get(getRepositoryToken(List));
    boardRepo = module.get(getRepositoryToken(Board));
    activityService = module.get(ActivityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 🔥 CREATE LIST SUCCESS
  it('should create list successfully', async () => {
    const dto = { title: 'Test List', boardId: 1 };
    const mockBoard = { id: 1 };
    const mockUser = { id: 10 };
    const mockSavedList = { id: 100, title: 'Test List', board: mockBoard };

    boardRepo.findOne.mockResolvedValue(mockBoard as any);
    listRepo.create.mockReturnValue(mockSavedList as any);
    listRepo.save.mockResolvedValue(mockSavedList as any);

    const result = await service.createList(dto as any, mockUser as any);

    expect(boardRepo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(listRepo.save).toHaveBeenCalled();
    expect(activityService.log).toHaveBeenCalledWith(
      "List 'Test List' added",
      mockBoard,
      mockUser,
    );

    expect(result).toEqual(mockSavedList);
  });

  // ❌ BOARD NOT FOUND
  it('should throw NotFoundException if board not found', async () => {
    boardRepo.findOne.mockResolvedValue(null);

    await expect(
      service.createList({ title: 'Test', boardId: 1 } as any, {} as any),
    ).rejects.toThrow(NotFoundException);
  });

  // 🔥 GET LISTS BY BOARD
  it('should return lists by board', async () => {
    const mockLists = [
      { id: 1, title: 'List 1' },
      { id: 2, title: 'List 2' },
    ];

    listRepo.find.mockResolvedValue(mockLists as any);

    const result = await service.getListsByBoard(1);

    expect(listRepo.find).toHaveBeenCalledWith({
      where: { board: { id: 1 } },
      order: { createdAt: 'ASC' },
    });

    expect(result).toEqual(mockLists);
  });
});
