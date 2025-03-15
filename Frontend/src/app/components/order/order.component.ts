import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Order } from '../../store/order/order.reducer';
import { selectAllOrders } from '../../store/order/order.selectors';
import { loadOrders } from '../../store/order/order.actions';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  orders$: Observable<Order[]>;

  constructor(private store: Store) {
    this.orders$ = this.store.select(selectAllOrders);
  }

  ngOnInit(): void {
    this.store.dispatch(loadOrders());
  }
}