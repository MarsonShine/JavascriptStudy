var arrayA = [{
        id: 1,
        name: 'zhu'
    },
    {
        id: 2,
        name: 'zhu'
    }
]

var arrayB = [{
        productId: 1,
        value: '2222'
    },
    {
        productId: 3,
        value: '2222'
    },
    {
        productId: 2,
        value: '2222'
    }
]

var obj = {};
arrayA.forEach(item => {
    obj[item.id] = true;
});

var resultArray = [];
arrayB.forEach(item => {
    if (!obj[item.productId]) {
        var c = {
            cid: item.productId,
            unit: 1,
            nub: 10
        }
        resultArray.push(c);
    }
});
console.log(resultArray);

// 高效去重

// 判断数组C中的元素是否在数组D中存在，如果不存在则push到数组D中
var arrayC = [{id:1},{id:2},{id:3},{id:4}];
var arrayD = [{id:1},{id:2},{id:5},{id:6},{id:7}];
if(arrayC?.length > 0){
    arrayC.forEach(itemC => {
        if(arrayD.filter(itemD => itemC.id === itemD.id).length == 0){
            arrayD.push(itemC);
        }
    })
}