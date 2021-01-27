/* global document, FileReader, fetch, window, caches */

import 'babel-polyfill';
import nifti from 'nifti-js';
import pako from 'pako';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import MRISlice from './mri-volume-slice';

const mRISlice = new MRISlice();

const LAST_NIFTI_KEY = 'Last-nifti-file';
const xDiv = document.getElementById('z-view-wrapper');
const yDiv = document.getElementById('y-view-wrapper');
const zDiv = document.getElementById('x-view-wrapper');
const defaultUrl = 'https://openneuro.org/crn/datasets/ds001417/files/sub-study002:ses-after:anat:sub-study002_ses-after_T1w.nii.gz';

const isIncognito = !(window.RequestFileSystem || window.webkitRequestFileSystem);

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

document.getElementById('load-new-mri').onclick = () => {
  showLoader();
  loadRandomImage();
};

function setupNifti(file) {
  idbSet(LAST_NIFTI_KEY, file);
  mRISlice.loadNewNifti(nifti.parse(file));
  mRISlice.mouseNavigationEnabled('enable please');
  hideLoader();
}

function hideLoader() {
  const loader = document.getElementById('principal-loader');
  loader.style.display = 'none';
}
function showError() {
  hideLoader();
  const loader = document.getElementById('error');
  loader.style.display = 'block';
}

function showLoader() {
  const loader = document.getElementById('principal-loader');
  loader.style.display = 'flex';
}

async function loadDefaultData() {
  let lastFile;
  try {
    lastFile = await idbGet(LAST_NIFTI_KEY);
  } catch (e) {
    console.error(e);
  }
  if (lastFile) return setupNifti(lastFile);

  loadRandomImage();
}

async function loadRandomImage() {
  const { id = '' } = await getDatasetId();
  const url = id ? await getNiftiFileUrl(id) : defaultUrl;

  // load from the cache API or fetch if not found
  let response;
  if ('caches' in window && !isIncognito) {
    try {
      response = await caches.match(url);
      if (!response) {
        response = await fetch(url);
        const cache = await caches.open(url);
        await cache.put(url, response.clone());
      }
    } catch (e) {
      console.error(e);
    }
  } else {
    // browser does not support the cache APi
    response = await fetch(url);
  }
  if (!response) showError();

  const blob = await response.arrayBuffer();
  const compressed = new Uint8Array(blob);
  const file = pako.inflate(compressed);
  hideLoader();
  setupNifti(file);
}

function getDatasetId() {
  return fetch('https://openneuro.org/crn/graphql?query={datasets{id}}')
    .then(response => response.json())
    .then((resp) => {
      const { data: { datasets = [] } = {} } = resp;
      const numIds = datasets.length;

      if (numIds === 0) {
        return '';
      }

      const randomIndex = Math.floor(Math.random() * numIds);
      return datasets[randomIndex];
    }).catch(() => '');
}

function getNiftiFileUrl(id) {
  const fileQuery = `{"query":"{dataset(id: \\"${id}\\") {id draft {id partial files {urls filename}}}}"}`;
  const fetchParams = {
    method: 'POST',
    body: fileQuery,
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
  };

  return fetch('https://openneuro.org/crn/graphql', fetchParams)
    .then(response => response.json())
    .then((data) => {
      const { data: { dataset: { draft: { files = [] } = {} } = {} } = {} } = data;

      let finalUrl = '';
      const fileNameRegEx = new RegExp('T1w.+.?nii.gz$')

      for (let i = 0; i < files.length; i++) {
        const { urls = [] } = files[i];
        /* some of the urls in results set comes back with datalad domain which error out sometimes,
         so use only urls from openneuro */
        finalUrl = urls.find(item => item.startsWith('https://openneuro.org') && fileNameRegEx.test(item));

        if (finalUrl) {
          break;
        }
      }

      return finalUrl || defaultUrl;
    }).catch(() => defaultUrl);
}
