"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
// 侦听鼠标点击事件 js 版本
document.addEventListener('click', function () { return console.log('Clicked!'); });
//rxjs 版本
rxjs_1.fromEvent(document, 'click').subscribe(function () { return console.log('Clicked!'); });
