import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { OrderComponent } from './components/order/order.component';
import { CartComponent } from './components/cart/cart.component';
import { OrderEditComponent } from './components/order-edit/order-edit.component';

export const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'products', component: ProductListComponent },
  { path: 'add-product', component: ProductFormComponent },
  { path: 'orders', component: OrderComponent },
  { path: 'orders/:id/edit', component: OrderEditComponent },
  { path: 'cart', component: CartComponent },
  
  { path: '**', redirectTo: '/products' }
];