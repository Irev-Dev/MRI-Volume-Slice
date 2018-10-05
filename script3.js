const nifti = require('nifti-js');
const images = require('images');
// const canvas = require('canvas');
// const hi = new Image;
// console.log(hi);
// Image = require('Image');
// theNiftiData = require('./data/ZI_anat.nii');
fs = require('fs');
// import nifti from 'nifti-js';
// import theNiftiData from './data/ZI_anat.nii';
// import filely from 'read-json-sync';

// console.log('hi');
// console.log(nifti);
console.log(fs); 

let testArr = [1,2,3,4,5,6];
console.log(testArr);
let small = testArr.slice(2,4);
console.log(small);
console.log(testArr);

const file = nifti.parse(fs.readFileSync('./data/ZI_anat.nii'));

const INDEX_JUMP = 280*240;

// for(let i = 0; i <240; i++) {
//     let fd = fs.openSync(`./data/datas/anat${i}.json`, 'w');
//     let dataChunk = file.data.slice(i*INDEX_JUMP, i*INDEX_JUMP + INDEX_JUMP);
//     let string2Write = '{"data":[';
//     dataChunk.map(item => string2Write += `${item},`);
//     string2Write = string2Write.slice(0,-1);
//     string2Write += ']}'

//     fs.writeSync(fd, string2Write);
//     // fs.writeSync(fd, '  "engine": "ejs"');
//     // fs.writeSync(fd, '}');
//     fs.closeSync(fd);
// }
let theSize = 240*280*240;
let string2Write = `let buffer = new ArrayBuffer(${theSize});
let data = new Uint8ClampedArray(buffer);`;

for(let i = 0; i <240; i++) {
    let fd = fs.openSync(`./data/datas/writeSomejs.js`, 'w');
    let dataChunk = file.data.slice(i*INDEX_JUMP, i*INDEX_JUMP + INDEX_JUMP);
    string2Write += `data.set([${dataChunk}],${i*INDEX_JUMP});`;
    // dataChunk.map(item => string2Write += `${item},`);
    // string2Write = string2Write.slice(0,-1);
    // string2Write += ']}'

    fs.writeSync(fd, string2Write);
    // fs.writeSync(fd, '  "engine": "ejs"');
    // fs.writeSync(fd, '}');
    fs.closeSync(fd);
}

// const fd = fs.openSync(`./data/datas/anat.json`, 'w');
// fs.writeSync(fd, '{');
// fs.writeSync(fd, '  "engine": "ejs"');
// fs.writeSync(fd, '}');
// fs.closeSync(fd);


  