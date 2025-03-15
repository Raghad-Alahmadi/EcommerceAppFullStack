import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../store/product.reducer';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private isBrowser: boolean;

  cart$ = this.cartSubject.asObservable();
  
  // Observable for cart count
  cartCount$ = this.cart$.pipe(
    map(items => items.reduce((total, item) => total + item.quantity, 0))
  );
  
  // Observable for cart total price
  cartTotal$ = this.cart$.pipe(
    map(items => items.reduce((total, item) => total + (item.product.price * item.quantity), 0))
  );

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      this.loadCartFromStorage();
    }
  }

  private loadCartFromStorage(): void {
    if (this.isBrowser) {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        try {
          this.cartItems = JSON.parse(savedCart);
          this.cartSubject.next([...this.cartItems]);
        } catch (e) {
          console.error('Error parsing cart data from localStorage', e);
          this.cartItems = [];
          this.cartSubject.next([]);
        }
      }
    }
  }

  private saveCartToStorage(): void {
    if (this.isBrowser) {
      localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    }
  }

  getCart(): CartItem[] {
    return this.cartItems;
  }

  addToCart(product: Product): void {
    // Check if product already in cart
    const existingItem = this.cartItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      // Increment quantity if product already in cart
      existingItem.quantity += 1;
    } else {
      // Add new product to cart
      this.cartItems.push({ product, quantity: 1 });
    }
    
    this.cartSubject.next([...this.cartItems]);
    this.saveCartToStorage();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item) {
      item.quantity = quantity;
      this.cartSubject.next([...this.cartItems]);
      this.saveCartToStorage();
    }
  }

  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
    this.cartSubject.next([...this.cartItems]);
    this.saveCartToStorage();
  }

  clearCart(): void {
    this.cartItems = [];
    this.cartSubject.next([]);
    
    if (this.isBrowser) {
      localStorage.removeItem('cartItems');
    }
  }
}