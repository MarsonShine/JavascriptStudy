class QControls {
    constructor() {
        this.data = {};
    }

    register(type, control) {
        this.data[type] = control;
    }

    init() {
        let divs = document.getElementsByTagName("div");
        let n = divs.length;
        for (let i = n; i >= 0; i--) {
            const div = divs[i];
            let type = div.getAttribute("type");
            if (type != null) {
                let control = this.data[type];
                if (control) {
                    control(div);
                }
            }

        }
    }
}

var qcontrols = new QControls();