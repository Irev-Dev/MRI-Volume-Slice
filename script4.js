const nifti = require('nifti-js');

const myXViewCanvas = document.createElement("canvas");
const myYViewCanvas = document.createElement("canvas");
const myZViewCanvas = document.createElement("canvas");
const zViewContext = myZViewCanvas.getContext('2d');
const yViewContext = myYViewCanvas.getContext('2d');
const xViewContext = myXViewCanvas.getContext('2d');

let data; // globally defined variable with a name as generic as data, what could possibly go wrong - TODO don't do dis

function setUp3ViewPorts() {
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

    myZViewCanvas.width = dims.x;
    myZViewCanvas.height = dims.y;
    zViewContext.putImageData(getZViewSlice(data, 120, dims) ,0,0);
    xDiv = document.getElementById('z-view-wrapper');
    xDiv.appendChild(myZViewCanvas);

    myYViewCanvas.width = dims.x;
    myYViewCanvas.height = dims.z;
    yViewContext.putImageData(getYViewSlice(data, 240, dims) ,0,0);
    yDiv = document.getElementById('y-view-wrapper');
    yDiv.appendChild(myYViewCanvas);

    myXViewCanvas.width = dims.z;
    myXViewCanvas.height = dims.y;
    xViewContext.putImageData(getXViewSlice(data, 170, dims) ,0,0);
    zDiv = document.getElementById('x-view-wrapper');
    zDiv.appendChild(myXViewCanvas);

    myZViewCanvas.addEventListener('click', updateZView);
    myZViewCanvas.addEventListener('mousemove', event => {
        if(mouseDown) {
            updateZView(event);
        }
    });
    
    myYViewCanvas.addEventListener('click', updateYView);
    myYViewCanvas.addEventListener('mousemove', event => {
        if(mouseDown) {
            updateYView(event);
        }
    });
    
    myXViewCanvas.addEventListener('click', updateXView);
    myXViewCanvas.addEventListener('mousemove', event => {
        if(mouseDown) {
            updateXView(event);
        }
    });
}

function getXViewSlice(data, slice, size) {
    let sliceRGBA = [];
    // The order of these nested loops is important
    for(let yIndex=0; yIndex < size.y; yIndex++) {
        for(let zIndex=0; zIndex < size.z; zIndex++) {
            sliceRGBA.push(data[get1DIndex(slice,yIndex,zIndex,size)]);
        }
    }
    sliceRGBA = sliceRGBA.reduce(grayScaleToRGB,[]);
    return new ImageData(new Uint8ClampedArray(sliceRGBA),size.z, size.y);
}


function getYViewSlice(data, slice, size) {
    let sliceRGBA = [];
    for(let zIndex=size.z-1; zIndex >= 0; zIndex--) {
        const rowIndex = get1DIndex(0,slice,zIndex,size);
        sliceRGBA.push(...data.slice(rowIndex, rowIndex + size.x));
    }
    sliceRGBA = sliceRGBA.reduce(grayScaleToRGB,[]);
    return new ImageData(new Uint8ClampedArray(sliceRGBA),size.x, size.z);
}

function getZViewSlice(data, slice, size) {
    const sliceIndex = get1DIndex(0,0,slice,size);
    const sliceRGBA = data
        .slice(sliceIndex, sliceIndex + size.x * size.y)
        .reduce(grayScaleToRGB,[]);
    return new ImageData(new Uint8ClampedArray(sliceRGBA),size.x, size.y);
}

let mouseDown = false;
document.body.addEventListener('mousedown', event => mouseDown = true);
document.body.addEventListener('mouseup', event => mouseDown = false);


function updateZView(event) {
    const xCoor = event.x - myZViewCanvas.offsetLeft + document.documentElement.scrollLeft;
    const yCoor = event.y - myZViewCanvas.offsetTop + document.documentElement.scrollTop;
    xViewContext.putImageData(getXViewSlice(data, xCoor, dims) ,0,0);
    yViewContext.putImageData(getYViewSlice(data, yCoor, dims) ,0,0);
}

function updateYView(event) {
    const xCoor = event.pageX - myYViewCanvas.offsetLeft;
    const yCoor = dims.z - (event.pageY - myYViewCanvas.offsetTop);
    xViewContext.putImageData(getXViewSlice(data, xCoor, dims) ,0,0);
    zViewContext.putImageData(getZViewSlice(data, yCoor, dims) ,0,0);
}

function updateXView(event) {
    const xCoor = event.pageX - myXViewCanvas.offsetLeft + document.documentElement.scrollLeft;
    const yCoor = event.pageY - myXViewCanvas.offsetTop + document.documentElement.scrollTop;
    yViewContext.putImageData(getYViewSlice(data, yCoor, dims) ,0,0);
    zViewContext.putImageData(getZViewSlice(data, xCoor, dims) ,0,0);
}

function grayScaleToRGB(accumulate, RGandB) {
    const alpha = 255;
    accumulate.push(RGandB, RGandB, RGandB, alpha);
    return accumulate;
}

function get1DIndex(x,y,z,size) {
    return  x + y*size.x + z*size.x*size.y;
}

document.getElementById('file-input').onchange = function (event) {
    const fr = new FileReader();
    fr.onload = () => {
        const file = nifti.parse(fr.result);
        data = file.data;
        setUp3ViewPorts();
    }
    const what = fr.readAsArrayBuffer(event.target.files[0]);
  };
