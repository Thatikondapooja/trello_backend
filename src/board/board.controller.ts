import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/JwtAuthGuard";
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
      const userId = req.user.userId; // 👈 comes from JwtStrategy
      console.log("userId", userId)
      return this.boardService.createBoard(body, userId);
   }

   /* GET USER BOARDS */
   @Get("getboards")
   getBoards(@Req() req: any) {
      const userId = req.user.userId;
      return this.boardService.getBoards(userId);
   }
}
