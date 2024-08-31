import { Injectable, inject } from '@angular/core';
import { signalStore, withMethods, withState, patchState } from '@ngrx/signals';
import { ApiClientService } from '../shared/api-client.service';
import { ProductDto } from './dto/product.dto';

export interface ProductState {
  products: ProductDto[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class ProductStore extends signalStore(
  withState(initialState),
  withMethods((store, apiClient = inject(ApiClientService)) => ({
    loadProducts(page: number = store.page(), limit: number = store.limit()) {
      patchState(store, { loading: true, error: null });
      apiClient.getProducts(page, limit).subscribe({
        next: (response) => {
          patchState(store, {
            products: response.products,
            total: response.total,
            page: response.page,
            limit: response.limit,
            loading: false
          });
        },
        error: (error) => patchState(store, { error: error.error.message, loading: false }),
      });
    }
  }))
) {}
