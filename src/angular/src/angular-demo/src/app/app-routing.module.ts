import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './page/login/login.component';
import { AppComponent } from './app.component';
import { LoginCanActivateGuard } from './guard/auth.guard';


const routes: Routes = [
  { path: "", component: AppComponent },
  { path: 'login', component: LoginComponent },
  {
    path: "index",
    loadChildren: () => import('./page/index/index.module').then(mod => mod.IndexModule),
    canActivate: [LoginCanActivateGuard],
    data: { preload: true } //预加载策略
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
