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

    mRISlice.canvases.z.addEventListener('click', mRISlice.updateCanvases);
    mRISlice.canvases.z.addEventListener('mousemove', event => {
        if(mouseDown) {
            mRISlice.updateCanvases(event);
        }
    });
    
    mRISlice.canvases.y.addEventListener('click', mRISlice.updateCanvases);
    mRISlice.canvases.y.addEventListener('mousemove', event => {
        if(mouseDown) {
            mRISlice.updateCanvases(event);
        }
    });
    
    mRISlice.canvases.x.addEventListener('click', mRISlice.updateCanvases);
    mRISlice.canvases.x.addEventListener('mousemove', event => {
        if(mouseDown) {
            mRISlice.updateCanvases(event);
        }
    });
}

let mouseDown = false;
document.body.addEventListener('mousedown', event => mouseDown = true);
document.body.addEventListener('mouseup', event => mouseDown = false);


document.getElementById('file-input').onchange = function (event) {
    const fr = new FileReader();
    fr.onload = () => {
        mRISlice.loadNewNifti(nifti.parse(fr.result));
        setUp3ViewPorts();
    }
    fr.readAsArrayBuffer(event.target.files[0]);
  };
