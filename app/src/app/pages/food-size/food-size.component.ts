import { Component } from '@angular/core';
import { ModalComponent } from '../../components/modal/modal.component';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import config from '../../../config';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import type { FoodType, FoodSize } from '../../interface/food';
import type { MessageResponse } from '../../interface/message';
import { ErrorHandlerService } from '../../error/error-handler.service';

interface FoodTypeResponse {
  results: FoodType[];
}

interface FoodSizeResponse {
  results: FoodSize[];
}

@Component({
  selector: 'app-food-size',
  standalone: true,
  imports: [ModalComponent, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './food-size.component.html',
  styleUrl: './food-size.component.css',
})
export class FoodSizeComponent {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  foodSizeForm: FormGroup = new FormGroup({
    id: new FormControl(0, [Validators.required]),
    foodTypeId: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    addMoney: new FormControl(0, [Validators.required]),
  });
  isFormSubmmit: boolean = false;

  foodSizes: FoodSize[] = [];
  foodTypes: FoodType[] = [];

  targetFoodTypeId: number = 0;

  ngOnInit() {
    this.fetchDataFoodType();
    this.fetchDataFoodSize();
  }

  fetchDataFoodType() {
    this.http
      .get<FoodTypeResponse>(config.apiPath + '/api/foodType')
      .subscribe({
        next: (response: FoodTypeResponse) => {
          this.foodTypes = response.results;
          this.foodSizeForm.patchValue({ foodTypeId: this.foodTypes[0].id });
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
      });
  }

  fetchDataFoodSize() {
    this.http
      .get<FoodSizeResponse>(config.apiPath + '/api/foodSize')
      .subscribe({
        next: (response: FoodSizeResponse) => {
          this.foodSizes = response.results;
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
      });
  }

  fetchDataSelectedFoodSize() {
    if (this.targetFoodTypeId == 0) {
      this.fetchDataFoodSize();
    } else {
      this.http
        .get<FoodSizeResponse>(
          config.apiPath + '/api/foodSize/' + this.targetFoodTypeId
        )
        .subscribe({
          next: (response: FoodSizeResponse) => {
            this.foodSizes = response.results;
          },
          error: (error) => {
            this.errorHandler.handleError(error);
          },
        });
    }
  }

  save() {
    this.isFormSubmmit = true;
    if (this.foodSizeForm.valid) {
      const formData = this.foodSizeForm.value;

      const payload = {
        ...formData,
      };

      if (payload.id > 0) {
        this.http
          .put<MessageResponse>(config.apiPath + '/api/foodSize', payload, {
            headers: config.headers(),
          })
          .subscribe({
            next: (response: MessageResponse) => {
              if (response.message == 'success') {
                Swal.fire({
                  title: 'แก้ไขข้อมูล',
                  text: 'แก้ไขข้อมูลเสร็จสิ้น',
                  icon: 'success',
                  timer: 2000,
                });
                this.fetchDataFoodSize();
                document.getElementById('modalFoodSize_btnClose')?.click();
                this.isFormSubmmit = false;
              }
            },
            error: (error) => {
              this.errorHandler.handleError(error);
            },
          });
      } else {
        this.http
          .post<MessageResponse>(config.apiPath + '/api/foodSize', payload, {
            headers: config.headers(),
          })
          .subscribe({
            next: (response: MessageResponse) => {
              if (response.message == 'success') {
                Swal.fire({
                  title: 'เพิ่มข้อมูล',
                  text: 'เพิ่มข้อมูลเสร็จสิ้น',
                  icon: 'success',
                  timer: 2000,
                });
                this.fetchDataFoodSize();
                document.getElementById('modalFoodSize_btnClose')?.click();
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

  async remove(item: FoodSize) {
    const button = await Swal.fire({
      title: 'ลบข้อมูลขนาดอาหาร',
      text: `ยืนยันลบข้อมูลขนาดอาหาร [ ${item.FoodType.name} ${item.name} ] ใช่หรือไม่`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
    });

    if (button.isConfirmed) {
      this.http
        .delete<MessageResponse>(config.apiPath + '/api/foodSize/' + item.id, {
          headers: config.headers(),
        })
        .subscribe({
          next: (response: MessageResponse) => {
            if (response.message == 'success') {
              Swal.fire({
                title: 'ลบข้อมูลขนาดอาหาร',
                text: 'ลบข้อมูลขนาดอาหารสำเร็จ',
                icon: 'success',
                timer: 2000,
              });

              this.fetchDataFoodSize();
            }
          },
          error: (error) => {
            this.errorHandler.handleError(error);
          },
        });
    }
  }

  selectId(item: FoodSize) {
    this.foodSizeForm.setValue({
      id: item.id,
      foodTypeId: item.foodTypeId,
      name: item.name,
      addMoney: item.addMoney,
    });
  }

  clearForm() {
    this.foodSizeForm.setValue({
      id: 0,
      foodTypeId: this.foodTypes[0].id,
      name: '',
      addMoney: 0,
    });
  }

  preventDecimalInput(event: KeyboardEvent) {
    let value = this.foodSizeForm.get('addMoney')?.value;
    const key = event.key;

    if (key === '.' || key === '-' || key === '+') {
      event.preventDefault();
    }

    if (value == 0 && parseInt(key) >= 0) {
      event.preventDefault();
      this.foodSizeForm.patchValue({ addMoney: key });
    }
  }
}
