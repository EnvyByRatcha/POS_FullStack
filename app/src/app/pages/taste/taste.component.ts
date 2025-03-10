import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ModalComponent } from '../../components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import config from '../../../config';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-taste',
  standalone: true,
  imports: [ModalComponent, FormsModule],
  templateUrl: './taste.component.html',
  styleUrl: './taste.component.css',
})
export class TasteComponent {
  constructor(private http: HttpClient) {}

  tastes: any = [];
  foodTypes: any = [];
  id: number = 0;
  name: String = '';
  foodTypeId: number = 0;

  ngOnInit() {
    this.fetchDataFoodType();
    this.fetchDataTaste();
  }

  fetchDataFoodType() {
    try {
      this.http
        .get(config.apiPath + '/api/foodType')
        .subscribe((res: any) => {
          this.foodTypes = res.results;
          this.foodTypeId = this.foodTypes[0].id;
        });
    } catch (e: any) {
      Swal.fire({
        title: 'error',
        text: e.message,
        icon: 'error',
      });
    }
  }

  fetchDataTaste() {
    try {
      this.http
        .get(config.apiPath + '/api/taste')
        .subscribe((res: any) => {
          this.tastes = res.results;
        });
    } catch (e: any) {
      Swal.fire({
        title: 'error',
        text: e.message,
        icon: 'error',
      });
    }
  }

  save() {
    try {
      const payload = {
        id: this.id,
        name: this.name,
        foodTypeId: this.foodTypeId,
      };

      if (this.id > 0) {
        this.http
          .put(config.apiPath + '/api/taste', payload, {
            headers: config.headers(),
          })
          .subscribe((res: any) => {
            if (res.message == 'success') {
              Swal.fire({
                title: 'รสชาติอาหาร',
                text: 'แก้ไขรสชาติอาหารเสร็จสิ้น',
                icon: 'success',
              });
              this.fetchDataTaste();
              document.getElementById('modalTaste_btnClose')?.click();
            }
          });
      } else {
        this.http
          .post(config.apiPath + '/api/taste', payload, {
            headers: config.headers(),
          })
          .subscribe((res: any) => {
            if (res.message == 'success') {
              Swal.fire({
                title: 'รสชาติอาหาร',
                text: 'เพิ่มรสชาติอาหารเสร็จสิ้น',
                icon: 'success',
              });
              this.fetchDataTaste();
              document.getElementById('modalTaste_btnClose')?.click();
            }
          });
      }
    } catch (e: any) {
      Swal.fire({
        title: 'error',
        text: e.message,
        icon: 'error',
      });
    }
  }

  async remove(item: any) {
    try {
      const button = await Swal.fire({
        title: 'ลบรสชาติอาหาร',
        text: 'ต้องการลบรสชาติ ' + item.name + ' ใช่หรือไม่',
        icon: 'question',
        showConfirmButton: true,
        showCancelButton: true,
      });

      if (button.isConfirmed) {
        this.http
          .delete(config.apiPath + '/api/taste/' + item.id, {
            headers: config.headers(),
          })
          .subscribe((res: any) => {
            if ((res.message = 'success')) {
              Swal.fire({
                title: 'ลบรสชาติอาหาร',
                text: 'ลบรสชาติอาหารเสร็จสิ้น',
                icon: 'success',
                timer: 2000,
              });
              this.fetchDataTaste();
            }
          });
      }
    } catch (e: any) {
      Swal.fire({
        title: 'error',
        text: e.message,
        icon: 'error',
      });
    }
  }

  clearForm() {
    this.id = 0;
    this.name = '';
    this.foodTypeId = this.foodTypes[0].id;
  }

  selectId(item: any) {
    this.id = item.id;
    this.name = item.name;
    this.foodTypeId = item.FoodType.id;
    console.log(this.id);
  }
}
