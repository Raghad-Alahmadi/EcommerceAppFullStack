import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../store/product/product.reducer';
import * as ProductActions from '../../store/product/product.actions';
import { selectAllProducts, selectProductsLoading, selectProductsError } from '../../store/product/product.selectors';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  showForm = false;
  
  // Add tracking for the product being edited
  currentProductId: number | null = null;
  
  // Product listing properties
  products: Product[] = [];
  filteredProducts: Product[] = [];
  
  // Loading and error states
  loading = false;
  error: string | null = null;
  
  // Filter properties
  searchTerm: string = '';
  selectedCategory: string = '';
  sortBy: string = 'price-asc';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  constructor(
    private fb: FormBuilder, 
    private store: Store,
    private cartService: CartService
  ) {
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      category: ['', Validators.required],
      image: ['', Validators.required],
      rate: ['', [Validators.required, Validators.min(0), Validators.max(5)]],
      count: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Load products from store
    this.store.dispatch(ProductActions.loadProducts());
    
    // Get products and loading state
    this.store.pipe(select(selectAllProducts)).subscribe(products => {
      this.products = products;
      this.applyFilters();
    });
    
    // Monitor loading state
    this.store.pipe(select(selectProductsLoading)).subscribe(isLoading => {
      this.loading = isLoading;
    });
    
    // Monitor error state
    this.store.pipe(select(selectProductsError)).subscribe(error => {
      this.error = error;
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    
    // Reset form and currentProductId when closing the form
    if (!this.showForm) {
      this.productForm.reset();
      this.currentProductId = null;
    }
  }

  editProduct(product: Product): void {
    // Store the ID of product being edited
    this.currentProductId = product.id;
    
    // Fill the form with product data
    this.productForm.patchValue({
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
      rate: product.rate,
      count: product.count
    });
    
    // Show the form
    this.showForm = true;
  }

  deleteProduct(id: number): void {
    // Confirm before deletion
    if (confirm('Are you sure you want to delete this product?')) {
      this.store.dispatch(ProductActions.deleteProduct({ productId: id }));
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      
      // Create the product object from form values
      const productData = {
        title: formValue.title,
        price: formValue.price,
        description: formValue.description,
        category: formValue.category,
        image: formValue.image,
        rate: formValue.rate,
        count: formValue.count
      };
      
      // Check if we're editing or creating a new product
      if (this.currentProductId !== null) {
        // Update existing product
        const updatedProduct: Product = {
          ...productData,
          id: this.currentProductId
        };
        
        this.store.dispatch(ProductActions.updateProduct({ product: updatedProduct }));
      } else {
        this.store.dispatch(ProductActions.addProduct({ product: productData as Product }));
      }
      
      this.productForm.reset();
      this.showForm = false;
      this.currentProductId = null;
    } else {
      this.productForm.markAllAsTouched();
      console.log('Form is invalid');
    }
  }

  // Filter methods
  applyFilters(): void {
    let filtered = [...this.products];

    // Apply search term filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(term) || 
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(product => 
        product.category === this.selectedCategory
      );
    }

    // Apply price range filter
    if (this.minPrice !== null) {
      filtered = filtered.filter(product => product.price >= this.minPrice!);
    }
    if (this.maxPrice !== null) {
      filtered = filtered.filter(product => product.price <= this.maxPrice!);
    }

    // Apply sorting
    switch (this.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rate - a.rate);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    this.filteredProducts = filtered;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.sortBy = 'price-asc';
    this.minPrice = null;
    this.maxPrice = null;
    this.applyFilters();
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }
}