const nifti = require('nifti-js');
// const MRISlice = require('./MRI-Volume-Slice');
import MRISlice from './MRI-Volume-Slice';

let mRISlice;

const myXViewCanvas = document.createElement("canvas");
const myYViewCanvas = document.createElement("canvas");
const myZViewCanvas = document.createElement("canvas");
const zViewContext = myZViewCanvas.getContext('2d');
const yViewContext = myYViewCanvas.getContext('2d');
const xViewContext = myXViewCanvas.getContext('2d');

function setUp3ViewPorts() {

    myZViewCanvas.width = mRISlice.size.x;
    myZViewCanvas.height = mRISlice.size.y;
    zViewContext.putImageData(mRISlice.getZViewSlice(Math.round(mRISlice.size.z/2)) ,0,0);
    const xDiv = document.getElementById('z-view-wrapper');
    xDiv.appendChild(myZViewCanvas);

    myYViewCanvas.width = mRISlice.size.x;
    myYViewCanvas.height = mRISlice.size.z;
    yViewContext.putImageData(getYViewSlice(mRISlice.volume, Math.round(mRISlice.size.y/2), mRISlice.size) ,0,0);
    const yDiv = document.getElementById('y-view-wrapper');
    yDiv.appendChild(myYViewCanvas);

    myXViewCanvas.width = mRISlice.size.z;
    myXViewCanvas.height = mRISlice.size.y;
    xViewContext.putImageData(getXViewSlice(mRISlice.volume, Math.round(mRISlice.size.x/2), mRISlice.size) ,0,0);
    const zDiv = document.getElementById('x-view-wrapper');
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

let mouseDown = false;
document.body.addEventListener('mousedown', event => mouseDown = true);
document.body.addEventListener('mouseup', event => mouseDown = false);


function updateZView(event) {
    const xCoor = event.x - myZViewCanvas.offsetLeft + document.documentElement.scrollLeft;
    const yCoor = event.y - myZViewCanvas.offsetTop + document.documentElement.scrollTop;
    xViewContext.putImageData(getXViewSlice(mRISlice.volume, xCoor, mRISlice.size) ,0,0);
    yViewContext.putImageData(getYViewSlice(mRISlice.volume, yCoor, mRISlice.size) ,0,0);
}

function updateYView(event) {
    const xCoor = event.pageX - myYViewCanvas.offsetLeft;
    const yCoor = mRISlice.size.z - (event.pageY - myYViewCanvas.offsetTop);
    xViewContext.putImageData(getXViewSlice(mRISlice.volume, xCoor, mRISlice.size) ,0,0);
    zViewContext.putImageData(mRISlice.getZViewSlice(yCoor) ,0,0);
}

function updateXView(event) {
    const xCoor = event.pageX - myXViewCanvas.offsetLeft + document.documentElement.scrollLeft;
    const yCoor = event.pageY - myXViewCanvas.offsetTop + document.documentElement.scrollTop;
    yViewContext.putImageData(getYViewSlice(mRISlice.volume, yCoor, mRISlice.size) ,0,0);
    zViewContext.putImageData(mRISlice.getZViewSlice(xCoor) ,0,0);
}

function grayScaleToRGB(accumulate, RGandB) {
    const alpha = 255;
    accumulate.push(RGandB, RGandB, RGandB, alpha);
    return accumulate;
}

function get1DIndex(x,y,z,size) {
    return  x + y*size.x + z*size.x*size.y;
}

function get3DIndex(index,size) {
    const zChunkLength = size.x*size.y;
    const yChunkLength = size.y;
    
    const z = Math.floor(index / zChunkLength);
    const y = Math.floor((index - z) / yChunkLength);
    const x = index - z - y;

    return  [x, y, z];
}

document.getElementById('file-input').onchange = function (event) {
    const fr = new FileReader();
    fr.onload = () => {
        mRISlice = new MRISlice(nifti.parse(fr.result));
        setUp3ViewPorts();
    }
    fr.readAsArrayBuffer(event.target.files[0]);
  };
