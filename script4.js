
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

const myZViewCanvas = document.createElement("canvas");
myZViewCanvas.width = dims.x;
myZViewCanvas.height = dims.y;
const zViewContext = myZViewCanvas.getContext('2d');
zViewContext.putImageData(getZViewSlice(data, 120, dims) ,0,0);
xDiv = document.getElementById('z-view-wrapper');
xDiv.appendChild(myZViewCanvas);

const myYViewCanvas = document.createElement("canvas");
myYViewCanvas.width = dims.x;
myYViewCanvas.height = dims.z;
const yViewContext = myYViewCanvas.getContext('2d');
yViewContext.putImageData(getYViewSlice(data, 240, dims) ,0,0);
yDiv = document.getElementById('y-view-wrapper');
yDiv.appendChild(myYViewCanvas);

const myXViewCanvas = document.createElement("canvas");
myXViewCanvas.width = dims.y;
myXViewCanvas.height = dims.z;
const xViewContext = myXViewCanvas.getContext('2d');
xViewContext.putImageData(getXViewSlice(data, 170, dims) ,0,0);
zDiv = document.getElementById('x-view-wrapper');
zDiv.appendChild(myXViewCanvas);

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

function getZViewSlice(data, slice, size) {
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

myZViewCanvas.addEventListener('click', event => {
    const xCoor = event.x - myZViewCanvas.offsetLeft + document.documentElement.scrollLeft;
    const yCoor = event.y - myZViewCanvas.offsetTop + document.documentElement.scrollTop;
    console.log(document.documentElement.scrollTop);
    xViewContext.putImageData(getXViewSlice(data, xCoor, dims) ,0,0);
    yViewContext.putImageData(getYViewSlice(data, yCoor, dims) ,0,0);
});

myYViewCanvas.addEventListener('click', event => {
    const xCoor = event.pageX - myYViewCanvas.offsetLeft;
    const yCoor = dims.z - (event.pageY - myYViewCanvas.offsetTop);
    xViewContext.putImageData(getXViewSlice(data, xCoor, dims) ,0,0);
    zViewContext.putImageData(getZViewSlice(data, yCoor, dims) ,0,0);
});

myXViewCanvas.addEventListener('click', event => {
    const xCoor = event.pageX - myXViewCanvas.offsetLeft;
    const yCoor = dims.z - (event.pageY - myXViewCanvas.offsetTop);
    console.log(document.documentElement.scrollTop);
    yViewContext.putImageData(getYViewSlice(data, xCoor, dims) ,0,0);
    zViewContext.putImageData(getZViewSlice(data, yCoor, dims) ,0,0);
});

function get1DIndex(x,y,z,size) {
    return z*size.x*size.y + y*size.x + x;
}
