class QLineStyle {
    constructor(width, color) {
        this.width = width;
        this.color = color;
    }
}

// class QLine {
//     // lineStyle : CanvasRenderingContext2D
//     constructor(pt1, pt2, lineStyle) {
//         this.pt1 = pt1;
//         this.pt2 = pt2;
//         this.lineStyle = lineStyle;
//     }
//     // ctx : CanvasRenderingContext2D
//     onpaint(ctx) {
//         let lineStyle = this.lineStyle;
//         ctx.lineWidth = lineStyle.width;
//         ctx.strokeStyle = lineStyle.color;
//         ctx.beginPath();
//         ctx.moveTo(this.pt1.x, this.pt1.y);
//         ctx.lineTo(this.pt2.x, this.pt2.y);
//         ctx.stroke();
//     }
// }        // move to dom.js

class QRect {
    constructor(x, y, width, height, lineStyle) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.lineStyle = lineStyle;
    }
    // ctx:CanvasRenderingContext2D
    onpaint(ctx) {
        let lineStyle = this.lineStyle;
        ctx.lineWidth = lineStyle.width;
        ctx.strokeStyle = lineStyle.color;
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.stroke();
    }
}

class QEllipse {
    constructor(x, y, radiusX, radiusY, lineStyle) {
        this.x = x;
        this.y = y;
        this.radiusX = radiusX;
        this.radiusY = radiusY;
        this.lineStyle = lineStyle;
    }
    onpaint(ctx) {
        let lineStyle = this.lineStyle;
        ctx.lineWidth = lineStyle.width;
        ctx.strokeStyle = lineStyle.color;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radiusX, this.radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

class QPath {
    constructor(points, close, lineStyle) {
        this.points = points;
        this.close = close;
        this.lineStyle = lineStyle;
    }
    onpaint(ctx) {
        let n = this.points.length;
        if (n < 1) {
            return;
        }
        let points = this.points;
        let lineStyle = this.lineStyle;
        ctx.lineWidth = lineStyle.width;
        ctx.strokeStyle = lineStyle.color;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < n; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        if (this.close) {
            ctx.closePath();
        }
        ctx.stroke();
    }
}

// 迁移到dom.js文件中
// class QPaintDoc {
//     constructor() {
//         this.shapes = [];
//     }
//     addShape(shape) {
//         if (shape != null) {
//             this.shapes.push(shape);
//         }
//     }
//     onpaint(ctx) {
//         let shapes = this.shapes;
//         for (let i in shapes) {
//             shapes[i].onpaint(ctx);
//         }
//     }
// }