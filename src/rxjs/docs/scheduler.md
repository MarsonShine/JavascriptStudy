# 调度器

什么是调度器？调度器是当开始订阅时，控制通知推送的。它由三个部分组成。

- 调度是数据结构。它知道怎样在优先级或其他标准去存储和排队运行的任务
- 调度器是一个执行上下文。它表示任务在何时何地执行（例如，立即或是在回调机制中如 setTimeout 或 process.nextTick，又或是动画框架）
- 调度器有一个（虚拟）计时器。它提供一个 “时间” 的概念，通过在调度器的方法 `now()` 。在特定的调度程序上调度，它只遵循计时器表示的时间。

> 调度器能让你在执行上下文定义 Observable 推送的通知给观察者

下面是一个例子，我们用一个简单的 Observable 来同步推送值 1，2，3，并且为了使用这些值，使用操作符 `observeOn` 到特定的 `async` 调度程序。

```javascript
import { Observable, asyncScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators';

const observable = new Observable((observer) => {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();
}).pipe(
	observeOn(asyncScheduler)
);

console.log('just before subscribe');
observable.subscribe({
    next(x) {
        console.log('got value ' + x)
    },
    error(err) {
        console.log('something wrong occurred: ' + err);
    },
    complete() {
        console.log('done');
    }
});
console.log('just after subscribe');
```

执行的输出：

```
just before subscribe
just after subscribe
got value 1
got value 2
got value 3
done
```

注意是如何通知 `got value...` 是在 `just after subscribe` 之后被推送的，它跟我们之前的默认的行为很相差很远的。这是因为 `observeOn(asyncScheduler)` 在 `new Observable` 和最终的观察者之间引入了一个代理观察者。我们来把之前的代码重命名一些标识再来看下：

```javascript
import { Observable, asyncScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators';

var observable = new Observable((proxyObserver) => {
    proxyObserver.next(1);
    proxyObserver.next(2);
    proxyObserver.next(3);
    proxyObserver.complete();
}).pipe(
	observeOn(asyncScheduler)
);

var finalObserver = {
    next(x) {
        console.log('got value ' + x)
    },
    error(err) {
    	console.error('something wrong occurred: ' + err);
  	},
  	complete() {
     	console.log('done');
  	}
};

console.log('just before subscribe');
observable.subscribe(finalObserver);
console.log('just after subscribe');
```

`proxyObserver` 在 `observeOn(asyncScheduler)` 中创建的，这个代理观察者里的 `next(value)` 函数大概像下面这样：

```javascript
const proxyObserver = {
    next(val) {
        asyncScheduler.schedule(
        	(x) => finalObserver.next(x),
            0,	//延迟参数
            val	//这个值是从上面的 x 传过来的
        );
    },
    // ...
}
```

the `async` 调度程序操作能还使用 `setTimeout` 或 `setInterval`，即使如果给定了 `delay` 的值是 0。通常，在 Javascript 中，`setTimeout(fn, 0)` 知道如何在下一个事件循环迭代最早运行函数 `fn` 。

调度器的方法 `schedule()` 有一个参数 `delay`，它指的是相对于调度器自己内部时钟的一个时间数字量。一个调度器的时间不需要有任何相关的实际时间。这个是一个暂时的操作像 `delay` 操作符一样而不是值实际的时间，但是时间是由调度器的时钟决定的。在测试中这特别有用，它这个虚拟的时间调度器也许用在伪装的真实时间，当在真正同步运行调度任务的时候。

# 调度器类型

`async` 调度器是 RsJS 众多调度器中内置的一个调度器。他们每一个都能被创建和返回，通过使用 `Scheduler` 对象的静态属性。

| SCHEDULER                 | PURPOSE                                                      |
| ------------------------- | ------------------------------------------------------------ |
| `null`                    | 不传递任何调度器，通知以同步和递归的方式传递。这个将用于常量时间操作符或尾递归操作符。 |
| `queueScheduler`          | 对当前的事件框架队列调度（蹦床调度器）。迭代操作用这个       |
| `asapScheduler`           | 在微任务队列调度，它与 promises 的队列使用相同。基本上在当前 job 之后，但是在下一个 job 之前。异步约束使用这个 |
| `asyncScheduler`          | 用 `setInterval` 调度工作。在以时间为基础的操作用这个        |
| `animationFrameScheduler` | 调度任务将会发生在下个浏览器内容重绘之前。能使用在平滑的创建浏览器动画 |

# 使用调度器

你也许早就在你的代码中使用 RsJS 的调度器，没有显式的说明使用的调度器类型。这是因为所有的处理并发的 Observable 操作符都有可选的调度器。如果你不提供调度器，RxJS 通过使用最小并发原则将会选择一个默认的调度器。这就是说最少并发的调度器需要安全的选择操作符。例如，返回一个有限和少量的 Observable 的操作符，RxJS 不使用调度器，例如 `null` 或 `undefined`。对于返回一个可能很大的或者无限的消息，那么就会使用 `queue` 调度器。对于使用时间的的操作符，那么就会用 `async`。

因为 RxJS 使用最少并发调度器，你可以选择一个不同的调度器，如果你想以性能为目的来引入并发。为了指定一个特定的调度器，你可以送那些操作符方法传递调度器，例如 `from([10, 20, 30], asyncShceduler)`

静态创建操作符通常将一个调度器作为参数传递。例如，`from([10, 20, 30])` 允许你当推送每一个从 `array` 转化的通知时指定一个调度器。它通常是操作符上的最后一个参数。下面的静态创建操作符都会传递一个调度器参数：

- `bindCallback`
- `bindNodeCallback`
- `combineLatest`
- `concat`
- `empty`
- `from`
- `fromPromise`
- `interval`
- `merge`
- `of`
- `range`
- `throw`
- `timer`

上下文将会调用 subscribe() 来用 `subscribeOn` 调度。`subscribe` 默认会在 Observable 调用，它将会同步和立即的方式调用。然而，你也许要延迟或在给定的调度器调度实际的订阅，使用操作符的 subscribeOn(scheduler) 的实例，里面的 `scheduler` 就是你要提供的参数。

使用 `observeOn` 来调度上下文将推送的通知。就像我们看到的一样，实例操作符 `observeOn(scheduler)` 在源 Observable 和 目标观察者之间引入 Observer 中间者，这个中介者调度器通过你给定的 `shceduler` 对目标观察者调用。

实例操作符传递一个调度器作为参数。

时间相关操作符像 `bufferTime`，`debounceTime`，`delay`，`sampleTime`，`throttleTime`，`timeInterval`，`timeout`，`timeoutWith`，`windowTime` 最后一个参数全都带一个调度器参数，以及其他操作符默认都会在 `asyncScheduler` 。

其他实例传调度器作为参数的操作符：`cache`，`combineLatest`，`concat`，`merge`，`expand`，`publishReplay`，`startWith`。

注意到 `cache` 和 `publishReplay` 这两个都接受一个调取器，因为他们都使用 ReplaySubject。ReplaySubject 构造函数传递一个可选的调度器作为最后一个参数，因为 ReplaySubject 能处理时间，它只有在调度器的上下文中才会有意义。ReplaySubject 默认使用 `queue` 调度器提供一个时钟。

