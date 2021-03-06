import IDischarge from './IDischarge';

interface IUser {
  id: string;
  username: string;
  profile_id: string;
}

export default interface IPayment {
  id: string;
  method: 'creditCard' | 'debitCard' | 'cash' | 'check' | 'deposit' | 'slip';
  amount: number;
  discharged: boolean;
  debit_id: string;
  user_id: string;
  discharge_day?: Date;
  user: IUser;
  receipt?: string;
  receipt_url?: string;
  discharge: IDischarge;
}
