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

