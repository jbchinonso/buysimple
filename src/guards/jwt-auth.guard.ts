import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException(
        'You are not Authorized to use this system',
      );
    }

    const decodedToken = this.jwtService.verify(token);

    if (!decodedToken) {
      throw new UnauthorizedException(
        'You are not Authorized to use this system',
      );
    }

    const appUser = {
      userId: decodedToken.id,
      role: decodedToken.role,
    };

    request.user = appUser;

    return true;
  }
}
