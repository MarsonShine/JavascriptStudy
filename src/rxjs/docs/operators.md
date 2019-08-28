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