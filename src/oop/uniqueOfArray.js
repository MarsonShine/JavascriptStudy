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