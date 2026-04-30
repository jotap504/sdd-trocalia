import {
  Controller, Get, Patch, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common'
import { IsString, IsIn } from 'class-validator'
import { AdminService } from './admin.service'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser, type JwtPayload } from '../common/decorators/current-user.decorator'

class UpdateRoleDto {
  @IsString()
  @IsIn(['user', 'verified_user', 'moderator', 'support', 'finance', 'partner', 'super_admin'])
  role!: string
}

@Controller('admin')
@Roles('super_admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardStats()
  }

  @Get('users')
  listUsers(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.adminService.listUsers(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    )
  }

  @Patch('users/:id/role')
  @HttpCode(HttpStatus.OK)
  updateRole(
    @Param('id') id: string,
    @CurrentUser() admin: JwtPayload,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.adminService.updateUserRole(id, dto.role, admin.sub)
  }

  @Patch('users/:id/suspend')
  @HttpCode(HttpStatus.OK)
  suspendUser(@Param('id') id: string, @CurrentUser() admin: JwtPayload) {
    return this.adminService.suspendUser(id, admin.sub)
  }

  @Get('listings/flagged')
  listFlagged(@Query('limit') limit?: string) {
    return this.adminService.listFlaggedListings(limit ? parseInt(limit, 10) : 50)
  }
}
