import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './page/login/login.component';
import { AppComponent } from './app.component';


const routes: Routes = [
  { path: "", component: AppComponent },
  { path: 'login', component: LoginComponent },
  {
    path: "index",
    loadChildren: () => import('./page/index/index.module').then(mod => mod.IndexModule),
    data: { preload: true } //预加载策略
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
