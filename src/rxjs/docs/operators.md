RxJS 的操作符（operators）是最有用的，尽管 Observable 是最基本的。操作符最基本的部分（pieces）就是以申明的方式允许复杂的异步代码组合简化。

# 什么是操作符？

操作符是函数。这里有两种操作符：

管道操作符（Pipeable Operators）是可以通过使用 `observableInstance.pipe(operator())` 管道传输到 Observable 对象。这些包括，`filter(...),mergeMap(...)`。当调用他们时，它们不会改变已存在的 Observable 实例。相反，他们会返回一个新的 Observable，它在第一个 Observable 的基础上的逻辑的 Observable。

> 管道操作符是一个函数，它有一个 Observable 作为输入参数并且返回另一个 Observable。这是纯函数（函数式）的操作：上一个 Observable 保留未修改。

管道操作符本质上就是一个纯函数，它可以作为独立函数被调用来创建一个新的 Observable。例如：`of(1, 2, 3)` 创建了一个 Observable，它会发送 1，2，3 一个接一个的。在下一接将详细讨论操作符的创建。

例如，操作符 `map` 被调用跟数组的 map 是类似的。就比如 `[1, 2 , 3].map(x => x * x)` 会返回 `[1, 4, 9]`，被创建的 Observable 就像下面：

```javascript
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

map(x => x * x)(of(1, 2, 3)).subscribe((v) => console.log(`value: ${v}`));

// Logs:
// value: 1
// value: 4
// value: 9
```

将会发送 1，4，9。其他操作符的用法 first：

```javascript
import { of } from 'rxjs';
import { first } from 'rxjs/operators';

first()(of(1, 2, 3)).subscribe((v) => console.log(`value: ${v}`));

// Logs:
// value: 1
```

注意 `map` 逻辑部分必须要动态构造，因为它必须被赋予映射函数来做。通过对比，first 是一个常数，但是还是得动态构造。作为一般实践，所有的操作符都要被构造，无论他们是否需要参数。

# 管道（Piping）

管道操作符是函数，所以他们能像原生函数使用：`op()(obs)` — 但是实际上，他们都互相交织在一起，很快就会演变得不利于阅读的：`op4()(op3()(op2()(op1()(obs))))`。所以基于这个原因，Observables 有一个方法 `.pipe()` 可以调用，它能完成相同的事，并且更易读的：

```javascript
obs.pipe(
 op1(),
 op2(),
 op3(),
 op4(),
)
```

作为一个风格，`op()(obs)` 永不这样使用，甚至是只有一个操作符时，`obs.pipe(op())` 也是首选的。

# 创建操作符

什么是创建操作符？为了区别管道操作符，创建操作符是一个函数，能被用来创建通过一些共同的预定义的行为或者关联其他的 Observables 的 Observables 。

一个典型的创建操作符例子是 `interval` 函数。它要求一个数字类型作为输入参数，并返回 Observable 作为输出：

```javascript
import { interval } from 'rxjs';

const observable = interval(1000 /* number of milliseconds */);
```

[这里](https://rxjs.dev/guide/operators#creation-operators)查看所有的静态创建操作符。

# 高阶 Observables

Observables 大体上是有顺序的发送值（数字或字符串），但是也有例外，处理 Observables 的 Observables 是有必要的，叫做高阶 Observables。例如，想象你有一个 Observable，它发送文件的地址的字符串，这个字符串恰好是想要看到的。代码如下：

```javascript
const fileObservable = urlObservable.pipe(
	map(url => http.get(url)),
);
```

`http.get()` 返回每个 URL 的 Observable 对象（可能是字符串或字符串数组）。现在你有一个 Observables 对象了，一个高阶 Observable。

但是这个高阶 Observable 是怎么工作的呢？通常通过平坦化：通过某种方式将高阶 Observable 转换成一个普通的 Observable。例如：

```javascript
const fileObservable = urlObservable.pipe(
	map(url => http.get(url)),
    concatAll(),
);
```

`concatAll()` 操作订阅了每个内部的 Observable，它会带出来一个 Observable 对象，并复制所有的发送的值知道Observable 完成，然后继续执行下一个。所有的值都是以这种方式串起来的。其他的扁平用处的操作（也叫链接操作符（join operators））

- `mergeAll()` —— 订阅每个内部到达的 Observable 对象，然后发送它到达的每一个值
- `switchAll()` —— 当内部的 Observable 第一个到达时订阅（Observable），然后每个到达时发送值，但是当下个内部的 Observable 到达时，上一个订阅取消，并订阅这个新的 Observable。
- `exhaust()` —— 当 Observable 到达时订阅第一个，每个在它到达时发送值，在第一个完成之前，丢弃所有新到大的 Observable 对象，完成之后等待下一个 Observable。

就像组合了数组库中许多的 `map()`，`flat()`（或者是 `flatten()`），他们映射就等价于 RxJS 中的 扁平操作符 concatMap()，`mergeMap()`，`switchMap()` 以及 `exhaustMap()`。

## 弹珠图标（Marble diagrams）

为了解释操作符是如何工作的，本文还不足以描述。太多的操作符相关联了，他们实例化可能以不同的方式延迟，举例，节流，降低值发送（频率）。为了更好的描述，图标经常是最好的工具。弹珠图表是可视化的表示 operator 是如何工作的，也包括了 Observable 输入，operator 以及它们的参数，还有 Observable 的输出。

> 在弹珠图中，时间轴向右移动，并且图描述了值 “弹珠” 在 Observable 运行的时候是如何发送的。

根据下面你能看到弹珠图的解析。

![](F:\MS\Project\JavascriptStudy\src\rxjs\docs\asserts\marble-diagram-anatomy.svg)

贯穿文档节点，我们普遍使用 marble diagrams 来解释 operator 是如何工作的。它们在其他的方面也是很有用的，比如在白板甚至是在我们的单元测试中（作为 ASCII 图表）。

> 按照图标的顺序，我解释下上面的意思：
>
> 1. 这个从左到右的时间轴是表示输入的 Observable 的执行过程
> 2. 4，6，a，8 这些值是 Observable 要发送的值
> 3. 紧接着的 “|” 是表示 “完成”  通知，表明这个 Observable 已经成功完成。
> 4. 中间的盒子表明操作符，它传递上面输入的 Observable 生成一个 Observable 作为输出（下面一条线）方框内的文本显示了转换的性质
> 5. 调用操作符输出 Observable
> 6. “X” 表示这个输出的 Observable 发送错误，表明异常终止。至此之后不会有任何值发送。

# 操作符的分类

有很多操作是使用目的是不同的，他们分这几类：创建，转换，过滤，联合，多播，错误处理，公共等等。下面的列表你会发现所有被分类的操作符。

为了完成的概述，你可以看这个 [API 文档](https://rxjs.dev/api)

## 创建操作符

- [`ajax`](https://rxjs.dev/api/ajax/ajax)
- [`bindCallback`](https://rxjs.dev/api/index/function/bindCallback)
- [`bindNodeCallback`](https://rxjs.dev/api/index/function/bindNodeCallback)
- [`defer`](https://rxjs.dev/api/index/function/defer)
- [`empty`](https://rxjs.dev/api/index/function/empty)
- [`from`](https://rxjs.dev/api/index/function/from)
- [`fromEvent`](https://rxjs.dev/api/index/function/fromEvent)
- [`fromEventPattern`](https://rxjs.dev/api/index/function/fromEventPattern)
- [`generate`](https://rxjs.dev/api/index/function/generate)
- [`interval`](https://rxjs.dev/api/index/function/interval)
- [`of`](https://rxjs.dev/api/index/function/of)
- [`range`](https://rxjs.dev/api/index/function/range)
- [`throwError`](https://rxjs.dev/api/index/function/throwError)
- [`timer`](https://rxjs.dev/api/index/function/timer)
- [`iif`](https://rxjs.dev/api/index/function/iif)

## 链接创建操作

- [`combineLatest`](https://rxjs.dev/api/index/function/combineLatest)
- [`concat`](https://rxjs.dev/api/index/function/concat)
- [`forkJoin`](https://rxjs.dev/api/index/function/forkJoin)
- [`merge`](https://rxjs.dev/api/index/function/merge)
- [`race`](https://rxjs.dev/api/index/function/race)
- [`zip`](https://rxjs.dev/api/index/function/zip)

## 转化操作符

- [`buffer`](https://rxjs.dev/api/operators/buffer)
- [`bufferCount`](https://rxjs.dev/api/operators/bufferCount)
- [`bufferTime`](https://rxjs.dev/api/operators/bufferTime)
- [`bufferToggle`](https://rxjs.dev/api/operators/bufferToggle)
- [`bufferWhen`](https://rxjs.dev/api/operators/bufferWhen)
- [`concatMap`](https://rxjs.dev/api/operators/concatMap)
- [`concatMapTo`](https://rxjs.dev/api/operators/concatMapTo)
- [`exhaust`](https://rxjs.dev/api/operators/exhaust)
- [`exhaustMap`](https://rxjs.dev/api/operators/exhaustMap)
- [`expand`](https://rxjs.dev/api/operators/expand)
- [`groupBy`](https://rxjs.dev/api/operators/groupBy)
- [`map`](https://rxjs.dev/api/operators/map)
- [`mapTo`](https://rxjs.dev/api/operators/mapTo)
- [`mergeMap`](https://rxjs.dev/api/operators/mergeMap)
- [`mergeMapTo`](https://rxjs.dev/api/operators/mergeMapTo)
- [`mergeScan`](https://rxjs.dev/api/operators/mergeScan)
- [`pairwise`](https://rxjs.dev/api/operators/pairwise)
- [`partition`](https://rxjs.dev/api/operators/partition)
- [`pluck`](https://rxjs.dev/api/operators/pluck)
- [`scan`](https://rxjs.dev/api/operators/scan)应用在源 Observable 对象上的累加器函数，返回带有可选的种子值的每个中间结果，类似于 reduce，无论何时源推送值时，都会推送当前的累计值

- [`switchMap`](https://rxjs.dev/api/operators/switchMap)
- [`switchMapTo`](https://rxjs.dev/api/operators/switchMapTo)
- [`window`](https://rxjs.dev/api/operators/window)
- [`windowCount`](https://rxjs.dev/api/operators/windowCount)
- [`windowTime`](https://rxjs.dev/api/operators/windowTime)
- [`windowToggle`](https://rxjs.dev/api/operators/windowToggle)
- [`windowWhen`](https://rxjs.dev/api/operators/windowWhen)

## 过滤操作符

- [`audit`](https://rxjs.dev/api/operators/audit)
- [`auditTime`](https://rxjs.dev/api/operators/auditTime)
- [`debounce`](https://rxjs.dev/api/operators/debounce)
- [`debounceTime`](https://rxjs.dev/api/operators/debounceTime)
- [`distinct`](https://rxjs.dev/api/operators/distinct)
- [`distinctKey`](https://rxjs.dev/class/es6/Observable.js~Observable.html#instance-method-distinctKey)
- [`distinctUntilChanged`](https://rxjs.dev/api/operators/distinctUntilChanged)
- [`distinctUntilKeyChanged`](https://rxjs.dev/api/operators/distinctUntilKeyChanged)
- [`elementAt`](https://rxjs.dev/api/operators/elementAt)
- [`filter`](https://rxjs.dev/api/operators/filter)
- [`first`](https://rxjs.dev/api/operators/first)
- [`ignoreElements`](https://rxjs.dev/api/operators/ignoreElements)
- [`last`](https://rxjs.dev/api/operators/last)
- [`sample`](https://rxjs.dev/api/operators/sample)
- [`sampleTime`](https://rxjs.dev/api/operators/sampleTime)
- [`single`](https://rxjs.dev/api/operators/single)
- [`skip`](https://rxjs.dev/api/operators/skip)
- [`skipLast`](https://rxjs.dev/api/operators/skipLast)
- [`skipUntil`](https://rxjs.dev/api/operators/skipUntil)
- [`skipWhile`](https://rxjs.dev/api/operators/skipWhile)
- [`take`](https://rxjs.dev/api/operators/take)
- [`takeLast`](https://rxjs.dev/api/operators/takeLast)
- [`takeUntil`](https://rxjs.dev/api/operators/takeUntil)
- [`takeWhile`](https://rxjs.dev/api/operators/takeWhile)
- [`throttle`](https://rxjs.dev/api/operators/throttle)
- [`throttleTime`](https://rxjs.dev/api/operators/throttleTime)

## 连接操作符

你也可以看 [连接创建操作符](https://rxjs.dev/guide/operators#join-creation-operators) 一节

- [`combineAll`](https://rxjs.dev/api/operators/combineAll)
- [`concatAll`](https://rxjs.dev/api/operators/concatAll)
- [`exhaust`](https://rxjs.dev/api/operators/exhaust)
- [`mergeAll`](https://rxjs.dev/api/operators/mergeAll)
- [`startWith`](https://rxjs.dev/api/operators/startWith)
- [`withLatestFrom`](https://rxjs.dev/api/operators/withLatestFrom)

## 多播操作符

- [`multicast`](https://rxjs.dev/api/operators/multicast)
- [`publish`](https://rxjs.dev/api/operators/publish)
- [`publishBehavior`](https://rxjs.dev/api/operators/publishBehavior)
- [`publishLast`](https://rxjs.dev/api/operators/publishLast)
- [`publishReplay`](https://rxjs.dev/api/operators/publishReplay)
- [`share`](https://rxjs.dev/api/operators/share)

## 异常处理操作符

- [`catchError`](https://rxjs.dev/api/operators/catchError)
- [`retry`](https://rxjs.dev/api/operators/retry)
- [`retryWhen`](https://rxjs.dev/api/operators/retryWhen)

## 公共操作符

- [`tap`](https://rxjs.dev/api/operators/tap)
- [`delay`](https://rxjs.dev/api/operators/delay)
- [`delayWhen`](https://rxjs.dev/api/operators/delayWhen)
- [`dematerialize`](https://rxjs.dev/api/operators/dematerialize)
- [`materialize`](https://rxjs.dev/api/operators/materialize)
- [`observeOn`](https://rxjs.dev/api/operators/observeOn)
- [`subscribeOn`](https://rxjs.dev/api/operators/subscribeOn)
- [`timeInterval`](https://rxjs.dev/api/operators/timeInterval)
- [`timestamp`](https://rxjs.dev/api/operators/timestamp)
- [`timeout`](https://rxjs.dev/api/operators/timeout)
- [`timeoutWith`](https://rxjs.dev/api/operators/timeoutWith)
- [`toArray`](https://rxjs.dev/api/operators/toArray)

## 条件布尔操作符

- [`defaultIfEmpty`](https://rxjs.dev/api/operators/defaultIfEmpty)
- [`every`](https://rxjs.dev/api/operators/every)
- [`find`](https://rxjs.dev/api/operators/find)
- [`findIndex`](https://rxjs.dev/api/operators/findIndex)
- [`isEmpty`](https://rxjs.dev/api/operators/isEmpty)

## 数学和聚合操作符

- [`count`](https://rxjs.dev/api/operators/count)
- [`max`](https://rxjs.dev/api/operators/max)
- [`min`](https://rxjs.dev/api/operators/min)
- [`reduce`](https://rxjs.dev/api/operators/reduce)

# 创建自定义的 Observables

## 使用 `pipe()` 函数生成新的 Observable

如果在你的代码里有常用的操作符序列，用 `pipe()` 函数来提取到新的操作符。甚至这个序列是不常见的，中断它到单个的操作符，这样能提高可读性。

举个例子，你可以生成一个函数，这个函数舍弃奇数的值并给偶数值加倍：

```javascript
import { pipe } from 'rxjs';
import { filter, map } from 'rxjs';

function discardOddDoubleEven()
{
    return pipe(
    	filter(v => !(v % 2)),
        map(v => v +v),
    );
}
```

（`pipe()` 函数是这样类比的，但是又与 `.pipe()` 不是完全一样）

## 从零创建新的操作符

这个非常复杂，如果你一定要写一个不能通过现有的操作符组合而成的操作符（这是极少情况），你可以使用 Observable 构造函数从零写一个操作符，就像下面这样：

```javascript
import { Observable } from 'rxjs';

function delay(delayInMillis)
{
    return (observable) => new Observable(observer => {
        //这个函数将会没当 Observable 订阅的时候调用
        const allTimerIDs = new Set();
        const subscription = observable.subscribe({
            next(value){
                const timerID = setTimeout(() => {
                    observer.next(value);
                    allTimeIDs.delete(timerID);
                }, delayInMillis);
                allTimerIDs.add(timerID);
            },
            error(err) {
                observer.error(err);
            },
            complete() {
                observer.complete();
            }
        });
        //返回值是一个卸载函数
        //它当新的 Observable 被取消订阅时调用
        return () => {
            subscription.unsubscribe();
            allTimerIDs.forEach(timerID => {
                clearTimeout(timerID)
            });
        }
    });
}
```

你必须要注意以下几点

1. 实现所有的 Observer 函数，`next()`，`error()`，`complete()` 当订阅这个输入的 Observer 的时候。
2. 实现一个卸载函数，它负责清理，当 Observable 完成的时候（在上面的例子是通过取消订阅以及清除时间定时器函数）
3. 返回一个从 Observable 构造传递过来的函数的卸载函数

当然，这个只是一个例子；`delay()` 操作符已经存在了。