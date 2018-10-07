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

}

document.getElementById('file-input').onchange = function (event) {
    const fr = new FileReader();
    fr.onload = () => {
        mRISlice.loadNewNifti(nifti.parse(fr.result));
        setUp3ViewPorts();
        mRISlice.mouseNavigationEnabled('enable please')
    }
    fr.readAsArrayBuffer(event.target.files[0]);
  };
