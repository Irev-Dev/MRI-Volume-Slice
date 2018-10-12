/* global document, ImageData, Uint8ClampedArray */

class MRISlice {
  constructor(nifti) {
    this._createCanvases();
    this.loadNewNifti(nifti);
    this.useCrosshairs = true;
    this.lastEvent = null;
    this.scrollDistance = 1;
    this.currentImageData = {};
  }

  loadNewNifti(nifti) {
    if (nifti) {
      this._setupNifti(nifti);
      this._setCanvasWidthHeight(this.size);
      this._drawCrossHairs(this.currentView);
    }
  }

  getZViewSlice(slice) {
    const sliceIndex = get1DIndex(0, 0, slice, this.size);
    const sliceLength = this.size.x * this.size.y;
    const sliceXY = this.volume.slice(sliceIndex, sliceIndex + sliceLength);
    return grayScaleToRGBA(sliceXY, this.size.x, this.size.y);
  }

  getYViewSlice(slice) {
    const sliceXZ = [];
    const rowLength = this.size.x;
    for (let zIndex = this.size.z - 1; zIndex >= 0; zIndex--) {
      const rowIndex = get1DIndex(0, slice, zIndex, this.size);
      sliceXZ.push(...this.volume.slice(rowIndex, rowIndex + rowLength));
    }
    return grayScaleToRGBA(sliceXZ, this.size.x, this.size.z);
  }

  getXViewSlice(slice) {
    const sliceYZ = [];
    // The order of these nested loops is important
    for (let yIndex = 0; yIndex < this.size.y; yIndex++) {
      for (let zIndex = 0; zIndex < this.size.z; zIndex++) {
        sliceYZ.push(this.volume[get1DIndex(slice, yIndex, zIndex, this.size)]);
      }
    }
    return grayScaleToRGBA(sliceYZ, this.size.z, this.size.y);
  }

  _createCanvases() {
    this.canvases = {
      x: document.createElement('canvas'),
      y: document.createElement('canvas'),
      z: document.createElement('canvas'),
    };
    this.contexts = {
      x: this.canvases.x.getContext('2d'),
      y: this.canvases.y.getContext('2d'),
      z: this.canvases.z.getContext('2d'),
    };
  }

  _setCanvasWidthHeight(size) {
    this.canvases.x.width = size.z;
    this.canvases.x.height = size.y;
    this.canvases.y.width = size.x;
    this.canvases.y.height = size.z;
    this.canvases.z.width = size.x;
    this.canvases.z.height = size.y;

    this.currentImageData.x = this.getXViewSlice(this.currentView.x);
    this.currentImageData.y = this.getYViewSlice(this.currentView.y);
    this.currentImageData.z = this.getZViewSlice(this.currentView.z);

    Object.entries(this.contexts).forEach(([axis, canvas]) => {
      const imageData = this.currentImageData[axis];
      canvas.putImageData(imageData, 0, 0);
    });
  }

  _setupNifti(nifti) {
    this.nifti = nifti;

    this.size = {
      x: nifti.sizes[0],
      y: nifti.sizes[1],
      z: nifti.sizes[2],
    };

    const midAxis = nifti.sizes.map(size => Math.round(size / 2));
    this.currentView = {
      x: midAxis[0],
      y: midAxis[1],
      z: midAxis[2],
    };

    const theMax = nifti.data.reduce((accumulate, item) => {
      accumulate = item > accumulate ? item : accumulate; // eslint-disable-line no-param-reassign
      return accumulate;
    }, 0);

    const theMin = nifti.data.reduce((accumulate, item) => {
      accumulate = item < accumulate ? item : accumulate; // eslint-disable-line no-param-reassign
      return accumulate;
    }, 0);

    this.volume = new Uint8ClampedArray(
      nifti.data.map(item => Math.round((item - theMin) * 255 / (theMax - theMin))),
    );
  }

  mouseNavigationEnabled(isEnabled) {
    if (isEnabled) {
      this.mouseDown = false;
      document.body.addEventListener('mousedown', () => this.mouseDown = true); // eslint-disable-line no-return-assign
      document.body.addEventListener('mouseup', () => this.mouseDown = false); // eslint-disable-line no-return-assign
      Object.values(this.canvases).forEach((canvas) => {
        canvas.addEventListener('mousedown', event => this.updateCanvases(event));
        canvas.addEventListener('mousemove', (event) => {
          if (this.mouseDown) this.updateCanvases(event);
        });
        canvas.addEventListener('wheel', (event) => {
          event.preventDefault();
          const fakeEvent = {
            target: event.target,
            type: 'wheel',
            deltaY: 0,
          };

          if (event.deltaY > 0) { // scrolling down
            fakeEvent.deltaY = this.scrollDistance;
          } else if (event.deltaY < 0) { // scrolling up
            fakeEvent.deltaY = -this.scrollDistance;
          }
          this.updateCanvases(fakeEvent);
        });
      });
    } else {
      // TODO remove event listeners if
    }
  }

  updateCanvases(event) {
    this.lastEvent = event;
    const horizontalCoor = event.x - event.target.offsetLeft;
    const verticalCoor = event.y - event.target.offsetTop + document.documentElement.scrollTop;

    const isXCanvas = event.target === this.canvases.x;
    const isYCanvas = event.target === this.canvases.y;
    // const isZCanvas = event.target === this.canvases.z;

    if (isXCanvas) {
      const yViewNeedsUpdating = verticalCoor !== this.currentView.y;
      const zViewNeedsUpdating = horizontalCoor !== this.currentView.z;
      const xViewNeedsUpdating = event.type === 'wheel';

      if (xViewNeedsUpdating) {
        this._updateCurrentView({ x: this.currentView.x + event.deltaY });
        this.currentImageData.x = this.getXViewSlice(this.currentView.x);
      } else {
        if (yViewNeedsUpdating) {
          this.currentView.y = verticalCoor;
          this.currentImageData.y = this.getYViewSlice(verticalCoor);
        }
        if (zViewNeedsUpdating) {
          this.currentView.z = horizontalCoor;
          this.currentImageData.z = this.getZViewSlice(horizontalCoor);
        }
      }
    } else if (isYCanvas) {
      const xViewNeedsUpdating = horizontalCoor !== this.currentView.x;
      const zViewNeedsUpdating = verticalCoor !== this.currentView.z;
      const yViewNeedsUpdating = event.type === 'wheel';

      if (yViewNeedsUpdating) {
        this._updateCurrentView({ y: this.currentView.y + event.deltaY });
        this.currentImageData.y = this.getYViewSlice(this.currentView.y);
      } else {
        if (xViewNeedsUpdating) {
          this.currentView.x = horizontalCoor;
          this.currentImageData.x = this.getXViewSlice(horizontalCoor);
        }
        if (zViewNeedsUpdating) {
          this.currentView.z = this.size.z - verticalCoor;
          this.currentImageData.z = this.getZViewSlice(this.size.z - verticalCoor);
        }
      }
    } else {
      const xViewNeedsUpdating = horizontalCoor !== this.currentView.x;
      const yViewNeedsUpdating = verticalCoor !== this.currentView.y;
      const zViewNeedsUpdating = event.type === 'wheel';

      if (zViewNeedsUpdating) {
        this._updateCurrentView({ z: this.currentView.z + event.deltaY });
        this.currentImageData.z = this.getZViewSlice(this.currentView.z);
      } else {
        if (xViewNeedsUpdating) {
          this.currentView.x = horizontalCoor;
          this.currentImageData.x = this.getXViewSlice(horizontalCoor);
        }
        if (yViewNeedsUpdating) {
          this.currentView.y = verticalCoor;
          this.currentImageData.y = this.getYViewSlice(verticalCoor);
        }
      }
    }

    this._drawCrossHairs(this.currentView);
  }

  showCrosshairs() {
    this.useCrosshairs = true;
    this._drawCrossHairs(this.currentView);
  }

  hideCrossHairs() {
    this.useCrosshairs = false;
    this._drawCrossHairs(this.currentView);
  }

  _drawCrossHairs(viewCoors) {
    this.contexts.x.putImageData(this.currentImageData.x, 0, 0);
    this.contexts.y.putImageData(this.currentImageData.y, 0, 0);
    this.contexts.z.putImageData(this.currentImageData.z, 0, 0);

    const transparent = 'rgba(255, 255, 255, 0';
    const xHairColor = 'yellow';
    const yHairColor = 'cyan';
    const zHairColor = 'magenta';

    this.contexts.z.fillStyle = this.useCrosshairs ? xHairColor : transparent;
    this.contexts.y.fillStyle = this.useCrosshairs ? xHairColor : transparent;
    this.contexts.z.fillRect(viewCoors.x, 0, 1, this.size.y);
    this.contexts.y.fillRect(viewCoors.x, 0, 1, this.size.z);

    this.contexts.z.fillStyle = this.useCrosshairs ? yHairColor : transparent;
    this.contexts.x.fillStyle = this.useCrosshairs ? yHairColor : transparent;
    this.contexts.z.fillRect(0, viewCoors.y, this.size.x, 1);
    this.contexts.x.fillRect(0, viewCoors.y, this.size.z, 1);

    this.contexts.x.fillStyle = this.useCrosshairs ? zHairColor : transparent;
    this.contexts.y.fillStyle = this.useCrosshairs ? zHairColor : transparent;
    this.contexts.x.fillRect(viewCoors.z, 0, 1, this.size.y);
    this.contexts.y.fillRect(0, this.size.z - viewCoors.z, this.size.x, 1);
  }

  _updateCurrentView({ x, y, z }) {
    if (x && x >= 0 && x < this.size.x) {
      this.currentView.x = x;
    }
    if (y && y >= 0 && y < this.size.y) {
      this.currentView.y = y;
    }
    if (z && z >= 0 && z < this.size.z) {
      this.currentView.z = z;
    }
  }
}

function grayScaleToRGBA(sliceData, width, height) {
  const rGBASliceData = sliceData.reduce((accumulate, colourChannels) => {
    const alpha = 255;
    accumulate.push(colourChannels, colourChannels, colourChannels, alpha);
    return accumulate;
  }, []);
  return new ImageData(new Uint8ClampedArray(rGBASliceData), width, height);
}

function get1DIndex(x, y, z, sizes) {
  return x + y * sizes.x + z * sizes.x * sizes.y;
}

// function get3DIndex(index, size) {
//   const zChunkLength = size.x * size.y;
//   const yChunkLength = size.y;

//   const z = Math.floor(index / zChunkLength);
//   const y = Math.floor((index - z) / yChunkLength);
//   const x = index - z - y;

//   return [x, y, z];
// }

export default MRISlice;
