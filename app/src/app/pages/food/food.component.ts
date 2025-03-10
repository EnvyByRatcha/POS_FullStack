import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal.component';
import config from '../../../config';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-food',
  standalone: true,
  imports: [FormsModule, ModalComponent, MatPaginatorModule],
  templateUrl: './food.component.html',
  styleUrl: './food.component.css',
})
export class FoodComponent {
  constructor(private http: HttpClient) {}

  foods: any[] = [];
  foodTypes: any[] = [];
  foodTypeId: number = 0;

  id: number = 0;
  name: string = '';
  price: number = 0;
  foodType: string = 'food';
  fileName: string = '';
  file: File | undefined = undefined;
  serverPath: string = '';
  img: string = '';

  page: number = 1;
  pageSize: number = 10;
  total: number = 0;

  ngOnInit() {
    this.fetchDataFoodType();
    this.fetchDataFood();
    this.serverPath = config.apiPath;
  }

  fetchDataFoodType() {
    try {
      this.http.get(config.apiPath + '/api/foodType').subscribe((res: any) => {
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

  fetchDataFood() {
    try {
      const payload = {
        page: this.page,
        pageSize: this.pageSize,
      };
      this.http
        .post(config.apiPath + '/api/food/paginate', payload, {
          headers: config.headers(),
        })
        .subscribe((res: any) => {
          this.foods = res.results;
          this.total = res.total;
        });
    } catch (e: any) {
      Swal.fire({
        title: 'error',
        text: e.message,
        icon: 'error',
      });
    }
  }

  async save() {
    try {
      const fileName = await this.uploadFile();

      const payload = {
        id: this.id,
        name: this.name,
        price: this.price,
        img: fileName,
        foodTypeId: this.foodTypeId,
        foodType: this.foodType,
      };

      if (this.id > 0) {
        this.http
          .put(config.apiPath + '/api/food', payload, {
            headers: config.headers(),
          })
          .subscribe((res: any) => {
            if (res.message == 'success') {
              Swal.fire({
                title: 'แก้ไขรายการอาหาร',
                text: 'แก้ไขรายการอาหารเสร็จสิ้น',
                icon: 'success',
                timer: 2000,
              });
              this.fetchDataFood();
              document.getElementById('modalFood_btnClose')?.click();
            }
          });
      } else {
        this.http
          .post(config.apiPath + '/api/food', payload, {
            headers: config.headers(),
          })
          .subscribe((res: any) => {
            if (res.message == 'success') {
              Swal.fire({
                title: 'เพิ่มรายการอาหาร',
                text: 'เพิ่มรายการอาหารเสร็จสิ้น',
                icon: 'success',
                timer: 2000,
              });
              this.fetchDataFood();
              document.getElementById('modalFood_btnClose')?.click();
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

  async uploadFile() {
    try {
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
    } catch (e: any) {
      Swal.fire({
        title: 'error',
        text: e.message,
        icon: 'error',
      });
    }
  }

  fileSelect(file: any) {
    if (file.files != undefined) {
      if (file.files.length > 0) {
        this.file = file.files[0];
      }
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

  clearForm() {
    this.foodTypeId = this.foodTypes[0].id;
    this.id = 0;
    this.name = '';
    this.price = 0;
    this.foodType = 'food';
    this.file = undefined;
    this.img = '';

    const img = document.getElementById('img') as HTMLInputElement;
    img.value = '';
  }

  selectId(item: any) {
    this.id = item.id;
    this.name = item.name;
    this.price = item.price;
    this.foodTypeId = item.foodTypeId;
    this.foodType = item.foodType;
    this.img = item.img;

    const img = document.getElementById('img') as HTMLInputElement;
    img.value = '';
  }

  async remove(item: any) {
    try {
      const button = await Swal.fire({
        title: 'ลบรายการอาหาร',
        text: 'ยืนยันลบรายการ ' + item.name + ' ใช่หรือไม่?',
        icon: 'question',
        showConfirmButton: true,
        showCancelButton: true,
      });

      if (button.isConfirmed) {
        this.http
          .delete(config.apiPath + '/api/food/' + item.id, {
            headers: config.headers(),
          })
          .subscribe((res: any) => {
            if (res.message == 'success') {
              Swal.fire({
                title: 'ลบรายการอาหาร',
                text: 'ลบรายการอาหารเสร็จสิ้น',
                icon: 'success',
                timer: 2000,
              });
              this.fetchDataFood();
              document.getElementById('modalFood_btnClose')?.click();
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

  onPageChange(event: PageEvent) {
    this.page=event.pageIndex+1;
    this.pageSize=event.pageSize;
    this.fetchDataFood();
  }
}
