
dims = {
    x:240,
    y:280,
    z:240,
};
let a = 60;

const theMax = data.reduce((accumulate, item) => {
    accumulate = item > accumulate ? item : accumulate;
    return accumulate;
}, 0);

console.log(theMax);
data = data.map(item => Math.round(item*255/theMax));

const myXCanvas = document.createElement("canvas");
myXCanvas.width = dims.x;
myXCanvas.height = dims.y;
myXCanvas.id = 'myXCanvas';
const xContext = myXCanvas.getContext('2d');
xContext.putImageData(GetXslice(data, 120, dims) ,0,0);
const myXWrapper = document.getElementById('my-wrapper');
xDiv = document.getElementById('x-wrapper');
xDiv.appendChild(myXCanvas);

const myYCanvas = document.createElement("canvas");
myYCanvas.width = dims.y;
myYCanvas.height = dims.z;
const YContext = myYCanvas.getContext('2d');
YContext.putImageData(GetYslice(data, 240, dims) ,0,0);
yDiv = document.getElementById('y-wrapper');
yDiv.appendChild(myYCanvas);

const myZCanvas = document.createElement("canvas");
myZCanvas.width = dims.z;
myZCanvas.height = dims.x;
const ZContext = myZCanvas.getContext('2d');
ZContext.putImageData(GetZslice(data, 170, dims) ,0,0);
zDiv = document.getElementById('z-wrapper');
zDiv.appendChild(myZCanvas);

function GetZslice(data, slice, size) {
    sliceLength = size.z;
    sliceOffset = sliceLength * slice;
    let sliceRGBA = [];
    const bigly = size.x*size.y;
    for(let j=size.z-1; j >= 0; j--) {
        for(let i=0; i < size.x; i++) {
            sliceRGBA.push(data[i*size.x + j*size.y*size.z + slice]);
            // sliceRGBA.push(data[i*size.x*size.y + j*size.y + sliceOffset]);
        }
    }
    sliceRGBA = sliceRGBA
    .reduce((accumulate, item) => {
        accumulate.push(item, item, item, 255);
        return accumulate;
    },[]);
    return new ImageData(new Uint8ClampedArray(sliceRGBA),size.z, size.x);
}


function GetYslice(data, slice, size) {
    sliceLength = size.x;
    sliceOffset = sliceLength * slice;
    let sliceRGBA = [];
    for(let i=size.y-1; i >= 0; i--) {
        sliceRGBA.push(...data.slice(i*size.x*size.y + sliceOffset, i*size.x*size.y + size.y + sliceOffset));
    }
    sliceRGBA = sliceRGBA
    .reduce((accumulate, item) => {
        accumulate.push(item, item, item, 255);
        return accumulate;
    },[]);
    return new ImageData(new Uint8ClampedArray(sliceRGBA),size.y, size.z);
}

function GetXslice(data, slice, size) {
    sliceLength = size.x * size.y;
    sliceOffset = sliceLength * slice;
    const sliceRGBA = data
    .slice(sliceOffset, sliceOffset + sliceLength)
    .reduce((accumulate, item) => {
        accumulate.push(item, item, item, 255);
        return accumulate;
    },[]);
    return new ImageData(new Uint8ClampedArray(sliceRGBA),size.x, size.y);
}


rectX = myXCanvas.getBoundingClientRect();
myXCanvas.addEventListener('mousemove', event => {
    const xCoor = event.x - rectX.x
    const yCoor = event.y - rectX.y
    ZContext.putImageData(GetZslice(data, xCoor, dims) ,0,0);
    zDiv.appendChild(myZCanvas);
    YContext.putImageData(GetYslice(data, yCoor, dims) ,0,0);
    yDiv.appendChild(myYCanvas);
});

rectY = myYCanvas.getBoundingClientRect();
myYCanvas.addEventListener('mousemove', event => {
    const xCoor = event.x - rectY.x
    const yCoor = event.y - rectY.y
    console.log(xCoor, yCoor, event.y, rectY.y);
    xContext.putImageData(GetXslice(data, yCoor, dims) ,0,0);
    xDiv.appendChild(myZCanvas);
    ZContext.putImageData(GetZslice(data, xCoor, dims) ,0,0);
    zDiv.appendChild(myZCanvas);
});


// let lolk = data.slice(0,240*280*a).reduce((acc,item) => {
//     acc.push(item,item,item,255);
//     return acc;
// },[]);
// outputData = new ImageData(new Uint8ClampedArray(lolk),240, 280*a);