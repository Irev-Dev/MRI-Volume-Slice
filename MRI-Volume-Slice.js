

class MRISlice {
    constructor(nifti) {
      this.nifti = nifti;

      this.size = {
        x: nifti.sizes[0],
        y: nifti.sizes[1],
        z: nifti.sizes[2],
      };
      
      // this.volume = nifti.data;

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

    _get1DIndex(x,y,z) {
      return  x + y*this.size.x + z*this.size.x*this.size.y;
    }

    _grayScaleToRGB(accumulate, RGandB) {
      const alpha = 255;
      accumulate.push(RGandB, RGandB, RGandB, alpha);
      return accumulate;
    }

}

export default MRISlice;