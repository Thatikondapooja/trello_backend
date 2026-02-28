import { Test, TestingModule } from '@nestjs/testing';
import { ChecklistService } from './checklist.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checklist } from './checklist.entity';
import { ChecklistItem } from './checklist-item.entity';
import { Card } from '../card/card.entity';
import { NotFoundException } from '@nestjs/common';

describe('ChecklistService', () => {
  let service: ChecklistService;
  let checklistRepo: jest.Mocked<Repository<Checklist>>;
  let itemRepo: jest.Mocked<Repository<ChecklistItem>>;
  let cardRepo: jest.Mocked<Repository<Card>>;

  const mockChecklistRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockItemRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockCardRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChecklistService,
        { provide: getRepositoryToken(Checklist), useValue: mockChecklistRepo },
        { provide: getRepositoryToken(ChecklistItem), useValue: mockItemRepo },
        { provide: getRepositoryToken(Card), useValue: mockCardRepo },
      ],
    }).compile();

    service = module.get<ChecklistService>(ChecklistService);
    checklistRepo = module.get(getRepositoryToken(Checklist));
    itemRepo = module.get(getRepositoryToken(ChecklistItem));
    cardRepo = module.get(getRepositoryToken(Card));
  });

  afterEach(() => jest.clearAllMocks());

  /* ================= CREATE CHECKLIST ================= */

  it('should create checklist successfully', async () => {
    const mockCard = { id: 1 };
    const mockChecklist = { id: 10, title: 'Test Checklist', card: mockCard };

    cardRepo.findOne.mockResolvedValue(mockCard as any);
    checklistRepo.create.mockReturnValue(mockChecklist as any);
    checklistRepo.save.mockResolvedValue(mockChecklist as any);
    checklistRepo.findOne.mockResolvedValue(mockChecklist as any);

    const result = await service.createChecklist(1, 'Test Checklist');

    expect(cardRepo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(checklistRepo.create).toHaveBeenCalledWith({
      title: 'Test Checklist',
      card: mockCard,
    });

    expect(result).toEqual(mockChecklist);
  });

  it('should throw if card not found', async () => {
    cardRepo.findOne.mockResolvedValue(null);

    await expect(service.createChecklist(1, 'Test Checklist')).rejects.toThrow(
      NotFoundException,
    );
  });

  /* ================= ADD ITEM ================= */

  it('should add item successfully', async () => {
    const mockChecklist = { id: 5 };
    const mockItem = { id: 100, text: 'New Item' };

    checklistRepo.findOne.mockResolvedValue(mockChecklist as any);
    itemRepo.create.mockReturnValue(mockItem as any);
    itemRepo.save.mockResolvedValue(mockItem as any);

    const result = await service.addItem(5, 'New Item');

    expect(checklistRepo.findOne).toHaveBeenCalledWith({
      where: { id: 5 },
    });

    expect(itemRepo.create).toHaveBeenCalledWith({
      text: 'New Item',
      checklist: mockChecklist,
    });

    expect(result).toEqual(mockItem);
  });

  it('should throw if checklist not found while adding item', async () => {
    checklistRepo.findOne.mockResolvedValue(null);

    await expect(service.addItem(5, 'New Item')).rejects.toThrow(
      NotFoundException,
    );
  });

  /* ================= TOGGLE ITEM ================= */

  it('should toggle item successfully', async () => {
    const mockItem = { id: 1, isCompleted: false };

    itemRepo.findOne.mockResolvedValue(mockItem as any);
    itemRepo.save.mockResolvedValue({
      ...mockItem,
      isCompleted: true,
    } as any);

    const result = await service.toggleItem(1);

    expect(result.isCompleted).toBe(true);
  });

  it('should throw if item not found while toggling', async () => {
    itemRepo.findOne.mockResolvedValue(null);

    await expect(service.toggleItem(1)).rejects.toThrow(NotFoundException);
  });

  /* ================= DELETE CHECKLIST ================= */

  it('should delete checklist successfully', async () => {
    const mockChecklist = { id: 5 };

    checklistRepo.findOne.mockResolvedValue(mockChecklist as any);
    checklistRepo.remove.mockResolvedValue(mockChecklist as any);

    const result = await service.deleteChecklist(5);

    expect(checklistRepo.remove).toHaveBeenCalledWith(mockChecklist);
    expect(result).toEqual({ id: 5 });
  });

  it('should throw if checklist not found while deleting', async () => {
    checklistRepo.findOne.mockResolvedValue(null);

    await expect(service.deleteChecklist(5)).rejects.toThrow(NotFoundException);
  });
});
