import { createReducer, on } from '@ngrx/store';
import * as OrderActions from './order.actions';
import { Product } from '../product/product.reducer';

// Define the Order model
export interface Order {
  id: number;
  productIds: number[];
  totalAmount: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
}

// Define the OrderState interface
export interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

// Define the initial state
export const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null
};

// Create the order reducer
export const orderReducer = createReducer(
  initialState,
  on(OrderActions.loadOrders, state => ({ ...state, loading: true })),
  on(OrderActions.loadOrdersSuccess, (state, { orders }) => ({ ...state, loading: false, orders })),
  on(OrderActions.loadOrdersFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(OrderActions.createOrder, state => ({ ...state, loading: true })),
  on(OrderActions.createOrderSuccess, (state, { order }) => ({ ...state, loading: false, orders: [...state.orders, order] })),
  on(OrderActions.createOrderFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(OrderActions.updateOrder, state => ({ ...state, loading: true })),
  on(OrderActions.updateOrderSuccess, (state, { order }) => ({
    ...state,
    loading: false,
    orders: state.orders.map(o => (o.id === order.id ? order : o))
  })),
  on(OrderActions.updateOrderFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(OrderActions.deleteOrder, state => ({ ...state, loading: true })),
  on(OrderActions.deleteOrderSuccess, (state, { orderId }) => ({
    ...state,
    loading: false,
    orders: state.orders.filter(o => o.id !== orderId)
  })),
  on(OrderActions.deleteOrderFailure, (state, { error }) => ({ ...state, loading: false, error }))
);