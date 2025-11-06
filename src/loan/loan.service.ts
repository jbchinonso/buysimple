import { Injectable } from '@nestjs/common';
import * as loansData from '../../loans.json';
import { Loan } from '../interfaces/index';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class LoanService {
  private loans: Loan[] = loansData as Loan[];

  getAllLoans(
    status?: string,
    userRole?: string,
  ): { message: string; data: Loan[] } {
    let filteredLoans = [...this.loans];

    if (status) {
      filteredLoans = filteredLoans.filter((loan) => loan.status === status);
    }

    // Hide totalLoan for normal staff
    if (userRole === 'staff') {
      filteredLoans = filteredLoans.map((loan) => {
        const { totalLoan, ...filteredApplicant } = loan.applicant;
        return {
          ...loan,
          applicant: filteredApplicant,
        };
      });
    }

    return {
      message: 'loans Retrieved Successfully',
      data: filteredLoans,
    };
  }

  getUserLoans(
    userEmail: string,
    userRole: string,
  ): { message: string; loans: Partial<Loan>[] } {
    const userLoans = this.loans.filter(
      (loan) => loan.applicant.email === userEmail,
    );

    if (userRole === 'staff') {
      return {
        message: 'loans Retrieved Successfully',
        loans: userLoans.map((loan) => {
          const { totalLoan, ...filteredApplicant } = loan.applicant;
          return {
            ...loan,
            applicant: filteredApplicant,
          };
        }),
      };
    }

    return {
      message: 'loans Retrieved Successfully',
      loans: userLoans,
    };
  }

  getExpiredLoans(userRole: string): {
    expiredLoans: Partial<Loan>[];
    message: string;
  } {
    const now = new Date();
    const expiredLoans = this.loans.filter((loan) => {
      const maturityDate = new Date(loan.maturityDate);
      return maturityDate < now;
    });

    if (userRole === 'staff') {
      return {
        message: 'loans Retrieved Successfully',
        expiredLoans: expiredLoans.map((loan) => {
          const { totalLoan, ...filteredApplicant } = loan.applicant;
          return {
            ...loan,
            applicant: filteredApplicant,
          };
        }),
      };
    }

    return { expiredLoans, message: 'loans Retrieved Successfully' };
  }

  deleteLoan(loanId: string): { message: string } {
    const index = this.loans.findIndex((loan) => loan.id === loanId);

    if (index === -1) {
      throw new NotFoundException(`Loan with ID ${loanId} not found`);
    }

    this.loans.splice(index, 1);
    return { message: `Loan ${loanId} deleted successfully` };
  }
}
