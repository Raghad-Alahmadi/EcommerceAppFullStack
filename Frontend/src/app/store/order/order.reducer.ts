import { createReducer, on } from '@ngrx/store';
import * as OrderActions from './order.actions';

export interface Order {
  id: number;
  productIds: number[];
  totalAmount: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

export const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null
};

export const orderReducer = createReducer(
  initialState,
  on(OrderActions.loadOrders, state => ({ ...state, loading: true, error: null })),
  on(OrderActions.loadOrdersSuccess, (state, { orders }) => ({ 
    ...state, 
    loading: false, 
    orders 
  })),
  on(OrderActions.loadOrdersFailure, (state, { error }) => ({ 
    ...state, 
    loading: false, 
    error 
  })),

  on(OrderActions.createOrder, state => ({ ...state, loading: true, error: null })),
  on(OrderActions.createOrderSuccess, (state, { order }) => ({ 
    ...state, 
    orders: [...state.orders, order], 
    loading: false 
  })),
  on(OrderActions.createOrderFailure, (state, { error }) => ({ 
    ...state, 
    loading: false, 
    error 
  })),

  on(OrderActions.updateOrder, state => ({ ...state, loading: true, error: null })),
  on(OrderActions.updateOrderSuccess, (state, { order }) => ({ 
    ...state, 
    loading: false, 
    orders: state.orders.map(o => (o && order && o.id === order.id) ? order : o) 
  })),
  on(OrderActions.updateOrderFailure, (state, { error }) => ({ 
    ...state, 
    loading: false, 
    error 
  })),

  on(OrderActions.deleteOrder, state => ({ ...state, loading: true, error: null })),
  on(OrderActions.deleteOrderSuccess, (state, { orderId }) => ({ 
    ...state, 
    loading: false, 
    orders: state.orders.filter(o => o && o.id !== orderId) 
  })),
  on(OrderActions.deleteOrderFailure, (state, { error }) => ({ 
    ...state, 
    loading: false, 
    error 
  }))
);