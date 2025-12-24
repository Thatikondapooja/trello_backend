import {
    Controller,
    Post,
    Get,
    Patch,
    Body,
    Param,
    UseGuards,
    Req,
} from "@nestjs/common";
import { CardsService } from "./card.service";
import { JwtAuthGuard } from "src/auth/JwtAuthGuard";

@Controller()
@UseGuards(JwtAuthGuard)
export class CardsController {
    constructor(private cardsService: CardsService) { }

    // POST /cards
    @Post("cards")
    createCard(
        @Body("title") title: string,
        @Body("listId") listId: string,
        @Req() req: any,
    ) {
        return this.cardsService.createCard(title, listId,req.user);
    }

    // GET /lists/:listId/cards
    @Get("lists/:listId/cards")
    getCards(@Param("listId") listId: string) {
        return this.cardsService.getCardsByList(listId);
    }

    // PATCH /cards/:cardId/move
    @Patch("cards/:cardId/move")
    moveCard(
        @Param("cardId") cardId: string,
        @Body("toListId") toListId: string,
        @Req() req: any,
    ) {
        return this.cardsService.moveCard(cardId, toListId,req.user);
    }

    // GET /cards
    @Get()
    getAllCards() {
        return this.cardsService.getAllCards();
    }
}
