import type { Food, Taste, FoodSize } from './food';

export interface SaleTemp {
  id: number;
  foodId: number;
  qty: number;
  price: number;
  tableNo: number;
  userId: number;
  addMoney: any;
  tasteId: any;
  Food: Food;
  SaleTempDetail: SaleTempDetail[];
}

export interface SaleTempDetail {
  id: number;
  saleTempId: number;
  qty: number;
  addMoney: any;
  foodSizeId: any;
  tasteId: any;
  foodId: number;
  remark: any;
  Food?: Food;
  Taste?: Taste;
  FoodSize?: FoodSize;
}
