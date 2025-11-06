import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as usersDB from '../../staffs.json';

import { LoginDto } from './auth.dtos';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  private blacklistedTokens: Set<string> = new Set();
  login(payload: LoginDto) {
    try {
      const { email, password } = payload;

      const user = usersDB.find(
        (user) => user.email === email && user.password === password,
      );

      if (!user) {
        throw new BadRequestException('User does not exist');
      }

      const accessToken = this.jwtService.sign({
        userId: user.id,
        role: user.role,
      });

      return {
        token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          Name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  logout(token: string) {
    try {
      if (!token) {
        throw new BadRequestException('No token provided');
      }

      this.blacklistedTokens.add(token);

      return {
        status: 'success',
        message: 'Logout successful',
      };
    } catch (error) {
      throw error;
    }
  }
}
