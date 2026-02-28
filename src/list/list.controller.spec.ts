import { Test, TestingModule } from '@nestjs/testing';
import { ListsController } from './list.controller';
import { ListsService } from './list.service';
import { JwtAuthGuard } from 'src/auth/JwtAuthGuard';

const mockListsService = {
  createList: jest.fn(),
  getListsByBoard: jest.fn(),
};
const createListDto = {
  title: 'Test List',
  boardId: 1,
};
const getListsByBoardId = 1;
describe('ListController', () => {
  let controller: ListsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListsController],
      providers: [
        { provide: ListsService, useValue: mockListsService },
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    }).compile();

    controller = module.get<ListsController>(ListsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create list successfully', async () => {
    const mockReq = {
      user: { userId: 1 },
    };

    mockListsService.createList.mockResolvedValue({
      id: 1,
      title: 'Test List',
      boardId: 1,
    });

    const result = await controller.createList(mockReq as any, createListDto);

    expect(mockListsService.createList).toHaveBeenCalledWith(
      createListDto,
      mockReq.user.userId,
    );

    expect(result).toEqual({
      id: 1,
      title: 'Test List',
      boardId: 1,
    });
  });

  it('should get lists by board ID', async () => {
    const mockLists = [
      { id: 1, title: 'List 1', boardId: getListsByBoardId },
      { id: 2, title: 'List 2', boardId: getListsByBoardId },
    ];
    mockListsService.getListsByBoard.mockResolvedValue(mockLists);
    const result = await controller.getLists(getListsByBoardId);
    expect(mockListsService.getListsByBoard).toHaveBeenCalledWith(
      getListsByBoardId,
    );
    expect(result).toEqual(mockLists);
  });
});
