import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal.component';
import config from '../../../config';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import type { FoodType, Food } from '../../interface/food';
import type { MessageResponse } from '../../interface/message';
import { ErrorHandlerService } from '../../error/error-handler.service';

interface FoodTypeResponse {
  results: FoodType[];
}

interface FoodResponse {
  results: Food[];
  total: number;
}

@Component({
  selector: 'app-food',
  standalone: true,
  imports: [
    FormsModule,
    ModalComponent,
    MatPaginatorModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './food.component.html',
  styleUrl: './food.component.css',
})
export class FoodComponent {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  foodForm: FormGroup = new FormGroup({
    id: new FormControl(0, [Validators.required]),
    name: new FormControl('', [Validators.required]),
    foodType: new FormControl('food', [Validators.required]),
    price: new FormControl(0, [Validators.required]),
    foodTypeId: new FormControl('', [Validators.required]),
  });
  isFormSubmmit: boolean = false;

  foods: Food[] = [];
  foodTypes: FoodType[] = [];

  fileName: string = '';
  file: File | undefined = undefined;
  serverPath: string = '';
  img: string = '';

  page: number = 1;
  pageSize: number = 10;
  total: number = 0;

  foodCategory = [
    {
      name: 'อาหาร',
      value: 'food',
    },
    {
      name: 'เครื่องดื่ม',
      value: 'drink',
    },
    {
      name: 'ข้าว',
      value: 'rice',
    },
    {
      name: 'ของกินเล่น',
      value: 'snack',
    },
  ];

  ngOnInit() {
    this.fetchDataFoodType();
    this.fetchDataFood();
    this.serverPath = config.apiPath;
  }

  fetchDataFoodType() {
    this.http
      .get<FoodTypeResponse>(config.apiPath + '/api/foodType')
      .subscribe({
        next: (response: FoodTypeResponse) => {
          this.foodTypes = response.results;
          this.foodForm.patchValue({
            foodTypeId: this.foodTypes[0].id,
          });
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
      });
  }

  fetchDataFood() {
    const payload = {
      page: this.page,
      pageSize: this.pageSize,
    };
    this.http
      .post<FoodResponse>(config.apiPath + '/api/food/paginate', payload, {
        headers: config.headers(),
      })
      .subscribe({
        next: (response: FoodResponse) => {
          this.foods = response.results;
          this.total = response.total;
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
      });
  }

  async save() {
    this.isFormSubmmit = true;
    if (this.foodForm.valid) {
      const fileName = await this.uploadFile();
      const formData = this.foodForm.value;
      const payload = {
        ...formData,
        img: fileName,
      };

      if (payload.id > 0) {
        this.http
          .put<MessageResponse>(config.apiPath + '/api/food', payload, {
            headers: config.headers(),
          })
          .subscribe({
            next: (response: MessageResponse) => {
              if (response.message == 'success') {
                Swal.fire({
                  title: 'แก้ไขรายการอาหาร',
                  text: 'แก้ไขรายการอาหารเสร็จสิ้น',
                  icon: 'success',
                  timer: 2000,
                });
                this.fetchDataFood();
                document.getElementById('modalFood_btnClose')?.click();
                this.isFormSubmmit = false;
              }
            },
            error: (error) => {
              this.errorHandler.handleError(error);
            },
          });
      } else {
        this.http
          .post<MessageResponse>(config.apiPath + '/api/food', payload, {
            headers: config.headers(),
          })
          .subscribe({
            next: (response: MessageResponse) => {
              if (response.message == 'success') {
                Swal.fire({
                  title: 'เพิ่มรายการอาหาร',
                  text: 'เพิ่มรายการอาหารเสร็จสิ้น',
                  icon: 'success',
                  timer: 2000,
                });
                this.fetchDataFood();
                document.getElementById('modalFood_btnClose')?.click();
                this.isFormSubmmit = false;
              }
            },
            error: (error) => {
              this.errorHandler.handleError(error);
            },
          });
      }
    }
  }

  async uploadFile() {
    if (this.file !== undefined) {
      const formData = new FormData();
      formData.append('img', this.file);

      const res: any = await firstValueFrom(
        this.http.post(config.apiPath + '/api/food/upload', formData, {
          headers: config.headers(),
        })
      );

      return res.fileName;
    }
  }

  fileSelect(file: any) {
    if (file.files != undefined) {
      if (file.files.length > 0) {
        this.file = file.files[0];
      }
    }
  }

  async remove(item: Food) {
    const button = await Swal.fire({
      title: 'ลบรายการอาหาร',
      text: `ยืนยันลบรายการ [ ${item.name} ] ใช่หรือไม่ ?`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
    });

    if (button.isConfirmed) {
      this.http
        .delete<MessageResponse>(config.apiPath + '/api/food/' + item.id, {
          headers: config.headers(),
        })
        .subscribe({
          next: (response: MessageResponse) => {
            if (response.message == 'success') {
              Swal.fire({
                title: 'ลบรายการอาหาร',
                text: 'ลบรายการอาหารเสร็จสิ้น',
                icon: 'success',
                timer: 2000,
              });
              this.fetchDataFood();
              document.getElementById('modalFood_btnClose')?.click();
            }
          },
          error: (error) => {
            this.errorHandler.handleError(error);
          },
        });
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
    this.http
      .get<FoodResponse>(config.apiPath + '/api/food/' + foodType)
      .subscribe({
        next: (response: FoodResponse) => {
          this.foods = response.results;
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
      });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.fetchDataFood();
  }

  clearForm() {
    this.foodForm.setValue({
      id: 0,
      name: '',
      foodType: 'food',
      price: 0,
      foodTypeId: this.foodTypes[0].id,
    });

    this.file = undefined;
    this.img = '';
    const img = document.getElementById('img') as HTMLInputElement;
    img.value = '';
  }

  selectId(item: Food) {
    this.foodForm.setValue({
      id: item.id,
      name: item.name,
      foodType: item.foodType,
      price: item.price,
      foodTypeId: item.foodTypeId,
    });

    this.img = item.img;
    const img = document.getElementById('img') as HTMLInputElement;
    img.value = '';
  }

  preventDecimalInput(event: KeyboardEvent) {
    let value = this.foodForm.get('price')?.value;
    const key = event.key;

    if (key === '.' || key === '-' || key === '+') {
      event.preventDefault();
    }

    if (value == 0 && parseInt(key) >= 0) {
      event.preventDefault();
      this.foodForm.patchValue({ price: key });
    }
  }
}
