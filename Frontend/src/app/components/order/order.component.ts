import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Order } from '../../store/order/order.reducer';
import { selectAllOrders } from '../../store/order/order.selectors';
import { loadOrders, deleteOrder, updateOrder } from '../../store/order/order.actions';
import { ProductService } from '../../services/product.service';
import { Product } from '../../store/product/product.reducer';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  orders$: Observable<Order[]>;
  products: Map<number, Product> = new Map();
  loadingProducts = false;

  constructor(
    private store: Store,
    private productService: ProductService,
    private router: Router
  ) {
    this.orders$ = this.store.select(selectAllOrders);
  }

  ngOnInit(): void {
    this.store.dispatch(loadOrders());
    
    this.orders$.pipe(
      tap(orders => {
        if (orders && orders.length > 0) {
          this.loadProductsForOrders(orders);
        }
      })
    ).subscribe();
  }
  
  loadProductsForOrders(orders: Order[]): void {
    const productIds = new Set<number>();
    orders.forEach(order => {
      if (order.productIds) {
        order.productIds.forEach(id => productIds.add(id));
      }
    });
    
    if (productIds.size === 0) return;
    
    this.loadingProducts = true;
    
    const productRequests = Array.from(productIds).map(id => 
      this.productService.getProduct(id).pipe(
        catchError(() => of(null)) 
      )
    );
    
    forkJoin(productRequests).subscribe({
      next: (products) => {
        products.forEach(product => {
          if (product) {
            this.products.set(product.id, product);
          }
        });
        this.loadingProducts = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loadingProducts = false;
      }
    });
  }
  
  getProduct(id: number): Product | undefined {
    return this.products.get(id);
  }
  

editOrder(order: Order): void {
  const statuses: Array<'pending' | 'completed' | 'cancelled'> = ['pending', 'completed', 'cancelled'];
  const currentIndex = statuses.indexOf(order.status.toLowerCase() as 'pending' | 'completed' | 'cancelled');
  const nextIndex = (currentIndex + 1) % statuses.length;
  
  const updatedOrder: Order = {
    ...order,
    status: statuses[nextIndex]
  };
  
  this.store.dispatch(updateOrder({ order: updatedOrder }));
}
  
  // Delete order method
  deleteOrder(orderId: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.store.dispatch(deleteOrder({ orderId }));
    }
  }
}