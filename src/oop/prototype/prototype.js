// javascript 中的原型链-继承模式
// https://time.geekbang.org/column/article/2741

function Foo(y) {
    this.y = y;
}

// 添加属性
Foo.prototype.x = 10;
Foo.prototype.calculate = function(z) {
    return this.x + this.y + z;
}

var b = new Foo(20);
var c = new Foo(30);

b.calculate(30);
c.calculate(40);


// 
var Person = function(fullName, email) {
    this.fullName = fullName;
    this.email = email;

    this.speak = function() {
        console.log("I speak English!");
    };
    this.introduction = function() {
        console.log("My names is "+ this.fullName);
    }
}

var Student = function(fullName, email, school, courses) {
    Person.call(this, fullName, email);
    this.school = school;
    this.courses = courses;

    this.introduction = function() {
        console.log("Student, My names is "+ this.fullName);
    };
    this.takeExams = function() {
        console.log("This is my exams time!");
    };
}

// 定义继承关系
// method1
Student.__proto__ = Person.prototype
// method2
Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;

// use
var student = new Student("marson shine", "ms27946@outlook.com", "Hunan School", "Computer");
student.introduction();
student.speak();
student.takeExams();