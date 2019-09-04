# QA

1. 由于指定的指令未知，无法绑定的错误，例如：[Can't bind to 'routerLink' since it isn't a known property](https://stackoverflow.com/questions/42035387/cant-bind-to-routerlink-since-it-isnt-a-known-property)

   解决方案：你需要在你引用的每个模块都要引入 `RouterModule`：`import { RouterModule } from "@angular/router";`

2. 无法绑定到 ngXX 指令，因为它不是已知的某个标签的属性，如：https://stackoverflow.com/questions/42063686/cant-bind-to-ngif-since-it-isnt-a-known-property-of-div-in-production-buil

   解决方案：在你出问题的页面所属的组件注册的模块中，导入 ` import { BrowserModule } from '@angular/platform-browser';`

3. 在修正时，发现编辑器还是报告异常

    在项目根目录的 `tsconfig.json` 把编译选项节点 `complieOnSave` 设置为 `true`，然后重新编辑有问题的页面重新保存。