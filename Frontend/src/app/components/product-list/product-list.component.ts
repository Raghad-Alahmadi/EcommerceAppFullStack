import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Product } from '../../store/product.reducer';
import * as ProductActions from '../../store/product.actions';
import * as ProductSelectors from '../../store/product.selectors';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products$: Observable<Product[]>;
  loading$: Observable<boolean>;
  error$: Observable<any>;

  constructor(private store: Store) {
    this.products$ = this.store.select(ProductSelectors.selectAllProducts);
    this.loading$ = this.store.select(ProductSelectors.selectProductsLoading);
    this.error$ = this.store.select(ProductSelectors.selectProductsError);
  }

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());
  }

  addProduct(product: Product): void {
    this.store.dispatch(ProductActions.addProduct({ product }));
  }

  deleteProduct(productId: number): void {
    this.store.dispatch(ProductActions.deleteProduct({ productId }));
  }
}