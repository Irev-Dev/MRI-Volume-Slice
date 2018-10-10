import 'babel-polyfill';
import nifti from 'nifti-js';
import pako from 'pako';
import MRISlice from './MRI-Volume-Slice';

const mRISlice = new MRISlice();

const xDiv = document.getElementById('z-view-wrapper');
const yDiv = document.getElementById('y-view-wrapper');
const zDiv = document.getElementById('x-view-wrapper');

loadDefaultData();
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

function setupNifti(file) {
    mRISlice.loadNewNifti(nifti.parse(file));
    mRISlice.mouseNavigationEnabled('enable please')
}

async function loadDefaultData() {
    const url = 'https://openneuro.org/crn/datasets/ds001417/files/sub-study002:ses-after:anat:sub-study002_ses-after_T1w.nii.gz'
    const response = await fetch(url);
    const blob = await response.arrayBuffer();
    const compressed = new Uint8Array(blob);
    const file = pako.inflate(compressed);
    setupNifti(file)
}
