import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { BrowserModule } from '@angular/platform-browser';
import { ProductListComponent } from '../page/productList/productList.component';
import { ProductAlertComponent } from '../page/productList/productAlert/productAlert.component';
import { ProductDetailComponent } from '../page/productList/productDetail/productDetail.component';

@NgModule({
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ],
    declarations: [
        ProductListComponent,
        ProductAlertComponent,
        ProductDetailComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule
    ],
    exports: [
        ProductListComponent,
        ProductAlertComponent,
        ProductDetailComponent
    ],
    entryComponents: [],
    providers: [],
})
export class PartialImportModule { }
