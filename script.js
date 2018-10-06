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
    yViewContext.putImageData(mRISlice.getYViewSlice(Math.round(mRISlice.size.y/2)) ,0,0);
    const yDiv = document.getElementById('y-view-wrapper');
    yDiv.appendChild(myYViewCanvas);

    myXViewCanvas.width = mRISlice.size.z;
    myXViewCanvas.height = mRISlice.size.y;
    xViewContext.putImageData(mRISlice.getXViewSlice(Math.round(mRISlice.size.x/2)) ,0,0);
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

let mouseDown = false;
document.body.addEventListener('mousedown', event => mouseDown = true);
document.body.addEventListener('mouseup', event => mouseDown = false);


function updateZView(event) {
    const xCoor = event.x - myZViewCanvas.offsetLeft + document.documentElement.scrollLeft;
    const yCoor = event.y - myZViewCanvas.offsetTop + document.documentElement.scrollTop;
    xViewContext.putImageData(mRISlice.getXViewSlice(xCoor) ,0,0);
    yViewContext.putImageData(mRISlice.getYViewSlice(yCoor) ,0,0);
}

function updateYView(event) {
    const xCoor = event.pageX - myYViewCanvas.offsetLeft;
    const yCoor = mRISlice.size.z - (event.pageY - myYViewCanvas.offsetTop);
    xViewContext.putImageData(mRISlice.getXViewSlice(xCoor) ,0,0);
    zViewContext.putImageData(mRISlice.getZViewSlice(yCoor) ,0,0);
}

function updateXView(event) {
    const xCoor = event.pageX - myXViewCanvas.offsetLeft + document.documentElement.scrollLeft;
    const yCoor = event.pageY - myXViewCanvas.offsetTop + document.documentElement.scrollTop;
    yViewContext.putImageData(mRISlice.getYViewSlice(yCoor) ,0,0);
    zViewContext.putImageData(mRISlice.getZViewSlice(xCoor) ,0,0);
}

document.getElementById('file-input').onchange = function (event) {
    const fr = new FileReader();
    fr.onload = () => {
        mRISlice = new MRISlice(nifti.parse(fr.result));
        setUp3ViewPorts();
    }
    fr.readAsArrayBuffer(event.target.files[0]);
  };
