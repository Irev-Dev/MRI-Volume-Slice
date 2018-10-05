
dims = {
    x:240,
    y:280,
    z:240,
};

const theMax = data.reduce((accumulate, item) => {
    accumulate = item > accumulate ? item : accumulate;
    return accumulate;
}, 0);

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

const myYViewCanvas = document.createElement("canvas");
myYViewCanvas.width = dims.x;
myYViewCanvas.height = dims.z;
const YContext = myYViewCanvas.getContext('2d');
YContext.putImageData(getYViewSlice(data, 240, dims) ,0,0);
yDiv = document.getElementById('y-view-wrapper');
yDiv.appendChild(myYViewCanvas);

const myZCanvas = document.createElement("canvas");
myZCanvas.width = dims.y;
myZCanvas.height = dims.z;
const ZContext = myZCanvas.getContext('2d');
ZContext.putImageData(getXViewSlice(data, 170, dims) ,0,0);
zDiv = document.getElementById('x-view-wrapper');
zDiv.appendChild(myZCanvas);

function getXViewSlice(data, slice, size) {
    sliceLength = size.z;
    sliceOffset = sliceLength * slice;
    let sliceRGBA = [];
    const bigly = size.x*size.y;
    for(let j=size.z-1; j >= 0; j--) {
        for(let i=0; i < size.y; i++) {
            sliceRGBA.push(data[get1DIndex(slice,i,j,size)]);
        }
    }
    sliceRGBA = sliceRGBA
    .reduce((accumulate, item) => {
        accumulate.push(item, item, item, 255);
        return accumulate;
    },[]);
    return new ImageData(new Uint8ClampedArray(sliceRGBA),size.y, size.z);
}


function getYViewSlice(data, slice, size) {
    sliceLength = size.x;
    sliceOffset = sliceLength * slice;
    let sliceRGBA = [];
    for(let i=size.z-1; i >= 0; i--) {
        sliceRGBA.push(...data.slice(get1DIndex(0,slice,i,size), get1DIndex(0,slice,i,size) + size.x));
    }
    sliceRGBA = sliceRGBA
    .reduce((accumulate, item) => {
        accumulate.push(item, item, item, 255);
        return accumulate;
    },[]);
    return new ImageData(new Uint8ClampedArray(sliceRGBA),size.x, size.z);
}

function GetXslice(data, slice, size) {
    sliceLength = size.x * size.y;
    sliceOffset = sliceLength * slice;
    const sliceRGBA = data
    .slice(get1DIndex(0,0,slice,size), get1DIndex(0,0,slice,size) + sliceLength)
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
    ZContext.putImageData(getXViewSlice(data, xCoor, dims) ,0,0);
    YContext.putImageData(getYViewSlice(data, yCoor, dims) ,0,0);
});

function get1DIndex(x,y,z,size) {
    return z*size.x*size.y + y*size.x + x;
}
