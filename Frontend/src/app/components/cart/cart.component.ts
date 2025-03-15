import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CartService, CartItem } from '../../services/cart.service';
import { Observable } from 'rxjs';
import { Order } from '../../store/order/order.reducer';
import * as OrderActions from '../../store/order/order.actions';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  cartItems$: Observable<CartItem[]>;
  cartTotal$: Observable<number>;
  cartCount$: Observable<number>;

  constructor(private cartService: CartService, private store: Store, private router: Router) {
    this.cartItems$ = this.cartService.cart$;
    this.cartTotal$ = this.cartService.cartTotal$;
    this.cartCount$ = this.cartService.cartCount$;
  }

  updateQuantity(productId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const quantity = parseInt(input.value);
    
    if (quantity >= 0) {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  incrementQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id, item.quantity + 1);
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.product.id, item.quantity - 1);
    } else {
      this.removeItem(item.product.id);
    }
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  checkout(): void {
    // Check if cart is empty
    const cart = this.cartService.getCart();
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }
  
    // Create an order from the cart items
    const order: Order = {
      id: 0, 
      productIds: cart.map(item => item.product.id),
      totalAmount: cart.reduce((total, item) => total + (item.product.price * item.quantity), 0),
      date: new Date().toISOString(),
      status: 'pending'
    };
  
    console.log('Creating order:', order); // Log the order
  
    // Dispatch the create order action
    this.store.dispatch(OrderActions.createOrder({ order }));
  
    // Clear cart after successful checkout
    this.cartService.clearCart();
  
    // Navigate to the order page
    this.router.navigate(['/orders']);
  }
}