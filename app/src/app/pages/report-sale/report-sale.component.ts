import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import dayjs from 'dayjs';
import config from '../../../config';
import { FormsModule } from '@angular/forms';
import type { ReportPerDay } from '../../interface/report';
import { ErrorHandlerService } from '../../error/error-handler.service';

interface ReportPerDayResponse {
  results: ReportPerDay[];
}

@Component({
  selector: 'app-report-sale',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './report-sale.component.html',
  styleUrl: './report-sale.component.css',
})
export class ReportSaleComponent {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  ddlYear: number[] = [];
  ddlMonth: string[] = [];
  data: ReportPerDay[] = [];
  year: number = dayjs().year();
  month: number = dayjs().month() + 1;
  dayjs: typeof dayjs = dayjs;

  total: number = 0;

  ngOnInit() {
    this.ddlYear = this.getYear();
    this.ddlMonth = this.getMonth();

    this.fetchData();
  }

  fetchData() {
    const payload = {
      year: this.year,
      month: this.month,
    };

    this.http
      .post<ReportPerDayResponse>(
        config.apiPath + '/api/report/sumPerDay',
        payload,
        {
          headers: config.headers(),
        }
      )
      .subscribe({
        next: (response: ReportPerDayResponse) => {
          this.data = response.results;
          this.computeTotal();
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
      });
  }

  getYear() {
    const currentYear = dayjs().year();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }

  getMonth() {
    const months = [
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม',
    ];

    return months;
  }

  computeTotal() {
    let sum = 0;
    this.data.map((d) => (sum += d.amount));

    this.total = sum;
  }
}
