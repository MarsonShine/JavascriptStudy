import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopbarComponent } from "./page/topbar/topbar.component";
import { LoginComponent } from './page/login/login.component';
import { PartialImportModule } from './declaration/partial-import.module';
import { ProductListComponent } from './page/productList/productList.component';
import { ProductDetailComponent } from './page/productList/productDetail/productDetail.component';
import { ProductAlertComponent } from './page/productList/productAlert/productAlert.component';

@NgModule({
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    TopbarComponent,
    // ProductListComponent,
    // ProductDetailComponent,
    // ProductAlertComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgZorroAntdModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    PartialImportModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
