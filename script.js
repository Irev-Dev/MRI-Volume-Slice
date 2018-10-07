import nifti from 'nifti-js';
import MRISlice from './MRI-Volume-Slice';

const mRISlice = new MRISlice();

const xDiv = document.getElementById('z-view-wrapper');
const yDiv = document.getElementById('y-view-wrapper');
const zDiv = document.getElementById('x-view-wrapper');

function appendCanvasesToHTML() {
    xDiv.appendChild(mRISlice.canvases.z);
    yDiv.appendChild(mRISlice.canvases.y);
    zDiv.appendChild(mRISlice.canvases.x);
}

document.getElementById('file-input').onchange = function (event) {
    const fr = new FileReader();
    fr.onload = () => {
        mRISlice.loadNewNifti(nifti.parse(fr.result));
        appendCanvasesToHTML();
        mRISlice.mouseNavigationEnabled('enable please')
    }
    fr.readAsArrayBuffer(event.target.files[0]);
  };
