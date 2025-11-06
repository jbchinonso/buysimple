export interface Loan {
  id: string;
  amount: string;
  maturityDate: string;
  status: string;
  applicant: {
    name: string;
    email: string;
    telephone: string;
    totalLoan?: string;
  };
  createdAt: string;
}

export type UserRequest = Request & {
  user: { userId: string; role: string };
};
