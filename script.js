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

    mRISlice.canvases.z.addEventListener('click', updateCanvases);
    mRISlice.canvases.z.addEventListener('mousemove', event => {
        if(mouseDown) {
            updateCanvases(event);
        }
    });
    
    mRISlice.canvases.y.addEventListener('click', updateCanvases);
    mRISlice.canvases.y.addEventListener('mousemove', event => {
        if(mouseDown) {
            updateCanvases(event);
        }
    });
    
    mRISlice.canvases.x.addEventListener('click', updateCanvases);
    mRISlice.canvases.x.addEventListener('mousemove', event => {
        if(mouseDown) {
            updateCanvases(event);
        }
    });
}

let mouseDown = false;
document.body.addEventListener('mousedown', event => mouseDown = true);
document.body.addEventListener('mouseup', event => mouseDown = false);

function updateCanvases(event) {
    const horizontalCoor = event.x - event.target.offsetLeft; + document.documentElement.scrollLeft;
    const verticalCoor = event.y - event.target.offsetTop + document.documentElement.scrollTop;

    const isXCanvas = event.target == mRISlice.canvases.x
    const isYCanvas = event.target == mRISlice.canvases.y
    const isZCanvas = event.target == mRISlice.canvases.z

    if(isXCanvas) {
        const yViewNeedsUpdating = verticalCoor !== mRISlice.currentView.y;
        const zViewNeedsUpdating = horizontalCoor !== mRISlice.currentView.z;
        
        if(yViewNeedsUpdating) {
            mRISlice.currentView.y = verticalCoor;
            mRISlice.contexts.y.putImageData(mRISlice.getYViewSlice(verticalCoor) ,0,0);
        }
        if(zViewNeedsUpdating) {
            mRISlice.currentView.z = horizontalCoor;
            mRISlice.contexts.z.putImageData(mRISlice.getZViewSlice(horizontalCoor) ,0,0);
        }
    } else if (isYCanvas){
        const xViewNeedsUpdating = horizontalCoor !== mRISlice.currentView.x;
        const zViewNeedsUpdating = verticalCoor !== mRISlice.currentView.z;
        
        if(xViewNeedsUpdating) {
            mRISlice.currentView.x = horizontalCoor;
            mRISlice.contexts.x.putImageData(mRISlice.getXViewSlice(horizontalCoor) ,0,0);
        }
        if(zViewNeedsUpdating) {
            mRISlice.currentView.z = verticalCoor;
            mRISlice.contexts.z.putImageData(mRISlice.getZViewSlice(mRISlice.size.z - verticalCoor) ,0,0);
        }
    } else {
        const xViewNeedsUpdating = horizontalCoor !== mRISlice.currentView.x;
        const yViewNeedsUpdating = verticalCoor !== mRISlice.currentView.y;
        
        if(xViewNeedsUpdating) {
            mRISlice.currentView.x = horizontalCoor;
            mRISlice.contexts.x.putImageData(mRISlice.getXViewSlice(horizontalCoor) ,0,0);
        }
        if(yViewNeedsUpdating) {
            mRISlice.currentView.y = verticalCoor;
            mRISlice.contexts.y.putImageData(mRISlice.getYViewSlice(verticalCoor) ,0,0);
        }
    }
}

document.getElementById('file-input').onchange = function (event) {
    const fr = new FileReader();
    fr.onload = () => {
        mRISlice.loadNewNifti(nifti.parse(fr.result));
        setUp3ViewPorts();
    }
    fr.readAsArrayBuffer(event.target.files[0]);
  };
