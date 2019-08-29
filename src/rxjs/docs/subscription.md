# 订阅（Subscription）

什么是订阅？订阅是一个对象，它表示一个处理完就释放（disposable）的资源，是 Observable 的一个执行程序。订阅有一个很重要的方法，`unsubscribe`，它是无参的，只是处理订阅的资源。在上个版本的 RxJS，Subscription 又叫 “Disposable”。

```javascript
import { interval } from 'rxjs';

const observable = interval(1000);
const subscription = observable.subscribe(x => console.log(x));
// 然后：
// 这个取消通过观察者订阅正在开始执行的 Observable
subscription.unsubcribe();
```

> 一个订阅实质上仅仅有一个 `unsubscribe()` 函数释放资源或取消 Observable 的执行。

订阅还是放在一起，以至于可以调用一个 `unsubscribe()` 函数释放多个订阅。你也可以通过 “adding” 把其中一个订阅添加到其他的订阅中：

```javascript
import { interval } from 'rxjs';

const observable1 = interval(400);
const observable2 = interval(300);

cosnt subscription = observable1.subscribe(x => console.log('first: ' + x));
const childSubscription = observable2.subscribe(x => console.log('second: ' + x));

subscription.add(childSubscription);

setTimeout(() => {
    //取消订阅 subscription 以及 childSubscription
    subscription.unsubscribe();
}, 1000);
```

当运行的时候，我们会看到如下结果：

```
second: 0
first: 0
second: 1
first: 1
second: 2
```

订阅（Subscription）也有一个 `remove(otherSubscription)` 方法，是为了从它的子订阅中移除。