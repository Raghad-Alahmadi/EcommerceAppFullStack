import { createReducer, on } from '@ngrx/store';
import * as ProductActions from './product.actions';

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export interface ProductState {
  products: Product[];
  loading: boolean;
  error: any;
}

export const initialState: ProductState = {
  products: [],
  loading: false,
  error: null
};

export const productReducer = createReducer(
  initialState,
  on(ProductActions.loadProducts, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ProductActions.loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    loading: false
  })),
  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  on(ProductActions.addProductSuccess, (state, { product }) => ({
    ...state,
    products: [...state.products, product]
  })),
  on(ProductActions.deleteProductSuccess, (state, { productId }) => ({
    ...state,
    products: state.products.filter(product => product.id !== productId)
  }))
);