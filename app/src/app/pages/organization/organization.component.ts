import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import config from '../../../config';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { ModalComponent } from '../../components/modal/modal.component';
import { CommonModule } from '@angular/common';
import type { Organization } from '../../interface/organization';
import type { MessageResponse } from '../../interface/message';
import { ErrorHandlerService } from '../../error/error-handler.service';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [FormsModule, ModalComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './organization.component.html',
  styleUrl: './organization.component.css',
})
export class OrganizationComponent {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  oganizationForm: FormGroup = new FormGroup({
    id: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    website: new FormControl('', [Validators.required]),
    promptPay: new FormControl('', [Validators.required]),
    taxCode: new FormControl('', [Validators.required]),
    permission: new FormControl('', [Validators.required]),
  });
  isFormSubmmit: boolean = false;

  organization: Organization | null = null;

  myFile: any;
  logoPath: string = '';

  ngOnInit() {
    this.fetchDataOrganization();
  }

  fetchDataOrganization() {
    this.http
      .get<Organization>(config.apiPath + '/api/organization')
      .subscribe({
        next: (response: Organization) => {
          this.organization = response;
          this.logoPath =
            config.apiPath + '/uploads/logo/' + this.organization.logo;
          this.oganizationForm.patchValue({
            ...this.organization,
          });
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
      });
  }

  async save() {
    this.isFormSubmmit = true;

    if (this.oganizationForm.valid) {
      const fileName = await this.upload();

      const formData = this.oganizationForm.value;
      const payload = {
        ...formData,
        logo: fileName,
      };

      this.http
        .post<MessageResponse>(config.apiPath + '/api/organization', payload, {
          headers: config.headers(),
        })
        .subscribe({
          next: (response: MessageResponse) => {
            if (response.message == 'success') {
              Swal.fire({
                title: 'บันทึกข้อมูล',
                text: 'บันทึกข้อมูลสำเร็จ',
                icon: 'success',
                timer: 2000,
              });

              document.getElementById('modalOrganize_btnClose')?.click();
              this.fetchDataOrganization();
              this.isFormSubmmit = false;
              this.oganizationForm.patchValue({
                permission: '',
              });
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

  onFileChange(event: any) {
    if (event.target.files != null) {
      if (event.target.files.length > 0) {
        this.myFile = event.target.files[0];
      }
    }
  }

  async upload() {
    if (this.myFile !== undefined) {
      const formData = new FormData();
      formData.append('myFile', this.myFile);
      const url = config.apiPath + '/api/organization/upload';
      const res: any = await firstValueFrom(
        this.http.post(url, formData, {
          headers: config.headers(),
        })
      );

      return res.fileName;
    }
  }

  selectItem() {
    this.oganizationForm.patchValue({
      ...this.organization,
      permission: '',
    });
  }
}
