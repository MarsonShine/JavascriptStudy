import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { products } from 'src/app/services/products';

@Component({
  selector: 'app-productDetail',
  templateUrl: './productDetail.component.html',
  styleUrls: ['./productDetail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product;
  constructor(
    private route: ActivatedRoute,  //route 包含路由信息，参数，额外分配的数据
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.product = products[+params.get('productId')];
    })

    //获取路由配置数据
    this.route.data.subscribe(p => {
      console.log(`来自 app-routing.module.ts 的数据 ${p.title}`);
    })
  }

}
