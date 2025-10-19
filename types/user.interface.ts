export interface IUser {
  uuid: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export enum Roles {
  ADMIN = 'ADMIN',
  USER = 'USER',
  LIBRARIAN = 'LIBRARIAN'
}
export interface MyUser {
  id: number;

  createdAt: string;

  telegramId: number;
  telegramUsername: string;

  paymentGenerationCount: number;
  freeGenerationCount: number;
  language: string;
}

export interface UserMoreInfo {
  id: number;

  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;

  discountId: number;

  freeGenerationCount: number;
  paymentGenerationCount: number;

  generations: any[];

  language: string;

  telegramFullName: string;
  telegramId: number;
  telegramUsername: string;

  payments: any[];
  usersSettings: any[];
  selectedVials: any[];
  usersUsePromocodes: any[];
}

export interface GetMyUsers {
  users: MyUser[];

  totalUsers: number;
  pageCount: number;
}
