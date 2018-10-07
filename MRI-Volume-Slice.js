

class MRISlice {
    constructor(nifti) {
      this._setupCanvases();
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
      const sliceRGBA = this.volume
          .slice(sliceIndex, sliceIndex + this.size.x * this.size.y)
          .reduce(this._grayScaleToRGB,[]);
      return new ImageData(new Uint8ClampedArray(sliceRGBA),this.size.x, this.size.y);
    }

    getYViewSlice(slice) {
      let sliceRGBA = [];
      for(let zIndex=this.size.z-1; zIndex >= 0; zIndex--) {
          const rowIndex = this._get1DIndex(0,slice,zIndex);
          sliceRGBA.push(...this.volume.slice(rowIndex, rowIndex + this.size.x));
      }
      sliceRGBA = sliceRGBA.reduce(this._grayScaleToRGB,[]);
      return new ImageData(new Uint8ClampedArray(sliceRGBA),this.size.x, this.size.z);
    }

    getXViewSlice(slice) {
      let sliceRGBA = [];
      // The order of these nested loops is important
      for(let yIndex=0; yIndex < this.size.y; yIndex++) {
          for(let zIndex=0; zIndex < this.size.z; zIndex++) {
              sliceRGBA.push(this.volume[this._get1DIndex(slice,yIndex,zIndex)]);
          }
      }
      sliceRGBA = sliceRGBA.reduce(this._grayScaleToRGB,[]);
      return new ImageData(new Uint8ClampedArray(sliceRGBA),this.size.z, this.size.y);
    }

    _get1DIndex(x,y,z) {
      return  x + y*this.size.x + z*this.size.x*this.size.y;
    }

    _grayScaleToRGB(accumulate, RGandB) {
      const alpha = 255;
      accumulate.push(RGandB, RGandB, RGandB, alpha);
      return accumulate;
    }

    _get3DIndex(index,size) {
      const zChunkLength = size.x*size.y;
      const yChunkLength = size.y;
      
      const z = Math.floor(index / zChunkLength);
      const y = Math.floor((index - z) / yChunkLength);
      const x = index - z - y;
  
      return  [x, y, z];
    }

    _setupCanvases() {
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
    }

    _setupNifti(nifti) {
      this.nifti = nifti;

      this.size = {
        x: nifti.sizes[0],
        y: nifti.sizes[1],
        z: nifti.sizes[2],
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
}

export default MRISlice;