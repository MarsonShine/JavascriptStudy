const imageUrl = 'https://img30.pinhui001.cn///group1/M00/01/09/CqArGltqUYWANOAPAAA334PbZg0429.jpg';
function loadImage() {
    let image = new Image();
    image.src = imageUrl;
    image.crossOrigin = "anonymouse";
    image.onload = function () {
        console.log("loaded");
    }
    return image;
}

function toBase64(image) {
    let canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    return canvas.toDataURL('image/jpg');
}