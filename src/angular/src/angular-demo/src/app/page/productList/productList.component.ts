import { Component, OnInit } from '@angular/core';
import { products } from 'src/app/services/products';


@Component({
  selector: 'app-productList',
  templateUrl: './productList.component.html',
  styleUrls: ['./productList.component.css']
})
export class ProductListComponent implements OnInit {
  products = products;

  constructor() { }

  ngOnInit() {
  }

  share() {
    alert('产品分享成功');
  }

  onNotify() {
    alert('得到通知');
  }
}
