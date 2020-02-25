function hitLine(pt, pt1, pt2, width) {
    if ((pt1.x - pt.x) * (pt.x - pt2.x) < 0) {
        return false;
    }
    if ((pt1.y - pt.y) * (pt.y - pt2.y) < 0) {
        return false;
    }
    let dy = pt2.y - pt1.y;
    let dx = pt2.x - pt1.x;
    let d12 = Math.sqrt(dx * dx + dy * dy);
    if (d12 < 0.1) {
        return false;
    }
    let d = Math.abs(dy * pt.x - dx * pt.y + pt2.x * pt1.y - pt1.x * pt2.y) / d12 - 2;
    return width >= d * 2;
}

function hintRect(pt, r) {
    if ((r.x + r.width - pt.x) * (pt.x - r.x) < 0) {
        return false;
    }
    if ((r.y + r.height - pt.y) * (pt.y - r.y) < 0) {
        return false;
    }
    return true;
}

function normalizeRect(rect) {
    let x = rect.pt1.x;
    let y = rect.pt1.y;
    let width = rect.pt2.x - x;
    let height = rect.pt2.y - y;
    if (width < 0) {
        x = rect.pt2.x;
        width = -width;
    }
    if (height < 0) {
        y = rect.pt2.y;
        height = -height;
    }
    return {
        x: x,
        y: y,
        width: width,
        height: height
    };
}

function fill(ctx, fillColor) {
    if (fillColor != "null") {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
}

function deleteItem(array, item) {
    const index = array.indexOf(item);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

function _isTempDoc(displayID) {
    return displayID.charAt(0) == 't';
}

function _getNextID(key) {
    let dgBase = localStorage.getItem(key);
    if (dgBase == null) {
        dgBase = 10000;
    } else {
        dgBase = parseInt(dgBase);
    }
    dgBase++;
    return dgBase.toString();
}

function _makeLocalDrawingID() {
    let val = _getNextID("dgClear");
    localStorage_setItem("dgBase", val);
    return val;
}

function removeSomeCache() {
    let clearId = _getNextID("dgClear");
    for (i = 0; i < 32; i++) {
        let key = "dg:" + clearId;
        let doc = localStorage.getItem(key);
        if (doc != null) {
            let o = JSON.parse(doc);
            for (let i in o.shapes) {
                localStorage.removeItem(o.id + ":" + o.shapes[i]);
            }
            localStorage.removeItem(key);
            localStorage.setItem("dgClear", clearId);
            return;
        }
        clearID++;
    }
}

function localStorage_setItem(key, val) {
    try {
        localStorage.setItem(key, val);
    } catch (e) {
        if (e.name == 'QuotaExceededError') {
            removeSomeCache();
            localStorage.setItem(key, val);
        }
    }
}

function localStorage_getIntItem(key, defaultVal) {
    let val = localStorage.getItem(key);
    if (val == null) {
        return defaultVal;
    } else {
        return parseInt(val);
    }
}

function loadDrawing(localID) {
    let val = localStorage.getItem("dg:" + localID);
    return JSON.parse(val);
}

function documentChanged(doc) {
    if (doc.localID != "") {
        let val = doc._stringify();
        localStorage_setItem("dg:" + doc.localID, val);
    }
}

function loadShape(parent, id) {
    let val = localStorage.getItem(parent.localID + ":" + id);
    let o = JSON.parse(val);
    if (o == null) {
        return null;
    }
    let sty = o.style;
    let style = new QShapeStyle(sty.lineWidth, sty.lineColor, sty.fillColor);
    switch (o.type) {
        case "QLine":
            return new QLine(o.pt1, o.pt2, style);
        case "QRect":
            return new QRect(o, style);
        case "QEllipse":
            return new QEllipse(o.x, o.y, o.radiusX, o.radiusY, style);
        case "QPath":
            return new QPath(o.points, o.close, style);
        default:
            alert("loadShape: unknown shape type - " + o.type);
            return null;
    }
}

// function shapeChanged(shape) {
//     if (shape.id != "") {
//         let parent = shape.type;
//         shape.type = shape.constructor.name;
//         let val = JSON.stringify(shape);
//         shape.type = parent;
//         localStorage_setItem(parent.localID + ":" + shape.id, val);
//     }
// }
function shapeChanged(parent, shape, noSync) {
    if (shape.id != "") {
        shape.ver = parent.ver;
        let val = JSON.stringify(shape);
        localStorage_setItem(parent.localID + ":" + shape.id, val);
        noSync = noSync || false;
        if (!noSync) {
            parent.syncer.fireChanged(parent);
        }
    }
}

class QShapeStyle {
    constructor(lineWidth, lineColor, fillColor) {
        this.lineWidth = lineWidth;
        this.lineColor = lineColor;
        this.fillColor = fillColor;
    }

    setProp(key, val) {
        this[key] = val;
    }

    clone() {
        return new QShapeStyle(this.lineWidth, this.lineColor, this.fillColor);
    }
}

class QLine {
    // lineStyle : CanvasRenderingContext2D
    constructor(pt1, pt2, style) {
        this.pt1 = pt1;
        this.pt2 = pt2;
        this.style = style;
    }

    bound() {
        return normalizeRect(this);
    }
    hitTest(pt) {
        if (hitLine(pt, this.pt1, this.pt2, this.style.lineWidth)) {
            return {
                hitCode: 1,
                hitShape: this
            };
        }
    }
    move(dx, dy) {
        this.pt1.x += dx;
        this.pt1.y += dy;
        this.pt2.x += dx;
        this.pt2.y += dy;
        shapeChanged(this);
    }
    // ctx : CanvasRenderingContext2D
    onpaint(ctx) {
        let lineStyle = this.lineStyle;
        ctx.lineWidth = lineStyle.width;
        ctx.strokeStyle = lineStyle.color;
        ctx.beginPath();
        ctx.moveTo(this.pt1.x, this.pt1.y);
        ctx.lineTo(this.pt2.x, this.pt2.y);
        ctx.stroke();
    }
}

var http = new XMLHttpRequest();

// 离线编辑的图片要支持 一旦联网，在用户编辑画板的时候，自动保存到后端服务器
// 如何判断用户上一次成功保存的跟用户编辑不为同一个呢？
// 可以用版本控制，localStorage保存上次成功同步到后端的版本号ver，然后用户在本地编辑，一旦联网就与这个版本比较，大于ver就触发后端保存
class QSynchronizer {
    constructor() {
        this.started = false;
        this.dirty = false;
    }
    noflush(doSth) {
        let old = this.started;
        this.started = true;
        doSth();
        this.started = old;
    }

    fireLoaded(doc) {
        let baseVerKey = "base:" + doc.displayID;
        localStorage_setItem(baseVerKey, doc.ver.toString());
        this.dirty = false;
        doc.ver++;
    }
    fireChanged(doc) {
        this.dirty = true;
        if (this.started) {
            return;
        }
        if (_isTempDoc(doc.displayID)) {
            return;
        }
        // 服务端api
        let syncUrl = "/api/drawings/" + doc.displayID + "/sync";
        let baseVerKey = "base:" + doc.displayID;
        let timeout = 1000;
        let syncer = this;
        let syncFunc = function () {
            if (!syncer.dirty) {
                syncer.started = false;
                return;
            }
            syncer.dirty = false;
            let baseVer = localStorage_getIntItem(baseVerKey, 0);
            let o = doc.prepreSync(baseVer);
            http.open("POST", syncUrl);
            http.setRequestHeader("Content-Type", "application/json");
            http.onreadystatechange = function () {
                if (http.readyState != 4) {
                    return;
                }
                if (http.status == 200) {
                    localStorage_setItem(baseVerKey, o.ver.toString());
                    syncFunc();
                } else {
                    console.log("QSynchronizer.sync status:", http.status, "-", http.statusText, "body:", o);
                    syncer.dirty = true;
                    setTimeout(syncFunc, timeout);
                    timeout *= 2;
                }
            };
            http.send(JSON.stringify(o));
        };
        syncer.started = true;
        syncFunc();
    }
}

class QSerializer {
    constructor() {
        this.creators = {};
    }
    register(name, creator) {
        this.creators[name] = creator;
    }
    create(json) {
        for (let key in json) {
            if (key != "id") {
                let creator = this.creators[key];
                if (creator) {
                    return creator(json);
                }
                break;
            }
        }
        alert("unsupport shape: " + JSON.stringify(json));
        return null;
    }
}

var qshapes = new QSerializer();

// QPaintDoc 类
class QPaintDoc {
    constructor() {
        this._reset();
    }

    _reset() {
        this._shapes = [];
        this._idShapeBase = 0;
        this.localID = "";
        this.displayID = "";
        this.ver = 1;
        this.syncer = new QSynchronizer();
        this.onload = null;
    }

    _initShape(shape) {
        if (shape.id != "") {
            alert("Can't init shape twice! shape.id = " + shape.id);
            return shape;
        }
        this._idShapeBase++;
        shape.id = this._idShapeBase.toString();
        return shape;
    }

    _loadDrawing(o) {
        let shapes = [];
        for (let i in o.shapes) {
            let shapeID = o.shapes[i];
            let shape = loadShape(this, shapeID);
            if (shape == null) {
                continue;
            }
            shape.id = shapeID;
            shapes.push(shape);
        }
        this._shapes = shapeds;
    }

    _loadRemoteDrawing(o) {
        let shapes = [];
        let idShapeBase = 0;
        for (let i in o.shapes) {
            let shape = qshapes.create(o.shapes[i]);
            if (shape == null) {
                continue;
            }
            let id = parseInt(shape.id);
            if (id > idShapeBase) {
                idShapeBase = id;
            }
            shapes.push(shape);
            shapeChanged(this, shape, true);
        }
    }
}