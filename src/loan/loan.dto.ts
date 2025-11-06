import { IsString } from 'class-validator';

export class LoanDto {
  @IsString()
  status: string;

  @IsString()
  userRole: string;
}
