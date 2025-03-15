import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Order } from '../../store/order/order.reducer';
import { selectAllOrders, selectOrdersLoading } from '../../store/order/order.selectors';
import { loadOrders, deleteOrder } from '../../store/order/order.actions';
import { ProductService } from '../../services/product.service';
import { Product } from '../../store/product/product.reducer';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  orders$: Observable<Order[]>;
  loading$: Observable<boolean>;
  products: Map<number, Product> = new Map();
  loadingProducts = false;

  constructor(
    private store: Store,
    private productService: ProductService,
    private router: Router
  ) {
    this.orders$ = this.store.select(selectAllOrders);
    this.loading$ = this.store.select(selectOrdersLoading);
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
    // Get all unique product IDs from all orders
    const productIds = new Set<number>();
    orders.forEach(order => {
      if (order.productIds) {
        order.productIds.forEach(id => productIds.add(id));
      }
    });
    
    if (productIds.size === 0) return;
    
    this.loadingProducts = true;
    
    // Create an array of requests with error handling
    const productRequests = Array.from(productIds).map(id => 
      this.productService.getProduct(id).pipe(
        catchError(() => of(null)) // Return null for products that fail to load
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
  
  // Navigate to edit page
  editOrder(order: Order): void {
    if (!order || !order.id) return;
    this.router.navigate(['/orders', order.id, 'edit']);
  }
  
  // Delete order
  deleteOrder(orderId: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.store.dispatch(deleteOrder({ orderId }));
    }
  }
}