import { Component, OnInit } from '@angular/core';
import { products } from 'src/app/services/products';

@Component({
  selector: 'app-productDetail',
  templateUrl: './productDetail.component.html',
  styleUrls: ['./productDetail.component.css']
})
export class ProductDetailComponent implements OnInit {
  products = products;
  constructor() { }

  ngOnInit() {
  }

}
