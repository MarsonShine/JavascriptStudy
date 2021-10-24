

function search() {
    return findItem(treedata[0],"100100");
}

function getRoot() {
    camas.url('').then(res => {
        let obj = {
            title: res.data.proudctName,
            keys: res.data.id,
            chirld: []
        };
        treedata.push(obj);
    });
}

function onLoadData(treeNode) {
    // let node = findItem(treedata[0], treeNode.keys);
    
    // if (!!node) {
    //     camas.url2(node.keys).then(res => {
    //         let childItem = {
    //             title: res.name,
    //             keys: res.id,
    //             isLeaf: item.isLeaf,
    //             chirld: []
    //         };
    //         node.child = childItem;
    //     });
    // }

    camas.url2(treeNode.dataRef.keys).then(res => {
        let childItem = {
            title: res.name,
            keys: res.id,
            isLeaf: item.isLeaf,
            chirld: []
        };
        treeNode.dataRef.child = childItem;
    });
    this.treeData = [...this.treeData];
    console.warn("找不到指定的树子节点");
}

function onSelect(keys, obj) {
    if(obj.isLeaf) {
        this.fun(obj.id)
    } else {
        let node = findItem(treedata[0], treeNode.keys);
        if (!!node) {
            camas.url2(node.keys).then(res => {
                let childItem = {
                    title: res.name,
                    keys: res.id,
                    isLeaf: item.isLeaf,
                    chirld: []
                };
                node.child = childItem;
            });
        }
    }
}

function findItem(obj,id) {
    if (!!obj.child && obj.child.length > 0) {
        for (let i = 0; i < obj.child.length; i++) {
            const item = obj.child[i];
            if (item.keys == id) {
                return item;
            } 
            if (!!item.child) {
                return findItem(item,id);
            }
        }
    }
    return null;
}

var treedata = [{
    title: "根节点",
    keys: "1",
    isLeaf: false,
    child: [{
        title: "节点001",
        keys: "100",
        isLeaf: false,
        child:[{
            title: "节点001001",
            keys: "100100",
            isLeaf: true
        }]
    },{
        title: "节点002",
        keys: "200",
        isLeaf: false,
        child:[{
            title: "节点002001",
            keys: "200100",
            isLeaf: true
        }]
    }]
}];