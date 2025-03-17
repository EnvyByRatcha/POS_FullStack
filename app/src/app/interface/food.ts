export interface Food {
  id: number;
  name: string;
  foodType: string;
  price: number;
  img: string;
  status: string;
  foodTypeId: number;
  FoodType: FoodType;
}

export interface Taste {
  id: number;
  name: string;
  status: string;
  foodTypeId: number;
  FoodType: FoodType;
}

export interface FoodSize {
  id: number;
  name: string;
  addMoney: number;
  status: string;
  foodTypeId: number;
  FoodType: FoodType;
}

export interface FoodType {
  id: number;
  name: string;
  status: string;
}
