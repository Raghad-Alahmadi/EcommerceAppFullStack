import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { Product } from '../../store/product.reducer';
import * as ProductActions from '../../store/product.actions';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
  
})
export class ProductFormComponent {
  productForm: FormGroup;

  constructor(private fb: FormBuilder, private store: Store) {
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      category: ['', Validators.required],
      image: ['', Validators.required],
      rating: this.fb.group({
        rate: ['', [Validators.required, Validators.min(0), Validators.max(5)]],
        count: ['', [Validators.required, Validators.min(0)]]
      })
    });
  }
showForm = false;

toggleForm(): void {
  this.showForm = !this.showForm;
}
  onSubmit(): void {
    if (this.productForm.valid) {
      const product: Product = this.productForm.value;
      this.store.dispatch(ProductActions.addProduct({ product }));
      this.productForm.reset(); // Reset the form after submission
    } else {
      // Mark all controls as touched to trigger validation messages
      this.productForm.markAllAsTouched();
      console.log('Form is invalid');
    }
  }
}