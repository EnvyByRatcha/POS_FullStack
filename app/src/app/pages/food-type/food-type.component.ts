import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import config from '../../../config';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal.component';
import { CommonModule } from '@angular/common';
import type { FoodType } from '../../interface/food';
import type { MessageResponse } from '../../interface/message';
import { ErrorHandlerService } from '../../error/error-handler.service';

interface FoodTypeResponse {
  results: FoodType[];
}

@Component({
  selector: 'app-food-type',
  standalone: true,
  imports: [FormsModule, ModalComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './food-type.component.html',
  styleUrl: './food-type.component.css',
})
export class FoodTypeComponent {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  foodTypeForm: FormGroup = new FormGroup({
    id: new FormControl(0, [Validators.required]),
    name: new FormControl('', [Validators.required]),
  });
  isFormSubmmit: boolean = false;

  foodTypes: FoodType[] = [];

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.http
      .get<FoodTypeResponse>(config.apiPath + '/api/foodType')
      .subscribe({
        next: (response: FoodTypeResponse) => {
          this.foodTypes = response.results;
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
      });
  }

  save() {
    this.isFormSubmmit = true;
    if (this.foodTypeForm.valid) {
      const formData = this.foodTypeForm.value;
      const payload = { ...formData };

      if (payload.id > 0) {
        this.http
          .put<MessageResponse>(config.apiPath + '/api/foodType', payload, {
            headers: config.headers(),
          })
          .subscribe({
            next: (response: MessageResponse) => {
              if (response.message == 'success') {
                Swal.fire({
                  title: 'แก้ไขประเภทอาหาร',
                  text: 'แก้ไขประเภทอาหารสำเร็จ',
                  icon: 'success',
                  timer: 2000,
                });
              }
              this.fetchData();
              document.getElementById('modalFoodType_btnClose')?.click();
              this.isFormSubmmit = false;
            },
            error: (error) => {
              this.errorHandler.handleError(error);
            },
          });
      } else {
        this.http
          .post<MessageResponse>(config.apiPath + '/api/foodType', payload, {
            headers: config.headers(),
          })
          .subscribe({
            next: (response: MessageResponse) => {
              if (response.message == 'success') {
                Swal.fire({
                  title: 'เพิ่มประเภทอาหาร',
                  text: 'เพิ่มประเภทอาหารสำเร็จ',
                  icon: 'success',
                  timer: 2000,
                });

                this.fetchData();
                document.getElementById('modalFoodType_btnClose')?.click();
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

  async remove(item: FoodType) {
    const button = await Swal.fire({
      title: 'ลบประเภทอาหาร',
      text: 'ยืนยันต้องการลบประเภทอาหาร ' + item.name + ' ใช่หรือไม่',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
    });

    if (button.isConfirmed) {
      this.http
        .delete<MessageResponse>(config.apiPath + '/api/foodType/' + item.id, {
          headers: config.headers(),
        })
        .subscribe({
          next: (response: MessageResponse) => {
            if (response.message == 'success') {
              Swal.fire({
                title: 'ลบประเภทอาหาร',
                text: 'ลบประเภทอาหารเสร็จสิ้น',
                icon: 'success',
                timer: 2000,
              });
              this.fetchData();
            }
          },
          error: (error) => {
            this.errorHandler.handleError(error);
          },
        });
    }
  }

  selectItem(item: FoodType) {
    this.foodTypeForm.setValue({ id: item.id, name: item.name });
  }

  clearForm() {
    this.foodTypeForm.setValue({ id: 0, name: '' });
  }
}
