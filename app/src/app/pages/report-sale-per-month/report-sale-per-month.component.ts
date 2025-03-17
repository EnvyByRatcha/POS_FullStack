import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import config from '../../../config';
import type { ReportPerMonth } from '../../interface/report';
import { ErrorHandlerService } from '../../error/error-handler.service';

interface ReportPerMonthResponse {
  results: ReportPerMonth[];
}

@Component({
  selector: 'app-report-sale-per-month',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './report-sale-per-month.component.html',
  styleUrl: './report-sale-per-month.component.css',
})
export class ReportSalePerMonthComponent {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  ddlYear: number[] = [];
  year: number = dayjs().year();
  data: ReportPerMonth[] = [];

  total: number = 0;

  ngOnInit() {
    this.ddlYear = Array.from({ length: 10 }, (_, i) => this.year - i);
    this.fetchData();
  }

  fetchData() {
    const payload = {
      year: this.year,
    };

    this.http
      .post<ReportPerMonthResponse>(
        config.apiPath + '/api/report/sumPerMonth',
        payload,
        {
          headers: config.headers(),
        }
      )
      .subscribe({
        next: (res: ReportPerMonthResponse) => {
          this.data = res.results;
          this.computeTotal();
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
      });
  }

  computeTotal() {
    let sum = 0;
    this.data.map((d) => (sum += d.amount));

    this.total = sum;
  }
}
