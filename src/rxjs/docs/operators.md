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