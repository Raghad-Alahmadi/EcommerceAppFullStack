import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../store/product.reducer';
import * as ProductActions from '../../store/product.actions';
import * as ProductSelectors from '../../store/product.selectors';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add RouterModule for [routerLink]
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  // Original selectors
  private allProducts$: Observable<Product[]>;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  
  // Filter subjects
  private searchTerm$ = new BehaviorSubject<string>('');
  private categoryFilter$ = new BehaviorSubject<string>('');
  
  // Filtered products
  products$: Observable<Product[]>;

  constructor(
    private store: Store,
    private cartService: CartService
  ) {
    // Get base observables from store
    this.allProducts$ = this.store.select(ProductSelectors.selectAllProducts);
    this.loading$ = this.store.select(ProductSelectors.selectProductsLoading);
    this.error$ = this.store.select(ProductSelectors.selectProductsError);
    
    // Create filtered products observable
    this.products$ = combineLatest([
      this.allProducts$, 
      this.searchTerm$, 
      this.categoryFilter$
    ]).pipe(
      map(([products, searchTerm, category]) => {
        return this.filterProducts(products, searchTerm, category);
      })
    );
  }

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());
  }

  // Add to cart method
  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <i class="bi bi-check-circle-fill"></i>
        <span>Added to cart: ${product.title}</span>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    // Set a timeout to remove the notification
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300); // Wait for fade out animation
    }, 3000);
  }
  
  // Filter methods
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm$.next(input.value.toLowerCase());
  }
  
  onFilterCategory(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.categoryFilter$.next(select.value);
  }
  
  clearFilters(): void {
    this.searchTerm$.next('');
    this.categoryFilter$.next('');
    
    // Reset the DOM elements too
    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    const categorySelect = document.querySelector('.category-select') as HTMLSelectElement;
    
    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = '';
  }
  
  // filter products
  private filterProducts(products: Product[], searchTerm: string, category: string): Product[] {
    return products.filter(product => {
      // Apply search term filter
      const matchesSearch = searchTerm ? 
        product.title.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm) : 
        true;
      
      // Apply category filter
      const matchesCategory = category ? product.category === category : true;
      
      return matchesSearch && matchesCategory;
    });
  }
}