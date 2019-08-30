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

通过上面的方法，本质上我们就仅仅只是通过 Subject 把单播的可观察的执行转成了多播的。这个例子演示了主题如何让多个观察者共享 Observable 的执行的唯一方法。

这里还有一些特殊的 Subject 类型：`BehaviorSubject`，`ReplaySubject`，`AsyncSubject`。

# 多播 Observables

一个 “多播Observable” 通过一个 Subject 传递通知，它可能会有很多订阅者，而一个普通的 “单播 Observable” 只会发送通知到单个观察者。

> 一个多播 Observable 在后台（hood） 用一个 Subject 让多个观察者都能看到相同的 Observable 执行。

在后台，`multicast` 又是如何工作的呢：观察者订阅一个基础的 Subject，并且这个 Subject 订阅了源 Observable。下面的例子跟上面的例子很相似，它使用了 `observable.subscribe(subject)` ：

```javascript
import { from, Subject } from 'rxjs';
import { multicast } from 'rxjs/operators';

const source = from([1, 2, 3]);
const subject = new Subject();
const multicasted = source.pipe(multicast(subject));

//这里在后台就是 `subject.subscribe({...})`
multicasted.subscribe({
    next: (v) => console.log(`observableA: ${v}`);
});
multicasted.subscribe({
    next: (v) => console.log(`observableB: ${v}`);
});

//这个带后台就是 `source.subscribe(subject)`
multicasted.connect();
```

`multicast` 返回一个看起来想平常使用的 Observable，但是工作却像 Subject，当它订阅的时候。`multicast` 返回的实际是 `ConnectableObservable`，它只是一个使用 `connect()` 方法的 Observable。

当那些共享的 Observable 的执行开始执行的时候 `connect()` 方法明确执行是非常重要的。因为 `connect()` 会在后台执行 `source.subscribe(subject)`，`connect()` 返回一个 Subscription，它使你能够取消订阅，从而取消那些共享的 Observable 的执行。

# 引用计数（Reference counting）

手动调用 `connect()` 处理订阅（Subscription）是很麻烦的。通常，我们想要当第一个观察者（Observer）到达的时候自动连接，以及当最后一个观察者取消订阅的时候自动取消公共的执行。

考虑下面例子，它的订阅按此列表概述的发生：

1. 第一个观察者订阅多播 Observable
2. 多播 Observable 连接
3. `next` 发送值 0 给第一个观察者
4. 第二个观察者订阅多播 Observable
5. `next` 发送值 1 给第一个观察者
6. `next` 发送值 1 给第一个观察者
7. 第一个观察者从多播 Observable 取消订阅
8. `next` 发送值 2 给第二个观察者
9. 第二个观察者从多播 Observable 取消订阅
10. 连接的多播 Observable 取消订阅

为了达成上述过程，显示调用 `connect()`，我们编写如下代码：

```javascript
import { interval, Subject } from 'rxjs';
import { multicast } from 'rxjs/operators';

const source = interval(500);
const subject = new Subject();
const multicasted = source.pipe(multicast(subject));
let subscription1, subscription2, subscriptionConnect;

subscription1 = multicasted.subscribe({
    next: (v) => console.log(`observableA: ${v}`)
});
//这里应该调用 `connect()`，因为第一个订阅者订阅了 `multicasted`,它正在对消费的值感兴趣
subscriptionConnect = multicasted.connect();

setTimeout(() => {
    subscription2 = multicasted.subscribe({
        next: (v) => console.log(`observableB: ${v}`)
    });
},600);

setTimeout(() => {
    subscription1.unsubsribe();
},1200);

//这里我们应该取消订阅公共的 Observable 的执行
setTimeout(() => {
    subscription2.unsubscribe();
    subscriptionConnect.unsubscribe();	//这个是针对公共的 Observable 的执行
}, 2000);
```

如果我们希望避免显示调用 `connect()`，我们可以使用 `ConnectableObservable.refCount()` （引用计数）方法，它返回一个 Observable，而且它还是可以追踪它有的所有订阅者。当订阅者们的这个数字从 0 增到 1，它就会自动调用 `connect()`，开始公共的执行。只有当计数从 1 到 0 时才会整个取消订阅，停止所有的执行。

> *refCount* 使多播 Observable 当第一个订阅者到达的时候自动开始执行，并且最后一个离开的时候停止执行。

下面是例子：

```javascript
import { interval, Subject } from 'rxjs';
import { multicast, refCount } from 'rxjs/operators';
 
const source = interval(500);
const subject = new Subject();
const refCounted = source.pipe(multicast(subject), refCount());
let subscription1, subscription2;

//这里自动调用 `connect()`，因为第一个 ‘refCounted’ 的订阅者
console.log('observerA subscribed');
subscription1 = refCounted.subscribe({
    next: (v) => console.log(`observableA: ${v}`)
});

sutTimeout(() => {
    console.log('observerB subscribed');
    subscription2 = refCounted.subscribe({
        next: (v) => console.log(`observableB ${v}`)
    });
}, 600);

setTimeout(() => {
    console.log('observerA unsubscribed');
    subscription1.unsubscribe();
}, 1200);

//这里公共的 Observable 的执行将会停止，因为 'refCounted' 在这之后没有订阅者了
setTimeout(() => {
    console.log('observerB unsubscribed');
    subscription2.unsubscribe();
}, 2000);

//Logs
// observerA subscribed
// observerA: 0
// observerB subscribed
// observerA: 1
// observerB: 1
// observerA unsubscribed
// observerB: 2
// observerB unsubscribed
```

`refCounted()` 方法只存在于 `ConnectableObservable` 对象中，并且它返回的是一个 Observable 而不是 `ConnectableObservable`。

# 行为主题（BehaviorSubject）

有一个 Subjects 的变体就是 `BehaviorSubject`，它有一个 “当前值” 的概念。它会存储最近的发送给消费者的一个值，无论这个新的观察者是否订阅，它都将会立即从 `BehaviorSubject` 接收这个 “当前值”。

> BehaviorSubject 对于表示 “过程值（values over time）” 是很有用的。例如一个表示生日的事件流是一个 Subject，那么这个人的年龄的流将是一个 BehaviorSubject

看下面的例子，BehaviorSubject 初始化为 0，它在第一个观察者接收这个值的时候开始订阅。第二个观察者接收值 2，即使它在这个值 2 发送之后被订阅的。

```javascript
import { BehaviorSubject } from 'rxjs';
const subject = new BehaviorSubject(0);

subject.subject({
    next: (v) => console.log(`observerA: ${v}`)
});

subject.next(1);
subject.next(2);

subject.subscribe({
    next: v => console.log(`observerB: ${v}`)
});

subject.next(3);

// Logs
// observerA: 0
// observerA: 1
// observerA: 2
// observerB: 2
// observerA: 3
// observerB: 3
```

# 重播主题（ReplaySubject）

应答主题很像 `BehaviorSubject`，它能发送旧的值给新的订阅者，但是它也能记录部分 Observable 的执行。

> ReplaySubject 从 Observable 的执行中记录多个值并且重新把这些值发送给新的订阅者

当创建一个 `ReplaySubject` 时，你可以指定这些如何重播：

```javascript
import { ReplaySubject } from 'rxjs';
const subject = new ReplaySubject(3); // 缓冲 3 个值给新的订阅者

subject.subscribe({
    next: v => console.log(`observerA: ${v}`)
});

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe({
    next: v => console.log(`observerB: ${v}`)
});

subject.next(5);

// Logs:
// observerA: 1
// observerA: 2
// observerA: 3
// observerA: 4
// observerB: 2
// observerB: 3
// observerB: 4
// observerA: 5
// observerB: 5
```

你也可以缓存大小里指定一个窗口时间，来确定记录那些值的年龄。在下面的代码中，我们使用 100 大小的缓冲，但是窗口时间参数是 500 毫秒。

```javascript
import { ReplaySubject } from 'rxjs';
const subject = new ReplaySubject(100, 500 /* 窗口时间 */);

subject.subscribe({
    next: v => console.log(`observerA: ${v}`)
});

let i = 1;
setInterval(() => subject.next(i++), 200);

setTimeout(() => {
    subject.subscribe({
        next: v => console.log(`observerB: ${v}`)
    })
}, 1000);

// Logs
// observerA: 1
// observerA: 2
// observerA: 3
// observerA: 4
// observerA: 5
// observerB: 3
// observerB: 4
// observerB: 5
// observerA: 6
// observerB: 6
// ...
```

# 异步主题（AsyncSubject）

AsyncSubject 是一个变体，它只会发送 Observable 的执行的最后一个值给观察者们，并且只当执行完成的时候。

```javascript
import { AsyncSubject } from 'rxjs';
const subject = new AsyncSubject();

subject.subscribe({
    next: (v) => console.log(`observerA: ${v}`)
})

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`)
});

subject.next(5);
subject.complete();

// Logs:
// observerA: 5
// observerB: 5
```

AsyncSubject  跟 `last()` 操作符相似，它等待 `complete` 通知以便于发送一个值。