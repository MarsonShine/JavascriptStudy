import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
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
        FormsModule,
        ReactiveFormsModule
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
