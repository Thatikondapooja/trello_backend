import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/JwtAuthGuard";
import { CardsService } from "./card.service";
import { CreateCardDto } from "./CardDto";
import { MoveCardDto } from "./MoveDto";
import { ReorderCardDto } from "./reorder-card.dto";
import { UpdateCardDto } from "./updateCard";

@Controller("cards")
@UseGuards(JwtAuthGuard)
export class CardsController {
 
    constructor(private cardsService: CardsService) { }

    // POST /cards
    @Post()
    createCard(@Body() dto: CreateCardDto, @Req() req) {
        return this.cardsService.createCard(dto, req.user);
    }

    // GET /cards/list/:listId
    @Get("list/:listId")
    getCards(@Param("listId") listId: number) {
        return this.cardsService.getCardsByList((listId));
    }

    // PATCH /cards/:cardId/move
    @Patch(":cardId/move")
    moveCard(
        @Param("cardId") cardId: number,
        @Body() dto: MoveCardDto,
        @Req() req,
    ) {
        return this.cardsService.moveCard(
            (cardId),
            dto.toListId,
            req.user,
        );
    }

    // GET /cards
    @Get()
    getAllCards() {
        return this.cardsService.getAllCards();
    }
    @Patch("reorder")
    reorderCards(@Body() dto: ReorderCardDto) {
        return this.cardsService.reorderCards(dto);
    }

    @Get(":id")
    getCard(@Param("id") id:number){
        return this.cardsService.getCardById(id)
    }

   // PATCH /cards/:id
@Patch(":id")
updateCard(
  @Param("id") id: number,
  @Body() dto: UpdateCardDto,
  @Req() req,
) {
  return this.cardsService.updateCard(id, dto, req.user);
}

}
