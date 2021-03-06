# 可观察的（Observable）

可观察集合（Observables）是多值懒推送集合。它们填补了下面表格的空白：

|      | SINGLE   | MULTIPLE   |
| ---- | -------- | ---------- |
| Pull | Function | Iterator   |
| Push | Promise  | Observable |

举个例子，下面是一个可观察对象，当它被订阅的时候立即推送值 1,2,3，并且值 4 在订阅调用之后的一秒传递过去，然后完成：

```javascript
import { Observable } from 'rxjs';

const Observable = new Observable(subscriber => {
    subscripber.next(1);
    subscripber.next(2);
    subscripber.next(3);
    setTimeout(() => {
        subscripber.next(4);
        subscripber.complete();
    }, 1000);
});
```

为了调用 Observable 以及看到这些值，我们需要订阅它：

```javascript
import { Observable } from 'rxjs';

const observable = new Observable(subscriber => {
    subscripber.next(1);
    subscripber.next(2);
    subscripber.next(3);
    setTimeout(() => {
        subscripber.next(4);
        subscripber.complete();
    }, 1000);
});

console.log('just before subscribe');
observable.subscribe({
    next(x) { console.log('got value '+ x); },
    error(err) { console.log('something wrong occurred: ' + err); },
    complete() { console.log('done'); }
});
console.log('just after subscribe');
```

它执行会打印如下内容：

```c
just before subscribe
got value 1
got value 2
got value 3
just after subscribe
got value 4
done
```

# Pull vs Push

`Pull` 和 `Push` 是两个不同的协议，他们描述了数据生产者如何与数据消费者通信。

什么是 `Pull`？在 Pull 系统，消费者决定何时从数据生产者接收数据。生产者自己也不知道数据什么时候推送给消费者。所有的 javascript 函数都是一个 Pull 系统。函数是数据的生产者，并且这个调用函数的代码通过从它调用中“提取（pulling）”一个返回值来消耗数据。

ES2015 介绍了[生成器函数和迭代器](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) （function*	）其他类型的 Pull 系统。调用 `iterator.next` 的代码是消费者，从迭代器（生产者）中 “提取” 出多个值。

|      | Producer                   | Consumer               |
| ---- | -------------------------- | ---------------------- |
| Pull | 被动：请求时生成数据       | 主动：决定数据何时请求 |
| Push | 主动：在自己的空间生成数据 | 被动：响应接收到的数据 |

什么是 Push？Push 系统，生成者决定何时发送数据给消费者。消费者是不知道数据是何时接收的。

在如今的 javascript 中 Pull 系统中最通用的类型是 Promises。一个 Promise（生产者）派送一个被解析的值到已经注册的回调函数（消费者）中，但是不像函数，Promise 它负责准确的确定这个值何时被 “推送” 到回调函数。

RxJS 介绍了 Observables，新的 Push 系统。一个可观察的对象是多个值的生产者，“推送” 他们到 Observables（消费者）。

- 函数是一种延迟计算，调用同步返回一个值
- 生成器是一种延迟计算，在迭代中同步返回 0 到 无穷值（可能的）。
- Promise 是一个计算，它可能（也有能不会）最后返回一个值
- Observable 是一个延迟计算的，它能同步或异步返回 0 到 无穷值（可能）从它们被调用的那刻开始

# Observables 函数一般化

与流行的说法相反，Observables 不像事件驱动器那样，也不像多个值的 Promise。Observables 也许行为像事件驱动器在有些例子中，即在他们使用 RxJS Subjects 多播时，通常它们不像事件驱动。

> Observables 像一个无参的函数，但是它们允许生成多个值。

考虑下面代码：

```javascript
function foo()
{
    console.log('Hello');
    return 42;
}

const x = foo.call();	//same as foo()
console.log(x);
const y = foo.call();
console.log(y);
```

我们期望能看到如下输出：

```c
"Hello"
42
"Hello"
42
```

你可以根据上面的行为用 Observables 写相同的行为：

```javascript
import { Observable } from 'rxjs';
const foo = new Observable(subscriber => {
    console.log('Hello');
    subscriber.next(42);
});

foo.subscriber(x => {
    console.log(x);
});
foo.subscriber(y => {
    console.log(y);
});
```

同样会有相同的输出：

```c#
"Hello"
42
"Hello"
42
```

这两个函数发生的都是延迟计算。如果你不调用函数，`console.log('Hello')` 是不会触发的。Observables 同样也是如此，如果你不 “call” 它（通过 `subscribe`）`console.log('Hello')` 将不会触发。另外，“calling” 或者 “subscribing” 是一个隔离的操作：两个函数调用触发两个独立的副作用，并且两个 Observable 订阅触发两个副作用。与此相反，事件驱动器它会共享副作用，并且无论订阅存不存在都会执行，Observable 不会共享执行并都是延迟的。

> 订阅（Subscribing）一个可观察的对象（Observable）跟调用一个函数是类似的。

Observable 和 函数之间的区别是什么呢？Observable 能随着时间返回多个值，还有一些是函数不能做的。比如你不能这么做：

```javascript
function foo()
{
    console.log('hello');
    return 42;
    return 100;	//死代码。永远不会发生这行
}
```

函数只能返回一个值。Observable 就能做到这个：

```javascript
import { Observable } from 'rxjs';

const foo = new Observable(subscribe => {
    console.log('Hello');
    subscriber.next(42);
    subscriber.next(100);	//返回值
    subscriber.next(200);	//同样还是返回值
})

console.log('before');
foo.subscribe(x => {
    console.log(x);
});
console.log('after');
```

同步输出：

```c#
"before"
"before"
42
100
200
"after"
```

你也能异步返回这些值：

```c#
import { Observable } from 'rxjs';

const foo = new Observable(subscriber => {
    console.log('hello');
    subscriber.next(42);
  	subscriber.next(100);
  	subscriber.next(200);
    setTimeout(() => {
        subscriber.next(300);	//异步
    },1000);
});

console.log('before');
foo.subscribe(x => {
  console.log(x);
});
console.log('after');
```

输出：

```
"before"
"Hello"
42
100
200
"after"
300
```

**结论：**

- `func.call()` 意思是说 “同步给我一个值”
- `observable.subscribe()` 意思是说 “给我任何数值，不管同步还是异步”

# 深入解析 Observable

Observables 是通过 `new Observable` 或一个创建操作符建立的，由观察者订阅，执行去推送 `next / error / complete` 通知到观察者（Observer），并且他们的执行也许会被处理。这里有 4 个方面都编码在可观察的（Observable）实例对象中，但是有一些方面与其他类型相关，比如 Observer 和 Subscription。

核心的 Observable 概念如下：

- 创建可观察的（Observables）对象
- 订阅 Observables
- 执行 Observables
- 释放 Observables

## 创建 Observables

`Observable` 有个带一个参数的构造函数：`subscribe` 函数。

下面的例子是创建一个 Observable，来向订阅者每秒发送一个字符串 ‘hi’。

```javascript
import { Observable } from 'rxjs';

const observable = new Observable(subscribe => {
    const id = setInterval(() => {
        subscribe.next('hi')
    },1000);
});
```

> Observables 能通过实例化创建。但是多数情况下，observables 都是通过使用创建函数创建的，比如 `of,from,interval` 等。

在上面的例子，`subscribe` 函数部分来订阅 Observable 是最重要的。让我们来看看订阅者订阅的意思。

## 订阅 Observables

Observable 的实例对象 `observable` 在例子中能够被订阅，像这样：

```javascript
observable.subscribe(x => console.log(x));
```

`observable.subscribe` 和 在实例化 `new Observable(function subscribe(subscriber){...})` 中的 `subscribe` 有相同的名字这不是巧合。在库中，它们是不同的，出于特定目的你可以考虑他们的概念是一致的。

这个展示了 `subscribe` 怎样调用是不会在多个可观察对象的相同可观察对象之间共享。当观察者 Observer 调用 `observable.subscribe`，`new Observable(function subscribe(subscriber) {...})` 中的函数 `subscribe` 运行在给定的订阅器上运行。

> 订阅一个可观察者对象（Observable）就像调用一个函数，在数据将被传递到的地方提供一个回调函数。

这对于事件处理 API 来说是彻底不同的，像 `addEventListener` / `removeEventListener`。通过 `observable.subscribe`,给定的观察者是不会作为侦听者注册到可观察对象（Observable）中去。Observable 甚至不会维护已经附加进来的列表。

调用 `subscribe` 是一种简单的方式来开始一个 “可观察的执行” 以及传递值或是传递执行的可观察的事件。

## 执行 Observables

在代码 `new Observable(function subscribe(subscriber){...})` 代码里表示一个 "可观察的执行"，是一个延迟执行，它只发生在每个观察者（Observer）订阅的时候。这个执行多次会生成多个值，无论同步还是异步。

这里有三个类型的值在可观察者执行时传递：

- "Next" 通知：发送一个值，比如数字类型，字符串类型以及对象等
- "Error" 通知：发送一个 Javascript 错误或异常
- "Complete" 通知：不会发送任何值

"Next" 通知是最重要的并且是最常用的类型：它们表示一个数据被传递到订阅者的行为。"Error" 和 "Complete" 通知可能只发生一次在可观察的对象执行期间，它们只能发生一个。

在调用 Observable 语法或契约中，这些约束表现得最好，写成一个正则表达式：

```c#
next*(error|complete)?
```

> 在 Observable 执行中，下一个通知可以从 0 发送到无穷。如一个 Error 或是 Complete 被发送了，那么在之后就不会有任何东西被发送：
>
> ```javascript
> import { Observable } from 'rxjs';
> 
> const observable = new Observable(function subscribe(subscriber){
>     subscriber.next(1);
>     subscriber.next(2);
>     subscriber.next(3);
>     subscriber.complete();
> });
> ```

Observables 严格遵守 Observable 契约，所以下面这段代码将不会传递到 Next 通知 4：

```javascript
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber){
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
    subscriber.next(4);//这里永远都不会执行。因为已经complete
})
```

这种方法是好的，在 `subscriber` 中通过 `try/catch` 代码块包装任何代码，它将传递一个 Error 通知，如果捕捉到异常的话。

```javascript
import { Observable } from 'rxjs';

const observable = new Observable(function subscribe(subscriber){
    try{
        subscriber.next(1);
        subscriber.next(2);
        subscriber.next(3);
        subscriber.complete();
    } catch (err) {
        subscriber.error(err);	//传递一个错误对象，如果捕捉到异常的话。
    }
});
```

## 释放 Observable 执行

由于 Observaber 执行可能会无穷，并且共同的就是观察者（Observer）想要在有限的时间放弃这个执行，所以我们需要一个 api 来取消执行。由于每个执行在一个 Observer 都是独有的，一旦 Observer 做完了接收数据，为了避免浪费计算以及内存资源，那么它就必须有一种方式来停止执行。

当 `observable.subscribe` 被调用时，观察者（Observer）被附加到最新创建的 Observable 执行。Subscription 它也返回一个对象：

```javascript
const subscription = observable.subscribe(x => console.log(x));
```

Subscription 表示正在执行，有一个最小的 api，这个 api 允许你取消执行。关于 [Subscription](https://rxjs.dev/guide/subscription) 这里可以阅读更多。通过 `subscription.unsubcribe()` 你可以取消正在执行中的执行。

```javascript
import { from } from 'rxjs';

const observable = from([10,20,30]);
const subscription = observable.subscribe(x => console.log(x));
//之后
subscribe.unsubscribe();
```

> 当你订阅的时候，你会得到一个 Subscription，它表示正在执行的执行。仅仅调用 `unsubscribe` 取消执行。

每个 Observable 必须定义怎么去释放执行的资源，当我们使用 `create` 创建 Observable 时。你可以通过返回一个自定义的 `ubsubcribe` 方法做到这个。

举个例子，这里展示了我们通过 `setInterval 清除一个间隔执行`：

```javascript
const observable = new Observable(function subscribe(subscriber){
    //根据间隔资源
    const intervalId = setInterval(() => {
        subscribe,next('hi')
    },1000);
    
    //提供一个方法来取消以及释放间隔资源。
    return function unsubscribe()
    {
        clearInterval(intervaleId);
    }
})
```

由此可见 `observable.subscribe` 相似 `new Observable(function subscribe(subscriber){...})`，我们从 `subscribe` 返回 `unsubscribe`，在概念上等同于 `subscribe.unsubscribe`。实际上，如果我们移除围绕 ReactiveX 概念的类型，剩下的 JavaScript 代码就不在陌生了。

```javascript
function subscribe(subscriber)
{
    const intervalId = setInterval(() => {
        subscribe.next('hi');
    },1000);
    
    return function unsubscribe(){
        clearInterval(intervalId);
    }
}

const unsubscribe = subscribe({next: (x) => console.log(x)});

//最后
unsubscriber();	//释放资源
```

我们使用的 RxJS 类型，如 Observable，Observer，Subscription 的理由是更安全的获得（例如 Obscervable 契约）以及 Operators（操作符）的组合性。