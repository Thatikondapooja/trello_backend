import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from './card.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './card.entity';
import { List } from '../list/list.entity';
import { User } from '../user/user.entity';
import { ActivityService } from '../activity/activity.service';
import { NotFoundException } from '@nestjs/common';

describe('CardsService', () => {
  let service: CardsService;
  let cardRepo: jest.Mocked<Repository<Card>>;
  let listRepo: jest.Mocked<Repository<List>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let activityService: jest.Mocked<ActivityService>;

  const mockCardRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockListRepo = {
    findOne: jest.fn(),
  };

  const mockUserRepo = {
    findOne: jest.fn(),
  };

  const mockActivityService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: getRepositoryToken(Card), useValue: mockCardRepo },
        { provide: getRepositoryToken(List), useValue: mockListRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: ActivityService, useValue: mockActivityService },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
    cardRepo = module.get(getRepositoryToken(Card));
    listRepo = module.get(getRepositoryToken(List));
    userRepo = module.get(getRepositoryToken(User));
    activityService = module.get(ActivityService);
  });

  afterEach(() => jest.clearAllMocks());

  /* ================= CREATE CARD ================= */

  it('should create card successfully', async () => {
    const dto = { title: 'Card 1', listId: 1 };
    const user = { id: 10 };

    const mockList = {
      id: 1,
      title: 'List A',
      cards: [],
      board: {},
    };

    const savedCard = { id: 100, title: 'Card 1' };

    listRepo.findOne.mockResolvedValue(mockList as any);
    cardRepo.create.mockReturnValue(savedCard as any);
    cardRepo.save.mockResolvedValue(savedCard as any);

    const result = await service.createCard(dto as any, user as any);

    expect(result).toEqual(savedCard);
    expect(activityService.log).toHaveBeenCalled();
  });

  it('should throw if list not found', async () => {
    listRepo.findOne.mockResolvedValue(null);

    await expect(
      service.createCard({ listId: 1 } as any, {} as any),
    ).rejects.toThrow(NotFoundException);
  });

  /* ================= MOVE CARD ================= */

  it('should move card successfully', async () => {
    const card = {
      id: 1,
      title: 'Card',
      list: { title: 'Old', board: {} },
    };

    const newList = { id: 2, title: 'New', board: {} };

    cardRepo.findOne.mockResolvedValue(card as any);
    listRepo.findOne.mockResolvedValue(newList as any);
    cardRepo.save.mockResolvedValue(card as any);

    const result = await service.moveCard(1, 2, {} as any);

    expect(result).toEqual(card);
    expect(activityService.log).toHaveBeenCalled();
  });

  /* ================= GET CARDS BY LIST ================= */

  it('should return checklist summary', async () => {
    const cards = [
      {
        id: 1,
        checklists: [
          {
            items: [{ isCompleted: true }, { isCompleted: false }],
          },
        ],
      },
    ];

    cardRepo.find.mockResolvedValue(cards as any);

    const result = await service.getCardsByList(1);

    expect(result[0].checklistSummary).toEqual({
      completed: 1,
      total: 2,
    });
  });

  /* ================= GET ALL CARDS ================= */

  it('should return all cards', async () => {
    cardRepo.find.mockResolvedValue([{ id: 1 }] as any);

    const result = await service.getAllCards();

    expect(result).toEqual([{ id: 1 }]);
  });

  /* ================= REORDER ================= */

  it('should reorder cards', async () => {
    cardRepo.update.mockResolvedValue({} as any);

    const dto = { listId: 1, orderedCardIds: [5, 6, 7] };

    const result = await service.reorderCards(dto as any);

    expect(cardRepo.update).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ success: true });
  });

  /* ================= GET CARD BY ID ================= */

  it('should return card by id', async () => {
    cardRepo.findOne.mockResolvedValue({ id: 1 } as any);

    const result = await service.getCardById(1);

    expect(result).toEqual({ id: 1 });
  });

  it('should throw if card not found', async () => {
    cardRepo.findOne.mockResolvedValue(null);

    await expect(service.getCardById(1)).rejects.toThrow(NotFoundException);
  });

  /* ================= UPDATE CARD ================= */

  it('should update card successfully', async () => {
    const card = { id: 1 };

    cardRepo.findOne.mockResolvedValue(card as any);
    cardRepo.save.mockResolvedValue({ id: 1, title: 'Updated' } as any);

    const result = await service.updateCard(
      1,
      { title: 'Updated' } as any,
      {} as any,
    );

    expect(result.title).toBe('Updated');
  });

  /* ================= TOGGLE COMPLETE ================= */

  it('should toggle complete', async () => {
    const card = { id: 1, isCompleted: false };

    cardRepo.findOne.mockResolvedValue(card as any);
    cardRepo.save.mockResolvedValue({ ...card, isCompleted: true } as any);

    const result = await service.toggleComplete(1);

    expect(result.isCompleted).toBe(true);
  });

  /* ================= ADD MEMBER ================= */

  it('should add member to card', async () => {
    const card = { members: [] };
    const user = { id: 5 };

    cardRepo.findOne.mockResolvedValue(card as any);
    userRepo.findOne.mockResolvedValue(user as any);
    cardRepo.save.mockResolvedValue(card as any);

    const result = await service.addMemberToCard(1, 5);

    expect(card.members.length).toBe(1);
  });

  /* ================= ARCHIVE / RESTORE ================= */

  it('should archive card', async () => {
    await service.archiveCard(1);

    expect(cardRepo.update).toHaveBeenCalledWith(1, { isArchived: true });
  });

  it('should restore card', async () => {
    await service.restoreCard(1);

    expect(cardRepo.update).toHaveBeenCalledWith(1, { isArchived: false });
  });

  /* ================= ACTIVE / ARCHIVED ================= */

  it('should get active cards', async () => {
    cardRepo.find.mockResolvedValue([{ id: 1 }] as any);

    const result = await service.getActiveCards(1);

    expect(result).toEqual([{ id: 1 }]);
  });

  it('should get archived cards', async () => {
    cardRepo.find.mockResolvedValue([{ id: 2 }] as any);

    const result = await service.getArchivedCards(1);

    expect(result).toEqual([{ id: 2 }]);
  });
});
