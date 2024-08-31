import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductStore } from '../product.store';
import { AuthStore } from '../../auth/auth.store';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatButton,
  ],
})
export class ProductListComponent implements OnInit, OnDestroy {
  totalSeconds = 8 * 60 * 60; // 8 hours in seconds
  hours = 0;
  minutes = 0;
  seconds = 0;
  private intervalId: any;

  constructor(public productStore: ProductStore, public authStore: AuthStore) {}

  ngOnInit(): void {
    this.productStore.loadProducts();
    this.updateTime();
    this.startTimer();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  onPageChange(event: PageEvent): void {
    const newPage = event.pageIndex + 1;
    this.productStore.loadProducts(newPage, event.pageSize);
  }

  logout(): void {
    this.authStore.logout();
  }

  startTimer(): void {
    this.intervalId = setInterval(() => {
      if (this.totalSeconds === 0) {
        this.logout();
      } else {
        this.totalSeconds--;
        this.updateTime();
      }
    }, 1000);
  }

  updateTime(): void {
    this.hours = Math.floor(this.totalSeconds / 3600);
    this.minutes = Math.floor((this.totalSeconds % 3600) / 60);
    this.seconds = this.totalSeconds % 60;
  }
}
