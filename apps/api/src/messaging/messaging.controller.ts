import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MessagingService } from './messaging.service';
import {
  CurrentUser,
  type JwtPayload,
} from '../common/decorators/current-user.decorator';
import { RateLimit } from '../common/decorators/rate-limit.decorator';
import { SendMessageDto } from './dto/send-message.dto';
import { StartConversationDto } from './dto/start-conversation.dto';
import { ListConversationsDto } from './dto/list-conversations.dto';
import { ListMessagesDto } from './dto/list-messages.dto';

@Controller()
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('conversations')
  getConversations(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListConversationsDto,
  ) {
    return this.messagingService.getConversations(
      user.sub,
      query.cursor,
      query.limit,
    );
  }

  @Get('conversations/unread-count')
  getUnreadCount(@CurrentUser() user: JwtPayload) {
    return this.messagingService.getUnreadCount(user.sub);
  }

  @Post('listings/:listingId/conversations')
  @HttpCode(HttpStatus.CREATED)
  @RateLimit({ ttl: 60, limit: 10, keyBy: 'user' })
  async startConversation(
    @Param('listingId') listingId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: StartConversationDto,
  ) {
    const conversation = await this.messagingService.findOrCreateConversation(
      user.sub,
      listingId,
    );
    const message = await this.messagingService.sendMessage(
      conversation.id,
      user.sub,
      dto.message,
    );
    return { conversation, message };
  }

  @Get('conversations/:id/messages')
  getMessages(
    @Param('id') conversationId: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: ListMessagesDto,
  ) {
    return this.messagingService.getMessages(
      conversationId,
      user.sub,
      query.cursor,
      query.limit,
    );
  }

  @Post('conversations/:id/messages')
  @HttpCode(HttpStatus.CREATED)
  @RateLimit({ ttl: 60, limit: 20, keyBy: 'user' })
  sendMessage(
    @Param('id') conversationId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(
      conversationId,
      user.sub,
      dto.content,
    );
  }

  @Patch('conversations/:id/read')
  @HttpCode(HttpStatus.OK)
  markRead(
    @Param('id') conversationId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.messagingService.markRead(conversationId, user.sub);
  }
}
