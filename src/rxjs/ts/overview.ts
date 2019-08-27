import { fromEvent } from "rxjs";
// 侦听鼠标点击事件 js 版本
document.addEventListener('click', () => console.log('Clicked!'));

//rxjs 版本
fromEvent(document, 'click').subscribe(() => console.log('Clicked!'));