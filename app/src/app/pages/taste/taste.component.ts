import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ModalComponent } from '../../components/modal/modal.component';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import config from '../../../config';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import type { Taste, FoodType } from '../../interface/food';
import type { MessageResponse } from '../../interface/message';
import { ErrorHandlerService } from '../../error/error-handler.service';

interface FoodTypeResponse {
  results: FoodType[];
}

interface TasteResponse {
  results: Taste[];
}

@Component({
  selector: 'app-taste',
  standalone: true,
  imports: [ModalComponent, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './taste.component.html',
  styleUrl: './taste.component.css',
})
export class TasteComponent {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  tasteForm: FormGroup = new FormGroup({
    id: new FormControl(0, [Validators.required]),
    name: new FormControl('', [Validators.required]),
    foodTypeId: new FormControl('', [Validators.required]),
  });
  isFormSubmmit: boolean = false;

  tastes: Taste[] = [];
  foodTypes: FoodType[] = [];

  ngOnInit() {
    this.fetchDataFoodType();
    this.fetchDataTaste();
  }

  fetchDataFoodType() {
    this.http
      .get<FoodTypeResponse>(config.apiPath + '/api/foodType')
      .subscribe({
        next: (response: FoodTypeResponse) => {
          this.foodTypes = response.results;
          this.tasteForm.patchValue({ foodTypeId: this.foodTypes[0].id });
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
      });
  }

  fetchDataTaste() {
    this.http.get<TasteResponse>(config.apiPath + '/api/taste').subscribe({
      next: (response: TasteResponse) => {
        this.tastes = response.results;
      },
      error: (error) => {
        this.errorHandler.handleError(error);
      },
    });
  }

  save() {
    this.isFormSubmmit = true;
    if (this.tasteForm.valid) {
      const formData = this.tasteForm.value;

      const payload = {
        ...formData,
      };

      if (payload.id > 0) {
        this.http
          .put<MessageResponse>(config.apiPath + '/api/taste', payload, {
            headers: config.headers(),
          })
          .subscribe({
            next: (response: MessageResponse) => {
              if (response.message == 'success') {
                Swal.fire({
                  title: 'แก้ไขรสชาติอาหาร',
                  text: 'แก้ไขรสชาติอาหารเสร็จสิ้น',
                  icon: 'success',
                });
                this.fetchDataTaste();
                document.getElementById('modalTaste_btnClose')?.click();
                this.isFormSubmmit = false;
              }
            },
            error: (error) => {
              this.errorHandler.handleError(error);
            },
          });
      } else {
        this.http
          .post<MessageResponse>(config.apiPath + '/api/taste', payload, {
            headers: config.headers(),
          })
          .subscribe({
            next: (response: MessageResponse) => {
              if (response.message == 'success') {
                Swal.fire({
                  title: 'เพิ่มรสชาติอาหาร',
                  text: 'เพิ่มรสชาติอาหารเสร็จสิ้น',
                  icon: 'success',
                });
                this.fetchDataTaste();
                document.getElementById('modalTaste_btnClose')?.click();
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

  async remove(item: Taste) {
    const button = await Swal.fire({
      title: 'ลบรสชาติอาหาร',
      text: `ต้องการลบรสชาติ [ ${item.FoodType.name} ${item.name} ] ใช่หรือไม่`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
    });

    if (button.isConfirmed) {
      this.http
        .delete<MessageResponse>(config.apiPath + '/api/taste/' + item.id, {
          headers: config.headers(),
        })
        .subscribe({
          next: (response: MessageResponse) => {
            if ((response.message = 'success')) {
              Swal.fire({
                title: 'ลบรสชาติอาหาร',
                text: 'ลบรสชาติอาหารเสร็จสิ้น',
                icon: 'success',
                timer: 2000,
              });
              this.fetchDataTaste();
            }
          },
          error: (error) => {
            this.errorHandler.handleError(error);
          },
        });
    }
  }

  clearForm() {
    this.tasteForm.setValue({
      id: 0,
      name: '',
      foodTypeId: this.foodTypes[0].id,
    });
  }

  selectId(item: Taste) {
    this.tasteForm.setValue({
      id: item.id,
      name: item.name,
      foodTypeId: item.foodTypeId,
    });
  }
}
