# 主题（Subjects）

什么是主题？RxJS 主题就是一个特性类型的 Observable 对象，它允许值多路广播给观察者（Observers）。当一个简单的 Observable 是单播的（每个订阅的观察者它们自己都依赖 Observable 的执行）时候，主题（Subjects）就是多播的。

> Subjects 就像是一个 Observable，但是它能多播到多个观察者（Observers）。Subjects 就像是事件发射器：它们维护众多侦听者的注册。

每一个 Subject 都是一个 Observable。给定一个 Subject，你就能订阅它，提供一个 Observer，开始正常接收值。从 Observer 它的角度讲，它不知道 Observable 的执行是否来自普通的单播 Observable 或是 Subject 。

在 Subject 内部，`subscribe` 不会调用新的执行来发送值。它只是简单的在观察者列表中注册一个观察者，跟在其他库和语言中的 `addListener` 的做法是很相似的。

每个 Subject 也是一个 Observer。它通过 `next(v)`，`error(e)`，`complete()` 是一个对象。为了给 Subject 提供一个新值，只需要调用 `next(theValue)`，那么它将会多播给注册侦听到 Subject 的观察者。

下面是一个例子，我们有附加了两个观察者对象，并且我们发送一些值给 Subject：

```javascript
import { Subject } from 'rxjs';

const subject = new Subject<number>();

subject.subscribe({
    next: (v) => console.log(`observerA: ${v}`)
});
subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`)
});
subject.next(1);
subject.next(2);

//Logs:
// observerA: 1
// observerB: 1
// observerA: 2
// observerB: 2

```

因为 Subject 是一个观察者，也就是说你也许会提供一个 Subject 作为参数给 `subscribe` 到任何 Observable，就像下面这个例子：

```javascript
import { Subject, from } from 'rxjs';
 
const subject = new Subject<number>();

subject.subscribe({
    next: (v) => console.log(`observerA: ${v}`)
})
subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`)
});
 
const observable = from([1, 2, 3]);
 
observable.subscribe(subject); // 你可以订阅已经提供的 observable 对象

// Logs:
// observerA: 1
// observerB: 1
// observerA: 2
// observerB: 2
// observerA: 3
// observerB: 3
```

