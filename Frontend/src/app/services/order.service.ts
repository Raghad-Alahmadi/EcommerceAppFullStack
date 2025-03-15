import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Order } from '../store/order/order.reducer';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:5001/api/Orders';
  
  constructor(private http: HttpClient) {}
  
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }
  
  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }
  
  updateOrder(order: Order): Observable<Order> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    
    const updatedOrder = {
      ...order,
      date: order.date
    };
    
    console.log(`Sending PUT request to ${this.apiUrl}/${order.id}`);
    console.log('Request payload:', updatedOrder);
    
    return this.http.put<Order>(`${this.apiUrl}/${order.id}`, updatedOrder, httpOptions)
      .pipe(
        tap(
          response => console.log('PUT response:', response),
          error => console.error('PUT error:', error)
        )
      );
  }
  
  deleteOrder(orderId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${orderId}`);
  }
}