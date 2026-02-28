import { Test, TestingModule } from '@nestjs/testing';
import { CardsController } from './card.controller';
import { CardsService } from './card.service';

describe('CardsController', () => {
  let controller: CardsController;
  let service: jest.Mocked<CardsService>;

  const mockCardsService = {
    createCard: jest.fn(),
    getCardsByList: jest.fn(),
    moveCard: jest.fn(),
    getAllCards: jest.fn(),
    reorderCards: jest.fn(),
    getCardById: jest.fn(),
    updateCard: jest.fn(),
    toggleComplete: jest.fn(),
    addMemberToCard: jest.fn(),
    archiveCard: jest.fn(),
    restoreCard: jest.fn(),
    getArchivedCards: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
      providers: [
        { provide: CardsService, useValue: mockCardsService },
      ],
    }).compile();

    controller = module.get<CardsController>(CardsController);
    service = module.get(CardsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should create card', async () => {
  const dto = { title: 'Test Card', listId: 1 };
  const mockReq = { user: { userId: 10 } };

  mockCardsService.createCard.mockResolvedValue({ id: 1 });

  const result = await controller.createCard(dto as any, mockReq as any);

  expect(service.createCard).toHaveBeenCalledWith(
    dto,
    { ...mockReq.user, id: mockReq.user.userId }
  );

  expect(result).toEqual({ id: 1 });
});
it('should return cards by list', async () => {
  mockCardsService.getCardsByList.mockResolvedValue([{ id: 1 }]);

  const result = await controller.getCards(1);

  expect(service.getCardsByList).toHaveBeenCalledWith(1);
  expect(result).toEqual([{ id: 1 }]);
});
it('should move card', async () => {
  const dto = { toListId: 5 };
  const mockReq = { user: { userId: 10 } };

  mockCardsService.moveCard.mockResolvedValue({ success: true });

  const result = await controller.moveCard(
    1,
    dto as any,
    mockReq as any,
  );

  expect(service.moveCard).toHaveBeenCalledWith(
    1,
    dto.toListId,
    { ...mockReq.user, id: mockReq.user.userId },
  );

  expect(result).toEqual({ success: true });
});
it('should return all cards', async () => {
  mockCardsService.getAllCards.mockResolvedValue([{ id: 1 }]);

  const result = await controller.getAllCards();

  expect(service.getAllCards).toHaveBeenCalled();
  expect(result).toEqual([{ id: 1 }]);
});
it('should reorder cards', async () => {
  const dto = { cardOrders: [] };

  mockCardsService.reorderCards.mockResolvedValue({ success: true });

  const result = await controller.reorderCards(dto as any);

  expect(service.reorderCards).toHaveBeenCalledWith(dto);
  expect(result).toEqual({ success: true });
});
it('should get card by id', async () => {
  mockCardsService.getCardById.mockResolvedValue({ id: 1 });

  const result = await controller.getCard(1);

  expect(service.getCardById).toHaveBeenCalledWith(1);
  expect(result).toEqual({ id: 1 });
});
it('should update card', async () => {
  const dto = { title: 'Updated' };
  const mockReq = { user: { userId: 10 } };

  mockCardsService.updateCard.mockResolvedValue({ id: 1 });

  const result = await controller.updateCard(
    1,
    dto as any,
    mockReq as any,
  );

  expect(service.updateCard).toHaveBeenCalledWith(
    1,
    dto,
    { ...mockReq.user, id: mockReq.user.userId },
  );

  expect(result).toEqual({ id: 1 });
});
it('should toggle complete', async () => {
  mockCardsService.toggleComplete.mockResolvedValue({ id: 1 });

  const result = await controller.toggleComplete(1);

  expect(service.toggleComplete).toHaveBeenCalledWith(1);
  expect(result).toEqual({ id: 1 });
});
it('should add member to card', async () => {
  mockCardsService.addMemberToCard.mockResolvedValue({ success: true });

  const result = await controller.addMember('1', 5);

  expect(service.addMemberToCard).toHaveBeenCalledWith(1, 5);
  expect(result).toEqual({ success: true });
});
it('should archive card', async () => {
  mockCardsService.archiveCard.mockResolvedValue({ archived: true });

  const result = await controller.archive(1);

  expect(service.archiveCard).toHaveBeenCalledWith(1);
  expect(result).toEqual({ archived: true });
});

it('should restore card', async () => {
  mockCardsService.restoreCard.mockResolvedValue({ restored: true });

  const result = await controller.restore(1);

  expect(service.restoreCard).toHaveBeenCalledWith(1);
  expect(result).toEqual({ restored: true });
});
it('should get archived cards', async () => {
  mockCardsService.getArchivedCards.mockResolvedValue([{ id: 1 }]);

  const result = await controller.getArchived(1);

  expect(service.getArchivedCards).toHaveBeenCalledWith(1);
  expect(result).toEqual([{ id: 1 }]);
});

});