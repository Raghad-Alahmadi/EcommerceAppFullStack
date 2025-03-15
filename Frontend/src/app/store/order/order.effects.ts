import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { OrderService } from '../../services/order.service';
import * as OrderActions from './order.actions';

@Injectable()
export class OrderEffects {
  loadOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.loadOrders),
      mergeMap(() =>
        this.orderService.getOrders().pipe(
          map(orders => OrderActions.loadOrdersSuccess({ orders })),
          catchError(error => of(OrderActions.loadOrdersFailure({ error: error.message })))
        )
      )
    )
  );

  createOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.createOrder),
      mergeMap(action =>
        this.orderService.createOrder(action.order).pipe(
          map(order => OrderActions.createOrderSuccess({ order })),
          catchError(error => of(OrderActions.createOrderFailure({ error: error.message })))
        )
      )
    )
  );

  updateOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.updateOrder),
      mergeMap(action =>
        this.orderService.updateOrder(action.order).pipe(
          map(order => OrderActions.updateOrderSuccess({ order })),
          catchError(error => of(OrderActions.updateOrderFailure({ error: error.message })))
        )
      )
    )
  );

  deleteOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.deleteOrder),
      mergeMap(action =>
        this.orderService.deleteOrder(action.orderId).pipe(
          map(() => OrderActions.deleteOrderSuccess({ orderId: action.orderId })),
          catchError(error => of(OrderActions.deleteOrderFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private orderService: OrderService
  ) {}
}