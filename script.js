/* global document, FileReader, fetch */

import 'babel-polyfill';
import nifti from 'nifti-js';
import pako from 'pako';
import MRISlice from './mri-volume-slice';
import * as idb from 'idb-keyval';

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

document.getElementById('file-input').onchange = (event) => {
  const fr = new FileReader();
  fr.onload = fileLoadEvent => setupNifti(fileLoadEvent.target.result);
  fr.readAsArrayBuffer(event.target.files[0]);
};

document.getElementById('toggle-cross-hairs').onchange = (event) => {
  if (event.target.checked) {
    mRISlice.showCrosshairs();
  } else {
    mRISlice.hideCrossHairs();
  }
};

function setupNifti(file) {
  idb.set("LastNiftiFile", file);
  mRISlice.loadNewNifti(nifti.parse(file));
  mRISlice.mouseNavigationEnabled('enable please');
  hideLoader();
}

function hideLoader() {
  const loader = document.getElementById('principal-loader');
  loader.style.display = 'none';
}


async function loadDefaultData() {
  const lastFile = await idb.get('LastNiftiFile');
  if (lastFile) return setupNifti(lastFile);
  const url = 'https://openneuro.org/crn/datasets/ds001417/files/sub-study002:ses-after:anat:sub-study002_ses-after_T1w.nii.gz';
  // load from the cache API or fetch if not found
  let response;
  if ('caches' in window) {
    response = await caches.match(url);
    if (!response) {
      response = await fetch(url);
      const cache = await caches.open(url);
      await cache.put(url, response.clone());
    }
  } else {
    // browser does not support the cache APi
    response = await fetch(url);
  }
  
  const blob = await response.arrayBuffer();
  const compressed = new Uint8Array(blob);
  const file = pako.inflate(compressed);
  hideLoader();
  setupNifti(file);
}
