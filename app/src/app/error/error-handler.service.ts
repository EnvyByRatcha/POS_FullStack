import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor() {}

  handleError(error: unknown): void {
    let errorMessage = 'Something Wrong';

    if (error instanceof HttpErrorResponse) {
      errorMessage = `HTTP Error ${error.status}: ${error.message}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error('Error', error);
  }
}
