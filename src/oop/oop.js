var cat = {
    say() {
        console.log("meow...");
    },
    jump() {
        console.log("jump...");
    }
}

var tiger = Object.create(cat, {
    say: {
        writable: true,
        configurable: true,
        enumerable: true,
        value: function () {
            console.log("roar...");
        }
    }
});

var anotherCat = Object.create(cat);
anotherCat.say();
var anotherTiger = Object.create(tiger);
anotherTiger.say();

var o = { [Symbol.toStringTag]: "MyObject" }
console.log(o + "");

//constructor mock class
function c1() {
    this.p1 = 1;
    this.p2 = function () {
        console.log(this.p1);
    }
}

var o1 = new c1;
o1.p2();

function c2() {
}
c2.prototype.p1 = o1.p1;
c2.prototype.p2 = function () {
    console.log(this.p1);
}
var c2 = new c2;
c2.p2();
//obsolute
// Object.create = function (prototype) {
//     var cls = function () { }
//     cls.prototype = prototype;
//     return new cls;
// }

class Rectangle {
    constructor(height, width) {
        this.height = height;
        this.width = width;
    }
    //getter
    get area() {
        return this.calcArea();
    }
    //method
    calcArea() {
        return this.height * this.width;
    }
}