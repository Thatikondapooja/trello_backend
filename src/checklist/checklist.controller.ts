import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { ChecklistService } from "./checklist.service";
import { JwtAuthGuard } from "src/auth/JwtAuthGuard";
import { CreateChecklistDto } from "./checklistDto";

@Controller("cards/:cardId/checklists")
@UseGuards(JwtAuthGuard)
export class ChecklistController {
    constructor(private checklistService: ChecklistService) { }

    @Post()
    createChecklist(
        @Param("cardId") cardId: number,
        @Body() dto: CreateChecklistDto,
    ) {
        return this.checklistService.createChecklist(cardId, dto.title);
    }
}
