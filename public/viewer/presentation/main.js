/* global $ */
import presentationViewer from './presentationViewer.js';

let root = document.getElementById("presentationViewer");
const pv = new presentationViewer();
pv.init($(root), 1600, 950, true, (num) => { console.log(num); });
// pv.loadPDF("./samplepdf.pdf");