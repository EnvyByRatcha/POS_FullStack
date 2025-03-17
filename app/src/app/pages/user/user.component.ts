import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import config from '../../../config';
import { ModalComponent } from '../../components/modal/modal.component';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import type { User } from '../../interface/user';
import type { MessageResponse } from '../../interface/message';
import { ErrorHandlerService } from '../../error/error-handler.service';

interface UserResponse {
  results: User[];
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [ModalComponent, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  userForm: FormGroup = new FormGroup({
    id: new FormControl(0, [Validators.required]),
    name: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    level: new FormControl('employee', [Validators.required]),
    permission: new FormControl('', [Validators.required]),
  });
  isFormSubmmit: boolean = false;

  permissionForm: FormGroup = new FormGroup({
    permission: new FormControl('', [Validators.required]),
  });

  users: User[] = [];

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.http
      .get<UserResponse>(config.apiPath + '/api/user/list', {
        headers: config.headers(),
      })
      .subscribe({
        next: (response: UserResponse) => {
          this.users = response.results;
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
      });
  }

  save() {
    this.isFormSubmmit = true;

    if (this.userForm.valid) {
      const formData = this.userForm.value;
      const payload = {
        ...formData,
      };

      if (payload.id > 0) {
        this.http
          .put<MessageResponse>(
            config.apiPath + '/api/user/update/' + payload.id,
            payload,
            {
              headers: config.headers(),
            }
          )
          .subscribe({
            next: (response: MessageResponse) => {
              if (response.message == 'success') {
                Swal.fire({
                  title: 'เพิ่มผู้ใช้งาน',
                  text: 'เพิ่มผู้ใช้งานสำเร็จ',
                  icon: 'success',
                  timer: 2000,
                });
                this.fetchData();
                document.getElementById('modalUser_btnClose')?.click();
                this.isFormSubmmit = false;
              }
            },
            error: (error) => {
              this.errorHandler.handleError(error);
              Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: 'กรุณาตรวจสอบรหัสยืนยันตัวตน (Permission)',
                icon: 'error',
              });
            },
          });
      } else {
        this.http
          .post<MessageResponse>(config.apiPath + '/api/user/create', payload, {
            headers: config.headers(),
          })
          .subscribe({
            next: (response: MessageResponse) => {
              if (response.message == 'success') {
                Swal.fire({
                  title: 'เพิ่มผู้ใช้งาน',
                  text: 'เพิ่มผู้ใช้งานสำเร็จ',
                  icon: 'success',
                  timer: 2000,
                });
                this.fetchData();
                document.getElementById('modalUser_btnClose')?.click();
                this.isFormSubmmit = false;
              }
            },
            error: (error) => {
              this.errorHandler.handleError(error);
              Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: 'กรุณาตรวจสอบรหัสยืนยันตัวตน (Permission)',
                icon: 'error',
              });
            },
          });
      }
    }
  }

  async remove() {
    this.isFormSubmmit = true;
    if (this.permissionForm.valid) {
      const payload = {
        id: this.userForm.get('id')?.value,
        permission: this.permissionForm.get('permission')?.value,
      };

      console.log(payload);

      const button = await Swal.fire({
        title: 'ลบผู้ใช้งาน',
        text: `ยืนยันลบผู้ใช้งานใช่หรือไม่`,
        icon: 'question',
        showConfirmButton: true,
        showCancelButton: true,
      });

      if (button.isConfirmed) {
        this.http
          .post<MessageResponse>(config.apiPath + '/api/user/remove', payload, {
            headers: config.headers(),
          })
          .subscribe({
            next: (response: MessageResponse) => {
              if (response.message == 'success') {
                Swal.fire({
                  title: 'ลบผู้ใช้งาน',
                  text: 'ลบผู้ใช้งานสำเร็จ',
                  icon: 'success',
                  timer: 2000,
                });

                this.fetchData();
                document.getElementById('modalRemoveUser_btnClose')?.click();
                this.isFormSubmmit = false;
                this.permissionForm.setValue({
                  permission:''
                })
              }
            },
            error: (error) => {
              this.errorHandler.handleError(error);
              Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: 'กรุณาตรวจสอบรหัสยืนยันตัวตน (Permission)',
                icon: 'error',
              });
            },
          });
      }
    }
  }

  selectedUser(item: User) {
    this.userForm.patchValue({
      id: item.id,
      name: item.name,
      username: item.username,
      level: item.level.toLowerCase(),
      permission: '',
    });
  }

  clearForm() {
    this.userForm.setValue({
      id: 0,
      name: '',
      username: '',
      password: '',
      level: 'employee',
      permission: '',
    });
  }
}
