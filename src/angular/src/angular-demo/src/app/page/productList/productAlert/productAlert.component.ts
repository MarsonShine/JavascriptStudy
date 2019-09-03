import { Component, OnInit } from '@angular/core';
import { Input } from "@angular/core";
import { Output, EventEmitter } from "@angular/core";

@Component({
  selector: 'app-productAlert',
  templateUrl: './productAlert.component.html',
  styleUrls: ['./productAlert.component.css']
})
export class ProductAlertComponent implements OnInit {
  @Input() product;
  @Output() notify = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

}
