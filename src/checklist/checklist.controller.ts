import { Body, Controller, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/JwtAuthGuard";
import { ChecklistService } from "./checklist.service";
import { CreateChecklistDto } from "./create-checklist.dto";
import { CreateChecklistItemDto } from "./create-checklist-item.dto";

@Controller("checklists")
@UseGuards(JwtAuthGuard)
export class ChecklistController {
    constructor(private checklistService: ChecklistService) { }

    @Post()
    create(@Body() dto: CreateChecklistDto) {
        return this.checklistService.createChecklist(dto);
    }

    @Post("item")
    addItem(@Body() dto: CreateChecklistItemDto) {
        return this.checklistService.addItem(dto);
    }

    @Patch("item/:id/toggle")
    toggle(@Param("id") id: number) {
        return this.checklistService.toggleItem(id);
    }
}
