import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ListsService } from "./list.service";
import { CreateListDto } from "./CreateListDto";
import { JwtAuthGuard } from "src/auth/JwtAuthGuard";

@Controller("lists")
@UseGuards(JwtAuthGuard)
export class ListsController {
    constructor(private listsService: ListsService) { }

    // POST /lists
    @Post()
    createList(@Req() req, @Body() dto: CreateListDto) {
        return this.listsService.createList(dto, req.user.userId);
    }

    // GET /boards/:boardId/lists
    @Get("boards/:boardId")
    getLists(@Param("boardId") boardId: number) {
        return this.listsService.getListsByBoard((boardId));
    }
}
