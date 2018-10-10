import 'babel-polyfill';
import nifti from 'nifti-js';
import MRISlice from './MRI-Volume-Slice';
import niftiData from './data/sub-study002_ses-after_anat_sub-study002_ses-after_T1w.nii';

const mRISlice = new MRISlice();

const xDiv = document.getElementById('z-view-wrapper');
const yDiv = document.getElementById('y-view-wrapper');
const zDiv = document.getElementById('x-view-wrapper');

loadDefaultData(niftiData);
appendCanvasesToHTML();

function appendCanvasesToHTML() {
    xDiv.appendChild(mRISlice.canvases.z);
    yDiv.appendChild(mRISlice.canvases.y);
    zDiv.appendChild(mRISlice.canvases.x);
}

document.getElementById('file-input').onchange = function (event) {
    const fr = new FileReader();
    fr.onload = setupNifti;
    fr.readAsArrayBuffer(event.target.files[0]);
};

document.getElementById('toggle-cross-hairs').onchange = function (event) {
    if(event.target.checked) {
        mRISlice.showCrosshairs();
    }else{
        mRISlice.hideCrossHairs();
    }
};

document.querySelectorAll('canvas').forEach(function(canvas) {
    canvas.onwheel = function(event) {
        event.preventDefault();
    }
});

function setupNifti(event) {
    mRISlice.loadNewNifti(nifti.parse(event.target.result));
    mRISlice.mouseNavigationEnabled('enable please')
}

async function loadDefaultData(niftiData) {
    const response = await fetch(niftiData);
    const blob = await response.blob();

    const fr = new FileReader();
    fr.onload = setupNifti;
    fr.readAsArrayBuffer(blob);
}
