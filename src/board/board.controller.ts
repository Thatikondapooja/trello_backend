import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/JwtAuthGuard";
import { BoardService } from "./board.service";
import { CreateBoardDto } from "./createBoardDto";

@Controller("boards")
@UseGuards(JwtAuthGuard)
export class BoardController {
   constructor(private readonly boardService: BoardService) { }

   /* CREATE BOARD */
   @Post()
   createBoard(
      @Body() body: CreateBoardDto,
      @Req() req: any
   ) {
      // const userId = req.user; // 👈 comes from JwtStrategy
      console.log("req.user from controller", req.user.userId)
      return this.boardService.createBoard(body, req.user.userId);
   }

   /* GET USER BOARDS */
   @Get("getboards")
   getBoards(@Req() req: any) {
      const userId = req.user.userId;
      return this.boardService.getBoards(userId);
   }

   @Get(":boardId/members")
   getBoardMembers(@Param("boardId") boardId: number) {
      return this.boardService.getBoardMembers(boardId);
   }

}
