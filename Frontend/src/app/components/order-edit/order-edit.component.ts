import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, take, catchError } from 'rxjs/operators';
import { Order } from '../../store/order/order.reducer';
import { selectOrderById } from '../../store/order/order.selectors';
import { updateOrder } from '../../store/order/order.actions';
import { ProductService } from '../../services/product.service';
import { Product } from '../../store/product/product.reducer';

@Component({
  selector: 'app-order-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-edit.component.html',
  styleUrls: ['./order-edit.component.css']
})
export class OrderEditComponent implements OnInit {
  orderForm: FormGroup;
  orderId: number;
  order$: Observable<Order | undefined>;
  products: Map<number, Product> = new Map();
  availableProducts$: Observable<Product[]>;
  loading = true;
  statusOptions = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private productService: ProductService
  ) {
    this.orderForm = this.createForm();
    this.orderId = 0;
    this.order$ = of(undefined);
    this.availableProducts$ = this.productService.getProducts();
  }

  ngOnInit(): void {
    // Get order ID from route params
    this.route.paramMap.pipe(
      map(params => {
        const id = params.get('id');
        return id ? parseInt(id, 10) : 0;
      }),
      switchMap(id => {
        this.orderId = id;
        console.log('Loading order with ID:', id);
        return this.store.select(selectOrderById(id));
      }),
      take(1)
    ).subscribe(order => {
      if (order) {
        console.log('Order loaded:', order);
        this.loadProducts(order);
        this.patchFormValues(order);
      } else {
        console.error('Order not found');
        this.router.navigate(['/orders']);
      }
      this.loading = false;
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [0],
      status: ['pending', Validators.required],
      date: ['', Validators.required],
      totalAmount: [0, [Validators.required, Validators.min(0)]],
      productIds: this.fb.array([])
    });
  }

  get productIdsForm(): FormArray {
    return this.orderForm.get('productIds') as FormArray;
  }

  patchFormValues(order: Order): void {
    console.log('Patching form with order:', order);
    
    // Reset the product IDs array
    while (this.productIdsForm.length) {
      this.productIdsForm.removeAt(0);
    }
    
    // Add each product ID to the form array
    if (order.productIds && Array.isArray(order.productIds)) {
      order.productIds.forEach(id => {
        this.productIdsForm.push(this.fb.control(id));
      });
    }
    
    // Format date for input if needed
    let formattedDate = order.date;
    if (formattedDate && typeof formattedDate === 'string') {
      // Ensure the date is in the format expected by datetime-local input
      const dateObj = new Date(formattedDate);
      if (!isNaN(dateObj.getTime())) {
        // Convert to YYYY-MM-DDThh:mm format required by datetime-local input
        formattedDate = dateObj.toISOString().slice(0, 16);
      }
    }
    
    // Update the rest of the form
    this.orderForm.patchValue({
      id: order.id,
      status: order.status,
      date: formattedDate,
      totalAmount: order.totalAmount
    });
    
    console.log('Form after patch:', this.orderForm.value);
  }

  loadProducts(order: Order): void {
    if (!order.productIds || order.productIds.length === 0) return;
    
    const productRequests = order.productIds.map(id => 
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
        // After loading products, recalculate total amount
        this.updateTotalAmount();
      },
      error: (err) => {
        console.error('Error loading products:', err);
      }
    });
  }

  addProduct(productId: number): void {
    if (!productId || isNaN(productId)) {
      console.error('Invalid product ID:', productId);
      return;
    }
    
    this.productIdsForm.push(this.fb.control(productId));
    
    // Load the product if not already loaded
    if (!this.products.has(productId)) {
      this.productService.getProduct(productId)
        .pipe(catchError(() => of(null)))
        .subscribe(product => {
          if (product) {
            this.products.set(product.id, product);
            this.updateTotalAmount();
          }
        });
    } else {
      this.updateTotalAmount();
    }
  }

  removeProduct(index: number): void {
    if (index < 0 || index >= this.productIdsForm.length) {
      console.error('Invalid product index:', index);
      return;
    }
    
    this.productIdsForm.removeAt(index);
    this.updateTotalAmount();
  }

  updateTotalAmount(): void {
    let total = 0;
    const productIds = this.productIdsForm.value;
    
    productIds.forEach((id: number) => {
      const product = this.products.get(id);
      if (product && product.price) {
        total += product.price;
      }
    });
    
    this.orderForm.patchValue({ totalAmount: total });
    console.log('Updated total amount:', total);
  }

  getProductName(id: number): string {
    const product = this.products.get(id);
    return product ? product.title : `Product #${id}`;
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      console.error('Form is invalid:', this.orderForm.errors);
      // Mark all fields as touched to show validation errors
      Object.keys(this.orderForm.controls).forEach(key => {
        const control = this.orderForm.get(key);
        control?.markAsTouched();
      });
      
      alert('Please fill out all required fields correctly.');
      return;
    }
    
    const updatedOrder: Order = this.orderForm.value;
    
    // Ensure date is in the right format
    if (typeof updatedOrder.date === 'string' && updatedOrder.date.includes('T')) {
    }
    
    console.log('Submitting updated order:', updatedOrder);
    this.store.dispatch(updateOrder({ order: updatedOrder }));
    
    // Navigate back to orders list
    this.router.navigate(['/orders']);
  }

  cancel(): void {
    this.router.navigate(['/orders']);
  }
}