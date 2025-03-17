import type { User } from './user';

export interface BillSale {
  id: number;
  createdDate: string;
  payDate: string;
  amount: number;
  payType: string;
  userId: number;
  inputMoney: number;
  returnMoney: number;
  tableNo: number;
  invoice: string;
  status: string;
  BillSaleDetail: BillSaleDetail[];
  User: User;
}

export interface BillSaleDetail {
  id: number;
  billSaleId: number;
  qty: number;
  addMoney: any;
  foodSizeId: any;
  tasteId: any;
  foodId: number;
  price: number;
}
