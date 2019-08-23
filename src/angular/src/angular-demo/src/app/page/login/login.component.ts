import { Component, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  validateForm: FormGroup;

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.invalid) {
      alert("验证不通过");
      return;
    }
    console.log("点击 form 事件：", (this.fb), this.validateForm);
  }

  constructor(private fb: FormBuilder) { }
  ngOnChanges(changes: SimpleChanges): void {
    console.log("ngOnChanges:在onInit之前绑定一个或多个输入属性的值发生变化时调用" + changes);
  }

  ngOnInit(): void {
    console.log("ngOnInit:第一次显示数据，在 onChanges 调用之后触发");
    this.validateForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true]
    });
  }
  ngDoCheck(): void {
    //Called every time that the input properties of a component or a directive are checked. Use it to extend change detection by performing a custom check.
    //Add 'implements DoCheck' to the class.
    console.log("ngDoCheck：ngOnInit 之后触发，每次检查组件属性，指令")
  }

  ngAfterContentInit(): void {
    //Called after ngOnInit when the component's or directive's content has been initialized.
    //Add 'implements AfterContentInit' to the class.
    console.log("ngAfterContentInit：组件或指令内容初始化之后触发，只执行一次")
  }

  ngAfterContentChecked(): void {
    //Called after every check of the component's or directive's content.
    //Add 'implements AfterContentChecked' to the class.
    console.log("ngAfterContentChecked：每次检查组件或指令内容之后调用")
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    console.log("ngAfterViewInit：在当组件视图初始化之后 ngAfterContentInit 之后调用，只应用在组件")
  }

  ngAfterViewChecked(): void {
    //Called after every check of the component's view. Applies to components only.
    //Add 'implements AfterViewChecked' to the class.
    console.log("ngAfterViewChecked：在当组件视图初始化之后检查每个视图之后调用，只应用在组件")
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    console.log("实例摧毁前触发，只调用一次");
  }

}
