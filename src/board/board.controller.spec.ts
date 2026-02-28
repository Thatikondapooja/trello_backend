import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from './board.controller';
import { Board } from './board.entity';
import { BoardService } from './board.service';

const mockBoardService={
  createBoard:jest.fn(),
  getBoards:jest.fn(),
  getBoardMembers:jest.fn(),

}
describe('BoardController', () => {
  let controller: BoardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers:[
        {provide:BoardService,useValue:mockBoardService},
      ]
    }).compile();

    controller = module.get<BoardController>(BoardController);
  });
   afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  it("should board created successfull",async()=>{
    const mockReq={
      user:{userId:1}
    }
    const createBoardDto={
  title:"Project A",
  description:"This is project A",
    }

      mockBoardService.createBoard.mockResolvedValue({
      message: 'Board created',
    });
    const results=await controller.createBoard(createBoardDto,mockReq);
    // expect(mockAuthService.register).toHaveBeenCalledWith(registerData.FullName, registerData.email, registerData.password);
        expect(mockBoardService.createBoard).toHaveBeenCalledWith(createBoardDto,mockReq.user.userId);

    expect(results).toEqual({ message: 'Board created' });
  })

  it("should return user boards",async()=>{
    const mockReq={
      user:{userId:1}
    }
      mockBoardService.getBoards.mockResolvedValue([
        {id:1,title:"Project A",description:"This is project A"},
        {id:2,title:"Project B",description:"This is project B"},
      ]);
    const results=await controller.getBoards(mockReq);
        expect(mockBoardService.getBoards).toHaveBeenCalledWith(mockReq.user.userId);
});

it("should return board members",async()=>{
  const boardId=1;
    mockBoardService.getBoardMembers.mockResolvedValue([
      {id:1,FullName:"John",email:"john@example.com"},
      {id:2,FullName:"Jane",email:"jane@example.com"},
    ]);
  const results=await controller.getBoardMembers(boardId);
  expect(mockBoardService.getBoardMembers).toHaveBeenCalledWith(boardId);
});
});