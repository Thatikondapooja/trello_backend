import { Test, TestingModule } from '@nestjs/testing';
import { ChecklistController } from './checklist.controller';
import { ChecklistService } from './checklist.service';

describe('ChecklistController', () => {
  let controller: ChecklistController;
  let service: jest.Mocked<ChecklistService>;

  const mockChecklistService = {
    createChecklist: jest.fn(),
    addItem: jest.fn(),
    toggleItem: jest.fn(),
    deleteChecklist: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChecklistController],
      providers: [
        {
          provide: ChecklistService,
          useValue: mockChecklistService,
        },
      ],
    }).compile();

    controller = module.get<ChecklistController>(ChecklistController);
    service = module.get(ChecklistService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /* ================= CREATE CHECKLIST ================= */

  it('should create checklist', async () => {
    const dto = { cardId: 1, title: 'Test Checklist' };

    mockChecklistService.createChecklist.mockResolvedValue({
      id: 10,
      title: 'Test Checklist',
    });

    const result = await controller.create(dto as any);

    expect(service.createChecklist).toHaveBeenCalledWith(1, 'Test Checklist');
    expect(result).toEqual({
      id: 10,
      title: 'Test Checklist',
    });
  });

  /* ================= ADD ITEM ================= */

  it('should add item to checklist', async () => {
    mockChecklistService.addItem.mockResolvedValue({
      id: 5,
      text: 'New Item',
    });

    const result = await controller.addItem('2', 'New Item');

    expect(service.addItem).toHaveBeenCalledWith(2, 'New Item');
    expect(result).toEqual({
      id: 5,
      text: 'New Item',
    });
  });

  /* ================= TOGGLE ITEM ================= */

  it('should toggle checklist item', async () => {
    mockChecklistService.toggleItem.mockResolvedValue({
      id: 3,
      isCompleted: true,
    });

    const result = await controller.toggleItem('3');

    expect(service.toggleItem).toHaveBeenCalledWith(3);
    expect(result).toEqual({
      id: 3,
      isCompleted: true,
    });
  });

  /* ================= DELETE CHECKLIST ================= */

  it('should delete checklist', async () => {
    mockChecklistService.deleteChecklist.mockResolvedValue({
      success: true,
    });

    const result = await controller.deleteChecklist('4');

    expect(service.deleteChecklist).toHaveBeenCalledWith(4);
    expect(result).toEqual({
      success: true,
    });
  });
});