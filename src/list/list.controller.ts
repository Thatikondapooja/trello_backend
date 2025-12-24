import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    UseGuards,
    Req,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/JwtAuthGuard";
import { ListsService } from "./list.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class ListsController {
    constructor(private listsService: ListsService) { }

    // POST /lists
    @Post("lists")
    createList(
        @Body("title") title: string,
        @Body("boardId") boardId: string,
        @Req() req: any,
    ) {
        return this.listsService.createList(title,boardId,req.user);
    }

    // GET /boards/:boardId/lists
    @Get("boards/:boardId/lists")
    getLists(@Param("boardId") boardId: string) {
        return this.listsService.getListsByBoard(boardId);
    }
}
