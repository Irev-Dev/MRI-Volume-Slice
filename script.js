import nifti from 'nifti-js';
import MRISlice from './MRI-Volume-Slice';

const mRISlice = new MRISlice();

function setUp3ViewPorts() {

    const xDiv = document.getElementById('z-view-wrapper');
    xDiv.appendChild(mRISlice.canvases.z);

    const yDiv = document.getElementById('y-view-wrapper');
    yDiv.appendChild(mRISlice.canvases.y);

    const zDiv = document.getElementById('x-view-wrapper');
    zDiv.appendChild(mRISlice.canvases.x);

    mRISlice.canvases.z.addEventListener('click', updateZView);
    mRISlice.canvases.z.addEventListener('mousemove', event => {
        if(mouseDown) {
            updateZView(event);
        }
    });
    
    mRISlice.canvases.y.addEventListener('click', updateYView);
    mRISlice.canvases.y.addEventListener('mousemove', event => {
        if(mouseDown) {
            updateYView(event);
        }
    });
    
    mRISlice.canvases.x.addEventListener('click', updateXView);
    mRISlice.canvases.x.addEventListener('mousemove', event => {
        if(mouseDown) {
            updateXView(event);
        }
    });
}

let mouseDown = false;
document.body.addEventListener('mousedown', event => mouseDown = true);
document.body.addEventListener('mouseup', event => mouseDown = false);

function updateZView(event) {
    const xCoor = event.x - mRISlice.canvases.z.offsetLeft + document.documentElement.scrollLeft;
    const yCoor = event.y - mRISlice.canvases.z.offsetTop + document.documentElement.scrollTop;
    mRISlice.contexts.x.putImageData(mRISlice.getXViewSlice(xCoor) ,0,0);
    mRISlice.contexts.y.putImageData(mRISlice.getYViewSlice(yCoor) ,0,0);
}

function updateYView(event) {
    const xCoor = event.pageX - mRISlice.canvases.y.offsetLeft;
    const yCoor = mRISlice.size.z - (event.pageY - mRISlice.canvases.y.offsetTop);
    mRISlice.contexts.x.putImageData(mRISlice.getXViewSlice(xCoor) ,0,0);
    mRISlice.contexts.z.putImageData(mRISlice.getZViewSlice(yCoor) ,0,0);
}

function updateXView(event) {
    const xCoor = event.pageX - mRISlice.canvases.x.offsetLeft + document.documentElement.scrollLeft;
    const yCoor = event.pageY - mRISlice.canvases.x.offsetTop + document.documentElement.scrollTop;
    mRISlice.contexts.y.putImageData(mRISlice.getYViewSlice(yCoor) ,0,0);
    mRISlice.contexts.z.putImageData(mRISlice.getZViewSlice(xCoor) ,0,0);
}

document.getElementById('file-input').onchange = function (event) {
    const fr = new FileReader();
    fr.onload = () => {
        mRISlice.loadNewNifti(nifti.parse(fr.result));
        setUp3ViewPorts();
    }
    fr.readAsArrayBuffer(event.target.files[0]);
  };
