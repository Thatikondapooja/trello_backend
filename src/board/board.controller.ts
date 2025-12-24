import { Body, Controller, Get, Injectable, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/JwtAuthGuard';
import { BoardService } from './board.service';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardController {
   constructor(private boardservice:BoardService){}


   @Post()
   createBoard(@Body("title") title:string,@Req() req:any){
      const userId=req.user.id;
      console.log("User ID:", userId);
       console.log("req.user :", req.user);
      return this.boardservice.createBoard(title,userId);
   }

   @Get()
   getBoards(@Req() req:any){
    const userId=req.user.userId
    return this.boardservice.getBoards(userId);
   }
}
