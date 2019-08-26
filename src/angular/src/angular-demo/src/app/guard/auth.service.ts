import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";  //TODO of 是什么意思？
import { tap, delay } from 'rxjs/operators'; //TODO tap,delay 是什么意思？

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    isLoggin: boolean = false;
    //存储重定向的url
    redirectUrl: string;

    login(): Observable<boolean> {
        return of(true)
            .pipe(delay(1000), tap(val => this.isLoggin = true));
    }

    logout(): void {
        this.isLoggin = false;
    }
}