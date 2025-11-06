import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dtos';
import { Public } from 'src/decorators/index.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request) {
    const token = ((req.headers['authorization'] as string) || '').replace(
      'Bearer ',
      '',
    );
    return this.authService.logout(token);
  }
}
