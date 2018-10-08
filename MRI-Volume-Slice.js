
class MRISlice {
    constructor(nifti) {
      this._createCanvases();
      this.loadNewNifti(nifti);
    }
    
    loadNewNifti(nifti) {
      if(nifti) {
        this._setupNifti(nifti);
        this._setCanvasWidthHeight(this.size);
      }
    }

    getZViewSlice(slice) {
      const sliceIndex = this._get1DIndex(0,0,slice);
      const sliceLength = this.size.x * this.size.y;
      const sliceXY = this.volume.slice(sliceIndex, sliceIndex + sliceLength);
      return this._grayScaleToRGBA(sliceXY, this.size.x, this.size.y);
    }

    getYViewSlice(slice) {
      let sliceXZ = [];
      const rowLength = this.size.x;
      for(let zIndex=this.size.z-1; zIndex >= 0; zIndex--) {
          const rowIndex = this._get1DIndex(0,slice,zIndex);
          sliceXZ.push(...this.volume.slice(rowIndex, rowIndex + rowLength));
      }
      return this._grayScaleToRGBA(sliceXZ, this.size.x, this.size.z);
    }

    getXViewSlice(slice) {
      let sliceYZ = [];
      // The order of these nested loops is important
      for(let yIndex=0; yIndex < this.size.y; yIndex++) {
          for(let zIndex=0; zIndex < this.size.z; zIndex++) {
              sliceYZ.push(this.volume[this._get1DIndex(slice,yIndex,zIndex)]);
          }
      }
      return this._grayScaleToRGBA(sliceYZ, this.size.z, this.size.y);
    }

    _grayScaleToRGBA(sliceData, width, height) {
      const rGBASliceData = sliceData.reduce((accumulate, colourChannels) => {
        const alpha = 255;
        accumulate.push(colourChannels, colourChannels, colourChannels, alpha);
        return accumulate;
      },[]);
      return new ImageData(new Uint8ClampedArray(rGBASliceData), width, height);
    }

    _get1DIndex(x,y,z) {
      return  x + y*this.size.x + z*this.size.x*this.size.y;
    }

    _get3DIndex(index,size) {
      const zChunkLength = size.x*size.y;
      const yChunkLength = size.y;
      
      const z = Math.floor(index / zChunkLength);
      const y = Math.floor((index - z) / yChunkLength);
      const x = index - z - y;
  
      return  [x, y, z];
    }

    _createCanvases() {
      this.canvases = {
        x: document.createElement("canvas"),
        y: document.createElement("canvas"),
        z: document.createElement("canvas"),
      };
      this.contexts = {
        x: this.canvases.x.getContext('2d'),
        y: this.canvases.y.getContext('2d'),
        z: this.canvases.z.getContext('2d'),
      }
    }

    _setCanvasWidthHeight(size) {
      this.canvases.x.width = size.z
      this.canvases.x.height = size.y
      this.canvases.y.width = size.x
      this.canvases.y.height = size.z
      this.canvases.z.width = size.x
      this.canvases.z.height = size.y

      this.contexts.x.putImageData(this.getXViewSlice(this.currentView.x) ,0 ,0);
      this.contexts.y.putImageData(this.getYViewSlice(this.currentView.y) ,0 ,0);
      this.contexts.z.putImageData(this.getZViewSlice(this.currentView.z) ,0 ,0);
    }

    _setupNifti(nifti) {
      this.nifti = nifti;

      this.size = {
        x: nifti.sizes[0],
        y: nifti.sizes[1],
        z: nifti.sizes[2],
      };
      
      const midAxis = nifti.sizes.map(size => Math.round(size/2));
      this.currentView = {
        x: midAxis[0],
        y: midAxis[1],
        z: midAxis[2],
      };

      const theMax = nifti.data.reduce((accumulate, item) => {
        accumulate = item > accumulate ? item : accumulate;
        return accumulate;
      }, 0);

      const theMin = nifti.data.reduce((accumulate, item) => {
          accumulate = item < accumulate ? item : accumulate;
          return accumulate;
      }, 0);

      this.volume = nifti.data.map(item => Math.round((item-theMin)*255/(theMax-theMin)));
    }

    mouseNavigationEnabled(isEnabled) {
      if(isEnabled) {
        this.mouseDown = false;
        document.body.addEventListener('mousedown', event => this.mouseDown = true);
        document.body.addEventListener('mouseup', event => this.mouseDown = false);

        this.canvases.z.addEventListener('click', this.updateCanvases);
        this.canvases.z.addEventListener('mousemove', event => {
          if(this.mouseDown) {
            this.updateCanvases(event);
          }
        });
        
        this.canvases.y.addEventListener('click', this.updateCanvases);
        this.canvases.y.addEventListener('mousemove', event => {
          if(this.mouseDown) {
            this.updateCanvases(event);
          }
        });
        
        this.canvases.x.addEventListener('click', this.updateCanvases);
        this.canvases.x.addEventListener('mousemove', event => {
          if(this.mouseDown) {
            this.updateCanvases(event);
          }
        });
      } else {
        //TODO remove event listeners if 
      }
    }
    
    updateCanvases(event) {
      const horizontalCoor = event.x - event.target.offsetLeft; + document.documentElement.scrollLeft;
      const verticalCoor = event.y - event.target.offsetTop + document.documentElement.scrollTop;
  
      const isXCanvas = event.target == this.canvases.x
      const isYCanvas = event.target == this.canvases.y
      const isZCanvas = event.target == this.canvases.z
  
      if(isXCanvas) {
          const yViewNeedsUpdating = verticalCoor !== this.currentView.y;
          const zViewNeedsUpdating = horizontalCoor !== this.currentView.z;
          
          if(yViewNeedsUpdating) {
              this.currentView.y = verticalCoor;
              this.contexts.y.putImageData(this.getYViewSlice(verticalCoor) ,0,0);
          }
          if(zViewNeedsUpdating) {
              this.currentView.z = horizontalCoor;
              this.contexts.z.putImageData(this.getZViewSlice(horizontalCoor) ,0,0);
          }
      } else if (isYCanvas){
          const xViewNeedsUpdating = horizontalCoor !== this.currentView.x;
          const zViewNeedsUpdating = verticalCoor !== this.currentView.z;
          
          if(xViewNeedsUpdating) {
              this.currentView.x = horizontalCoor;
              this.contexts.x.putImageData(this.getXViewSlice(horizontalCoor) ,0,0);
          }
          if(zViewNeedsUpdating) {
              this.currentView.z = verticalCoor;
              this.contexts.z.putImageData(this.getZViewSlice(this.size.z - verticalCoor) ,0,0);
          }
      } else {
          const xViewNeedsUpdating = horizontalCoor !== this.currentView.x;
          const yViewNeedsUpdating = verticalCoor !== this.currentView.y;
          
          if(xViewNeedsUpdating) {
              this.currentView.x = horizontalCoor;
              this.contexts.x.putImageData(this.getXViewSlice(horizontalCoor) ,0,0);
          }
          if(yViewNeedsUpdating) {
              this.currentView.y = verticalCoor;
              this.contexts.y.putImageData(this.getYViewSlice(verticalCoor) ,0,0);
          }
      }
  }
}

export default MRISlice;