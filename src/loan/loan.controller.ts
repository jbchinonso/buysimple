import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { LoanService } from './loan.service';
import { Roles } from 'src/decorators/index.decorator';
import { UserRequest } from 'src/interfaces';

@Controller('loans')
export class LoanController {
  constructor(private loanService: LoanService) {}

  @Get()
  getAllLoans(@Query('status') status: string, @Req() req: UserRequest) {
    const userRole = req.user.role;
    return this.loanService.getAllLoans(status, userRole);
  }

  @Get('expired')
  getExpiredLoans(@Req() req: UserRequest) {
    const userRole = req.user.role;
    return this.loanService.getExpiredLoans(userRole);
  }

  @Get(':userEmail/get')
  getUserLoans(@Param('userEmail') userEmail: string, @Req() req: UserRequest) {
    const userRole = req.user.role;
    return this.loanService.getUserLoans(userEmail, userRole);
  }

  @Delete(':loanId/delete')
  @Roles('superadmin')
  @HttpCode(HttpStatus.OK)
  deleteLoan(@Param('loanId') loanId: string) {
    return this.loanService.deleteLoan(loanId);
  }
}
