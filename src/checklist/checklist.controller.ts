// checklist.controller.ts
import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";
import { ChecklistService } from "./checklist.service";
import { CreateChecklistDto } from "./create-checklist.dto";

@Controller("checklists")
export class ChecklistController {
    constructor(private checklistService: ChecklistService) { }

    @Post()
    create(@Body() dto: CreateChecklistDto) {
        return this.checklistService.createChecklist(
            Number(dto.cardId),
            dto.title
        );
    }

    // 🔥 THIS ROUTE
    @Post(":checklistId/items")
    addItem(
        @Param("checklistId") checklistId: string,
        @Body("text") text: string,
    ) {
        console.log("🔥 HIT ADD ITEM ROUTE", checklistId);
        return this.checklistService.addItem(Number(checklistId), text);
    }

    @Patch("items/:itemId/toggle")
    toggleItem(@Param("itemId") itemId: string) {
        return this.checklistService.toggleItem(Number(itemId));
    }

    @Delete(":id")
    deleteChecklist(@Param("id") id: string) {
        return this.checklistService.deleteChecklist(Number(id));
    }

}
