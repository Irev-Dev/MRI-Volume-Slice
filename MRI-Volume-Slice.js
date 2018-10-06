

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

}

export default MRISlice;