import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import config from '../../../config';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal.component';
import { firstValueFrom } from 'rxjs';
import type { Food, Taste, FoodSize } from '../../interface/food';
import type { MessageResponse } from '../../interface/message';
import type { SaleTemp, SaleTempDetail } from '../../interface/sale';
import { ErrorHandlerService } from '../../error/error-handler.service';

interface FoodResponse {
  results: Food[];
}

interface SaleTempResponse {
  results: SaleTemp[];
}

interface SaleTempDetailResponse {
  results: SaleTempDetail[];
}

interface SaleTempResponseOptional {
  message: string;
  results: SaleTemp;
}

interface Optional {
  FoodSize: FoodSize[];
  Taste: Taste[];
}

interface OptionalResponse {
  results: Optional;
}

@Component({
  selector: 'app-sale',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css',
})
export class SaleComponent {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  foods: Food[] = [];
  tastes: Taste[] = [];
  foodSizes: FoodSize[] = [];

  foodTarget: Food | null = null;

  serverPath: string = '';
  tableNo: number = 1;
  userId: number = 0;

  saleTempDetail: SaleTempDetail[] = [];

  saleTemps: SaleTemp[] = [];

  amount: number = 0;

  foodName: string = '';

  payType: string = 'cash';

  inputMoney: number = 0;
  returnMoney: number = 0;

  billForPayUrl: string = '';

  ngOnInit() {
    this.fetchDataFood();

    this.serverPath = config.apiPath;

    const userId = localStorage.getItem('id');
    if (userId !== null) {
      this.userId = parseInt(userId);
      this.fetchDataSaleTemp();
    }
  }

  fetchDataFood() {
    this.http.get<FoodResponse>(config.apiPath + '/api/food').subscribe({
      next: (response: FoodResponse) => {
        const data = response.results;
        this.foods = this.dataFilter(data);
      },
      error: (error) => {
        this.errorHandler.handleError(error);
      },
    });
  }

  fetchDataSaleTemp() {
    this.http
      .get<SaleTempResponse>(config.apiPath + '/api/saleTemp/' + this.userId)
      .subscribe({
        next: (res: SaleTempResponse) => {
          this.saleTemps = res.results;
          this.computeAmount();
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
      });
  }

  fetchOptional(foodTypeId: number) {
    this.http
      .get<OptionalResponse>(config.apiPath + '/api/optional/' + foodTypeId)
      .subscribe({
        next: (response: OptionalResponse) => {
          this.foodSizes = response.results.FoodSize;
          this.tastes = response.results.Taste;
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
      });
  }

  fetchDataSaleTempDetailById(id: number) {
    this.http
      .get<SaleTempDetailResponse>(config.apiPath + '/api/saleTempDetail/' + id)
      .subscribe({
        next: (response: SaleTempDetailResponse) => {
          this.saleTempDetail = response.results;
          if (this.saleTempDetail.length == 0) {
            document.getElementById('modalFoodSize_btnClose')?.click();
          }
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
      });
  }

  saveSaleTemp(item: Food | null) {
    if (item !== null) {
      const payload = {
        foodId: item.id,
        qty: 1,
        tableNo: this.tableNo,
        userId: this.userId,
      };

      this.http
        .post<SaleTempResponseOptional>(
          config.apiPath + '/api/saleTemp',
          payload
        )
        .subscribe({
          next: (response: SaleTempResponseOptional) => {
            if (response.message == 'success') {
              this.fetchDataSaleTemp();
              this.fetchOptional(item.foodTypeId);
              this.chooseFoodOption(response.results);
              this.foodTarget = response.results.Food;
              this.fetchDataSaleTemp();
            }
          },
          error: (error) => {
            this.errorHandler.handleError(error);
          },
        });
    }
  }

  chooseFoodOption(item: SaleTemp) {
    this.foodName = item.Food.name;

    const payload = {
      foodId: item.foodId,
      saleTempId: item.id,
    };

    this.http
      .post<MessageResponse>(config.apiPath + '/api/saleTempDetail', payload)
      .subscribe({
        next: (response: MessageResponse) => {
          if (response.message == 'success') {
            this.fetchDataSaleTempDetailById(item.id);
          }
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
      });
  }

  openModalOption(item: SaleTemp) {
    this.fetchDataSaleTempDetailById(item.id);
    this.fetchOptional(item.Food.foodTypeId);
    this.foodTarget = item.Food;
    this.foodName = item.Food.name;
  }

  async clearAllSaleTemp() {
    const button = await Swal.fire({
      title: 'ล้างรายการอาหาร',
      text: 'ยืนยันล้างรายการอาหารทั้งหมดใช่ไหรือไม่ ??',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
    });

    if (button.isConfirmed) {
      this.http
        .delete<MessageResponse>(
          config.apiPath + '/api/saleTemp/' + this.userId
        )
        .subscribe({
          next: (response: MessageResponse) => {
            if (response.message == 'success') {
              this.fetchDataSaleTemp();
            }
          },
          error: (error) => {
            this.errorHandler.handleError(error);
          },
        });
    }
  }

  async removeItem(item: SaleTemp) {
    const button = await Swal.fire({
      title: 'ลบรายการแาหาร',
      text: `คุณต้องการลบรายการ ${item.Food.name} ใช่หรือไม่`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
    });

    if (button.isConfirmed) {
      this.http
        .delete<MessageResponse>(
          config.apiPath + '/api/saleTemp/' + item.foodId + '/' + this.userId
        )
        .subscribe({
          next: (response: MessageResponse) => {
            if (response.message == 'success') {
              this.fetchDataSaleTemp();
            }
          },
          error: (error) => {
            this.errorHandler.handleError(error);
          },
        });
    }
  }

  selectedFoodOption(
    item: SaleTempDetail,
    choose: number,
    target: string,
    selected: string
  ) {
    const payload = {
      id: item.id,
      choose: choose,
      selected: selected,
    };

    if (target == 'Taste') {
      this.http
        .put<MessageResponse>(
          config.apiPath + '/api/saleTempDetail/taste',
          payload
        )
        .subscribe({
          next: (response: MessageResponse) => {
            if (response.message == 'success') {
              this.fetchDataSaleTempDetailById(item.saleTempId);
              this.fetchDataSaleTemp();
            }
          },
          error: (error) => {
            this.errorHandler.handleError(error);
          },
        });
    }

    if (target == 'Size') {
      this.http
        .put<MessageResponse>(
          config.apiPath + '/api/saleTempDetail/foodSize',
          payload
        )
        .subscribe({
          next: (response: MessageResponse) => {
            if (response.message) {
              this.fetchDataSaleTempDetailById(item.saleTempId);
              this.fetchDataSaleTemp();
            }
          },
          error: (error) => {
            this.errorHandler.handleError(error);
          },
        });
    }
  }

  async removeSaleTempDetail(item: SaleTempDetail) {
    const button = await Swal.fire({
      title: 'ยกเลิกรายการ',
      text: `ยืนยันยกเลิกรายการ ${item.Food?.name} ใช่หรือไม่`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
    });

    const payload = {
      id: item.id,
      saleTempId: item.saleTempId,
      qty: item.qty,
    };

    if (button.isConfirmed) {
      this.http
        .put<MessageResponse>(
          config.apiPath + '/api/saleTemp/removeSaleTempDetail',
          payload
        )
        .subscribe({
          next: (response: MessageResponse) => {
            if (response.message == 'success') {
              this.fetchDataSaleTempDetailById(item.saleTempId);
              this.fetchDataSaleTemp();
            }
          },
          error: (error) => {
            this.errorHandler.handleError(error);
          },
        });
    }
  }

  computeAmount() {
    this.amount = 0;

    for (let i = 0; i < this.saleTemps.length; i++) {
      const item = this.saleTemps[i];
      const totalPerRow = item.qty * item.price;

      for (let j = 0; j < item.SaleTempDetail.length; j++) {
        this.amount +=
          item.SaleTempDetail[j].addMoney * item.SaleTempDetail[j].qty;
      }
      this.amount += totalPerRow;
    }
  }

  filterFood() {
    this.filter('food');
  }
  filterDrink() {
    this.filter('drink');
  }
  filterSnack() {
    this.filter('snack');
  }
  filterRice() {
    this.filter('rice');
  }
  filterAll() {
    this.fetchDataFood();
  }

  filter(foodType: string) {
    try {
      this.http
        .get(config.apiPath + '/api/food/' + foodType)
        .subscribe((res: any) => {
          this.foods = res.results;
        });
    } catch (e: any) {
      Swal.fire({
        title: 'error',
        text: e.message,
        icon: 'error',
      });
    }
  }

  selectedPayType(payType: string) {
    this.payType = payType;
  }

  getClassName(payType: string) {
    let cssClass = 'btn btn-block btn-lg';

    if (this.payType == payType) {
      cssClass += ' btn-secondary';
    } else {
      cssClass += ' btn-outline-secondary';
    }

    return cssClass;
  }

  getClassNameOfButton(inputMoney: number) {
    let cssClass = 'btn btn-block btn-lg';

    if (this.inputMoney == inputMoney) {
      cssClass += ' btn-secondary';
    } else {
      cssClass += ' btn-outline-secondary';
    }

    return cssClass;
  }

  changeInputMoney(inputMoney: number) {
    this.inputMoney = inputMoney;
    this.returnMoney = this.inputMoney - this.amount;
  }

  async endSale() {
    const payload = {
      userId: this.userId,
      inputMoney: this.inputMoney,
      amount: this.amount,
      returnMoney: this.returnMoney,
      payType: this.payType,
      tableNo: this.tableNo,
    };

    this.http
      .post<MessageResponse>(config.apiPath + '/api/billSale', payload)
      .subscribe({
        next: (res: MessageResponse) => {
          Swal.fire({
            title: 'จบการขาย',
            text: 'การขายสำเร็จ',
            icon: 'success',
            timer: 2000,
          });

          this.fetchDataSaleTemp();
          document.getElementById('modalEndSale_btnClose')?.click();
          this.clearForm();

          const btnPrintBill = document.getElementById(
            'btnPrintBill'
          ) as HTMLButtonElement;
          btnPrintBill.click();

          this.printBillAfterPay();
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
      });
  }

  clearForm() {
    this.payType = 'cash';
    this.inputMoney = 0;
    this.returnMoney = 0;
    this.amount = 0;
  }

  async printBillBeforePay() {
    try {
      const payload = {
        userId: this.userId,
        tableNo: this.tableNo,
      };

      const url = config.apiPath + '/api/saleTemp/printBillBeforePay';
      const res: any = await firstValueFrom(this.http.post(url, payload));

      setTimeout(() => {
        this.billForPayUrl = config.apiPath + '/' + res.fileName;
        document
          .getElementById('pdf-frame')
          ?.setAttribute('src', this.billForPayUrl);
      }, 1000);
    } catch (e: any) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
      });
    }
  }

  async printBillAfterPay() {
    try {
      const payload = {
        userId: this.userId,
        tableNo: this.tableNo,
      };

      const url = config.apiPath + '/api/saleTemp/printBillAfterPay';
      const res: any = await firstValueFrom(this.http.post(url, payload));

      setTimeout(() => {
        const iframe = document.getElementById(
          'pdf-frame'
        ) as HTMLIFrameElement;
        iframe?.setAttribute('src', config.apiPath + '/' + res.fileName);
      }, 1000);
    } catch (e: any) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
      });
    }
  }

  updateQty(item: SaleTempDetail, condition: string) {
    const payload = {
      id: item.id,
      condition: condition,
    };

    this.http
      .put<MessageResponse>(config.apiPath + '/api/saleTemp/updateQty', payload)
      .subscribe({
        next: (response: MessageResponse) => {
          if (response.message == 'success') {
            this.fetchDataSaleTempDetailById(item.saleTempId);
            this.fetchDataSaleTemp();
          }
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
      });
  }

  dataFilter(data: Food[]) {
    const filterFood = data.filter((items) => items.foodType == 'food');
    const filterRice = data.filter((items) => items.foodType == 'rice');
    const filterSnack = data.filter((items) => items.foodType == 'snack');
    const filterDrink = data.filter((items) => items.foodType == 'drink');

    const results = [
      ...filterFood,
      ...filterRice,
      ...filterSnack,
      ...filterDrink,
    ];

    return results;
  }

  preventDecimalInput(event: KeyboardEvent) {
    let value = this.inputMoney;
    const key = event.key;

    if (key === '.' || key === '-' || key === '+') {
      event.preventDefault();
    }

    if (value == 0 && parseInt(key) >= 0) {
      event.preventDefault();
      this.inputMoney = parseInt(key);
    }
  }
}
