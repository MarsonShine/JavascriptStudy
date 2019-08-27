# 简介

RxJS 是组合异步以及基于事件的使用可观察者序列的程序类库。它提供一个核心类型，[Observable](https://rxjs.dev/guide/observable)，附属类型（Observer,Schedulers,Subjects）并且受到了数组额外操作（map,filter,reduce,every 等等）启发来将异步事件作为集合来处理。

> 可以理解为 RxJS 就是事件的 Loadsh

ReactiveX 结合了观察者模式，迭代模式以及集合式的函数事编程来满足对管理事件的需求。

RxJS 解决异步事件的管理的基本概念是：

- Observable（可观察的）：表示可调用的值或事件的集合
- Observer（观察者）：回调的集合，它知道怎么去监听 Observable 派送（传递）的值
- Subscription（订阅）：表示 Observable 的执行，主要的用途取消执行
- Operators（操作者）：是一个纯粹的功能，它以一种函数式编程风格来处理集合的操作，就像数组的 `map,concat,filter,reduce` 等等
- Subject（主题）：这个等价于一个事件触发器（EventEmitter），只能以多播的方式传递值或事件给多个多个观察者（Observers）
- Schedulers（调度者）：是控制并发的集中式调度程序，允许我们调节当电脑发生了如 `setTimeout` 或是 `requestAnimationFrame` 以及其他的时候

# 第一个例子

你一般注册的一个事件侦听是这样的：

```js
document.addEventListener('click', () => console.log('Clicked!'));
```

使用 RxJS 你可以创建一个可观察的对象来替代：

```javascript
import { fromEvent } from 'rxjs';
fromEvent(document, 'click').subscribe(() => console.log('Clicked!'));
```

# 纯粹（Purity）

RxJS 之所以强大，是因为它能使用纯函数来生成值。也就是说你的代码很少发生错误。

通常你会新建一个非纯函数，在你的代码片段里面会混乱你自己的状态

```javascript
let count = 0;
document.addEventlistener('click', () => console.log(`Clicked ${++count} times`));
```

而 RxJS 会隔离你的状态

```javascript
import { fromEvent } from 'rxjs';
import { scan } from 'rxjs/operators';

fromEvent(document, 'click')
	.pipe(scan(count => count + 1, 0))
	.subscribe(count => console.log(`Click ${count} times`));
```

scan 操作的工作就像数组的 reduce 一样。它会传递一个值给回调函数。回调函数会返回一个值，并且返回的值将成为下一次回调运行传递的下一个值。

# 流（Flow）

RxJS 有一个完整的操作符，它们都能帮助你通过你的 ovservables 控制事件流。

下面这段代码就是展示你将允许每秒最多一次点击之后，用原生 javascript

```javascript
let count = 0;
let rate = 1000;
let lastClick = Date.now() - rate;
document.addEventListener('click', () => {
    if(Date.now() - lastClick >= rate){
        console.log(`Click ${++count} times`);
        lastChild = Date.now();
    }
});
```

 RxJS：

```javascript
import { fromEvent } from 'rxjs';
import { throttleTime, scan } from 'rxjs/operators';

fromEvent(document, 'Click')
	.pipe(
		throttleTime(1000),
		scan(count => count + 1, 0)
	)
	.subscribe(count => console.log(`Click ${count} times`));	
```

还有其他的流控制像 `filter,delay,debounceTime,take,takeUtil,distinct,distinctUntilChanged` 等等。

# 值

你可以在你自己的可观察对象之间传递值

这里告诉你怎么在每次点击的时候加当前鼠标的 x 坐标，用 javascript 代码：

```javascript
let count = 0;
const rate = 1000;
let lastClick = Date.now() - rate;
document.addEventListener('click', event => {
  if (Date.now() - lastClick >= rate) {
    count += event.clientX;
    console.log(count);
    lastClick = Date.now();
  }
});
```

用 RxJS：

```javascript
import { fromEvent } from 'rxjs';
import { throttleTime, map, scan } from 'rxjs/operators';

fromEvent(documeht, 'click')
	.pipe(
		throttleTime(1000),
    	map(event => event.clientX),
    	scan((count, clientX) => count + clientX, 0)
	)
	.subscribe(count => console.log(count));
```

其他产生值的操作还有 `pluck,pairwise,sample` 等