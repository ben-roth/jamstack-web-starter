const fabric = require("fabric").fabric;
fabric.Object.prototype.objectCaching = false;
const FontFaceObserver = require('fontfaceobserver');
import Pickr from '@simonwep/pickr';


//=============
//FABRIC CODE
//=============
var text = null;
var canvas = new fabric.Canvas('c');
canvas.preserveObjectStacking = true;
canvas.backgroundColor = "#fff"



canvas.on("selection:created", function(obj){
	if(obj.target.type == 'textbox' || obj.target.type == 'text' || obj.target.type == 'itext'){
    text = obj.target
  }
});

// Define an array with all fonts
var fonts = ["Oswald", "Pacifico", "VT323", "Quicksand", "Inconsolata","Indie Flower","Permanent Marker"];

var text = new fabric.Textbox('double click to edit, select and press delete to remove', {
  left: 50,
  top: 50,
  width: 250,
  height: 100,
  fontSize: 22,
  fontFamily: "sans-serif",
  textAlign: 'center'
});
canvas.centerObject(text);


//prevent scale of text
let lastHeight;
const updateTextSize = () => {
  const controlPoint = text.__corner;
  //mr and ml are the only controlPoints that dont modify textbox height
  if (controlPoint && controlPoint != "mr" && controlPoint != "ml") {
    lastHeight = text.height * text.scaleY;
  }
  text.set({
    height: lastHeight || text.height,
    scaleY: 1
  });
  canvas.renderAll();
};
text.on('scaling', updateTextSize);
text.on('editing:entered', updateTextSize);
canvas.add(text);


//font controls

const fontSize = document.getElementById('fontSize');
fontSize.addEventListener('change', (e) => {
  text.fontSize = e.target.value;
  canvas.renderAll();
});
const lineHeight = document.getElementById('lineHeight');
lineHeight.addEventListener('change', (e) => {
  text.lineHeight = e.target.value;
  canvas.renderAll();
});
const letterSpacing = document.getElementById('letterSpacing');
letterSpacing.addEventListener('change', (e) => {
  text.charSpacing = e.target.value;
  canvas.renderAll();
});
fonts.unshift('Sans-Serif');
// Populate the fontFamily select
var select = document.getElementById("font-family");
fonts.forEach(function (font) {
  var option = document.createElement('option');
  option.innerHTML = font;
  option.value = font;
  select.appendChild(option);
});

// Apply selected font on change
document.getElementById('font-family').onchange = function () {
  if (this.value !== 'Sans-Serif') {
    loadAndUse(this.value);
  } else {
    canvas.getActiveObject().set("fontFamily", this.value);
    canvas.requestRenderAll();
  }
};
function loadAndUse(font) {
  var myfont = new FontFaceObserver(font)
  myfont.load()
    .then(function () {
      // when font is loaded, use it.
      canvas.getActiveObject().set("fontFamily", font);
      canvas.requestRenderAll();
    }).catch(function (e) {
      alert('font loading failed ' + font);
    });
}


//Image Upload

const dropArea = document.getElementById("drop-area");

const preventDefaults = e => {
  e.preventDefault();
  e.stopPropagation();
};

const highlight = e => {
  dropArea.classList.add("highlight");
};

const unhighlight = e => {
  dropArea.classList.remove("highlight");
};

const handleDrop = e => {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
};

const handleFiles = files => {
  const filesArray = [...files];
  filesArray.forEach(uploadFile);
};

const uploadFile = (file) => {
  addImageToCanvas(file)
};

["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});
["dragenter", "dragover"].forEach(eventName => {
  dropArea.addEventListener(eventName, highlight, false);
});
["dragleave", "drop"].forEach(eventName => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

dropArea.addEventListener("drop", handleDrop, false);



document.getElementById('imageUpload').onchange = function handleImage(e) {
  //upon upload of new image loop through and remove any current image or svg
  removeImage();
  let fileNameSplit = e.target.files[0].name.split('.')
  let fileType = fileNameSplit[fileNameSplit.length - 1]
  if(fileType == 'svg'){
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function (f) {
      var data = f.target.result;                    
      fabric.loadSVGFromURL(data, function (objects, options) {
        var bannerImg = fabric.util.groupSVGElements(objects, options);
        let bounds = bannerImg.getBoundingRect();
        let scalledDown = calculateAspectRatioFit(bounds.width, bounds.height, canvas.width, canvas.height)
        bounds.height = scalledDown.height - 50
        bounds.width = scalledDown.width - 50
        bannerImg.scaleToHeight(scalledDown.height - 10)
        bannerImg.scaleToWidth(scalledDown.width - 10)
        canvas.add(bannerImg);
        canvas.centerObject(bannerImg);
        canvas.sendToBack(bannerImg);
        canvas.bringToFront(text);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  }else{
    addImageToCanvas(e.target.files[0]);
  }
  

}

function removeImage(){
  canvas.getObjects().forEach(o => {
    if (o.type == 'path' || o.type == 'image' || o.type == 'polygon' || o.type == 'group') {
      canvas.remove(o)
    }
  })
}



function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
  var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return { width: srcWidth*ratio, height: srcHeight*ratio };
}


const addImageToCanvas = (file) => {
    console.dir(file);

    let fileNameSplit = file.name.split('.')
    let fileType = fileNameSplit[fileNameSplit.length -1];

    if(fileType == 'svg'){
      var reader = new FileReader();
      reader.onload = function (f) {
        var data = f.target.result;                    
        fabric.loadSVGFromURL(data, function (objects, options) {
          removeImage();
          var bannerImg = fabric.util.groupSVGElements(objects, options);
          let bounds = bannerImg.getBoundingRect();
          let scalledDown = calculateAspectRatioFit(bounds.width, bounds.height, canvas.width, canvas.height)
          bounds.height = scalledDown.height - 50
          bounds.width = scalledDown.width - 50
          bannerImg.scaleToHeight(scalledDown.height - 10)
          bannerImg.scaleToWidth(scalledDown.width - 10)
          canvas.add(bannerImg);
          canvas.centerObject(bannerImg);
          canvas.sendToBack(bannerImg);
          canvas.bringToFront(text);
          canvas.renderAll();
        });
      };
      reader.readAsDataURL(file);
    }else{
      var reader = new FileReader();
      reader.onload = function (event) {
        var imgObj = new Image();
        imgObj.src = event.target.result;
        imgObj.onload = function () {
          var image = new fabric.Image(imgObj);
          image.set({
            angle: 0,
            padding: 10,
            cornersize: 10,
          });

          image.scaleToHeight(canvas.height - 30);
          image.scaleToWidth(canvas.width - 30);
          canvas.centerObject(image);
          canvas.add(image);
          canvas.sendToBack(image);
          canvas.bringToFront(text);
          canvas.renderAll();
        }
      }
      reader.readAsDataURL(file);
  }
}

window.onkeydown = function(e) {
  if(e.target.tagName && e.target.tagName == 'INPUT'){
    //input focus, don't delete canvas node
  }else{
    var key = e.keyCode || e.charCode;
    let canvasActiveObject = canvas.getActiveObject();
    if((key === 8 || key === 46) && canvasActiveObject){
      console.dir(canvasActiveObject);
      canvas.remove(canvasActiveObject);
    }

  }
 
};




// function showFontTools() {
//   fontTools.classList.remove('hidden')
// }
// function showSVGTools() {
//   svgTools.classList.remove('hidden');
// }
// function hideFontTools() {
//   fontTools.classList.add('hidden')
// }
// function hideSVGTools() {
//   svgTools.classList.add('hidden')
// }

//handle tools depending on what is selected on the canvas
// function onObjectSelected(e) {
//   let selectionType = e.target.get('type')
//   if (selectionType === 'textbox') {
//     //show text tools fonts, colors, etc
//     text = e.target;
//     showFontTools()
//     hideSVGTools()
//   } else {
//     if (e.target.fromSVG) {
//       //load svg tools
//       showSVGTools()
//     } else {
//       hideSVGTools()
//     }
//     hideFontTools()
//   }
// }
// canvas.on('selection:created', onObjectSelected);
// canvas.on('selection:updated', onObjectSelected);
// canvas.on('selection:cleared', function () {
//   hideFontTools(); hideSVGTools();
// });


// document.getElementById('save-jpg').addEventListener('click',function(){saveImage('jpeg')})
document.getElementById('save-png').addEventListener('click', function () { openModal(sizeModal) })
// document.getElementById('save-svg').addEventListener('click',function(){saveImage('svg')})



document.getElementById('build-button').addEventListener('click',function(){saveImage('png')})

function saveImage(type) {

  var newCanvas = document.createElement("canvas");
  newCanvas.id = "save-canvas";
  var saveCanvas = new fabric.Canvas(newCanvas, {width: document.getElementById('canvas-width').value, height:document.getElementById('canvas-height').value});
  saveCanvas.preserveObjectStacking = true;
  saveCanvas.backgroundColor = "transparent";


  saveCanvas.loadFromJSON(JSON.stringify(canvas), function(){saveCanvas.renderAll()});

  var i = saveCanvas.getObjects().length;
  while (i--) {
    var objType = saveCanvas.item(i).get('type');
    saveCanvas.backgroundColor = "transparent";
    if (objType === "image" || objType === "text" || objType === "path" || objType === "itext" || objType == "textbox" || objType === "rect") { // to ensure 'group' type is excluded..
      var clone = fabric.util.object.clone(saveCanvas.item(i));
      if(objType === "itext" || objType === "textbox" || objType === "text"){
        saveCanvas.bringToFront(clone)
      }else if(objType === "image" || objType === "path" || objType === "rect"){
        saveCanvas.sendToBack(clone)
      }
      saveCanvas.item(i).opacity = 0
    }
  }

  var objs = saveCanvas.getObjects().map(function(o) {
    return o.set('active', true);
  });
  var group = new fabric.Group(objs, {
    originX: 'center', 
    originY: 'center'
  });
  group.scaleToHeight(saveCanvas.height)
  group.scaleToWidth(saveCanvas.width)

  saveCanvas.renderAll();
  var br = group.getBoundingRect();

  //change canvas to transparent bg
  saveCanvas.backgroundColor = "transparent"
  var imgData = saveCanvas.toDataURL({ 
    format: 'png',
    left: br.left,
    top: br.top,
    width: br.width,
    height: br.height 
  });


    var i = saveCanvas.getObjects().length;
    while (i--) {
      var curObj = saveCanvas.item(i);
      var objType = curObj.get('type');
      if(curObj.opacity>0){
        saveCanvas.remove(curObj)
      }else{
        saveCanvas.item(i).opacity = 1;
      }
    }

    var link = document.createElement("a");
    var blob = dataURLtoBlob(imgData);
    var objurl = URL.createObjectURL(blob);
    link.download = "badge-" + type + "." + type + "";
    link.href = objurl;
    link.click();
    canvas.backgroundColor = "#fff"
    canvas.renderAll();
    saveCanvas.renderAll(); 
    modalClose(sizeModal)
  }




function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

const sizeModal = document.getElementById('size-modal')
const imagesModal = document.getElementById('images-modal');

const fontColorPlaceholder = document.getElementById('color-hex');

const modalClose = (modal) => {
  modal.classList.remove('fadeIn');
  modal.classList.add('fadeOut');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 650);
}

const openModal = (modal) => {
  modal.classList.remove('fadeOut');
  modal.classList.add('fadeIn');
  modal.style.display = 'flex';
}


document.getElementById('badgeModal').addEventListener('click',(e)=>{
  openModal(imagesModal);
})

imagesModal.addEventListener('click', (e) =>{
  console.dir(e.target);
  if(e.target.tagName === 'IMG'){
   var selectedImageSrc = e.target.src
    fabric.loadSVGFromURL(selectedImageSrc, function (objects, options) {
      removeImage();
      var bannerImg = fabric.util.groupSVGElements(objects, options);
      canvas.add(bannerImg);
      canvas.centerObject(bannerImg);
      bannerImg.fill = "#333333";
      canvas.calcOffset();
      canvas.sendToBack(bannerImg);
      canvas.bringToFront(text);
      canvas.renderAll();
      modalClose(imagesModal)
    });
  }else if(e.target.classList.contains('modal-close')){
    modalClose(imagesModal)
  }
})

//Size modal for saving image

const saveCanvasWidth = document.getElementById('canvas-width');
const saveCanvasHeight = document.getElementById('canvas-height');
let widthSet = false; 
let heightSet = false;
let widthHeightSet = false;


sizeModal.addEventListener('click',(e)=>{
  if(e.target.classList.contains('modal-close')){
    modalClose(sizeModal);
  }
})

sizeModal.addEventListener('keyup',(e) => {
  if(e.target.id == 'canvas-width'){
   if(saveCanvasWidth.value){
    widthSet = true
   }else{
     widthSet = false
   }
  }else if(e.target.id == 'canvas-height'){
    if(saveCanvasHeight.value){
      heightSet = true
     }else{
      heightSet = false
     }
  }
  if(widthSet && heightSet){
    widthHeightSet = true
  }else{
    widthHeightSet = false
  }
  if(widthHeightSet){
    document.getElementById('build-button').classList.remove('hidden')
  }else{
    document.getElementById('build-button').classList.add('hidden')
  }
});



//TEXT COLOR PICKER PICKR

const pickr = Pickr.create({
  el: '.color-picker',
  theme: 'nano', // or 'monolith', or 'nano'
  default: '#333333',

  swatches: [
    'rgba(244, 67, 54, 1)',
    'rgba(233, 30, 99, 1)',
    'rgba(156, 39, 176, 1)',
    'rgba(103, 58, 183, 1)',
    'rgba(63, 81, 181, 1)',
    'rgba(33, 150, 243, 1)',
    'rgba(3, 169, 244, 1)',
    'rgba(0, 188, 212, 1)',
    'rgba(0, 150, 136, 1)',
    'rgba(76, 175, 80, 1)',
    'rgba(139, 195, 74, 1)',
    'rgba(205, 220, 57, 1)',
    'rgba(255, 235, 59, 1)',
    'rgba(255, 193, 7, 1)'
  ],

  components: {

    // Main components
    preview: true,
    opacity: false,
    hue: true,

    // Input / output Options
    interaction: {
      hex: false,
      rgba: false,
      hsla: false,
      hsva: false,
      cmyk: false,
      input: true,
      clear: true,
      save: true
    }
  }
});

pickr.on('init', function (instance) {
  let button = instance.getRoot().button;
  button.style.backgroundColor = instance._color.toHEXA().toString();
});

fontColorPlaceholder.addEventListener('click', () => {
  pickr.show();
})

pickr.on('save', (color, instance) => {
  pickr.hide();
  let newColor = color.toHEXA().toString();
  let newRGB = color.toRGBA().slice(0, 3)
  let red = newRGB[0];
  let green = newRGB[1];
  let blue = newRGB[2];
  if ((red * 0.299 + green * 0.587 + blue * 0.114) > 186) {
    //light text use dark bg
    fontColorPlaceholder.style.backgroundColor = "#222222"
  } else {
    //dark text use light bg
    fontColorPlaceholder.style.backgroundColor = "#ffffff"
  }
  fontColorPlaceholder.querySelector('div').innerText = newColor
  fontColorPlaceholder.style.color = newColor
  let cso = canvas.getActiveObject();
  let textSelected = false;
  if(cso){
    if(cso.type == 'itext' || cso.type == 'textbox' || cso.type == 'text' ){
      textSelected = true;
    }
  }
  if (cso && textSelected ){
    cso.fill = newColor
  }else{
    var i = canvas.getObjects().length;
    while (i--) {
      var objType = canvas.item(i).get('type');
      if(objType == 'itext' || objType == 'textbox' || objType == 'text'){
        canvas.item(i).fill = newColor
      }
    }
  }
  canvas.renderAll();
})


// SVG Color Picker
const svgColorPlaceholder = document.getElementById('svg-color-hex');

const svgPickr = Pickr.create({
  el: '.svg-color-picker',
  theme: 'nano', // or 'monolith', or 'nano'
  default: '#333333',

  swatches: [
    'rgba(244, 67, 54, 1)',
    'rgba(233, 30, 99, 1)',
    'rgba(156, 39, 176, 1)',
    'rgba(103, 58, 183, 1)',
    'rgba(63, 81, 181, 1)',
    'rgba(33, 150, 243, 1)',
    'rgba(3, 169, 244, 1)',
    'rgba(0, 188, 212, 1)',
    'rgba(0, 150, 136, 1)',
    'rgba(76, 175, 80, 1)',
    'rgba(139, 195, 74, 1)',
    'rgba(205, 220, 57, 1)',
    'rgba(255, 235, 59, 1)',
    'rgba(255, 193, 7, 1)'
  ],

  components: {

    // Main components
    preview: true,
    opacity: false,
    hue: true,

    // Input / output Options
    interaction: {
      hex: false,
      rgba: false,
      hsla: false,
      hsva: false,
      cmyk: false,
      input: true,
      clear: true,
      save: true
    }
  }
});

svgPickr.on('init', function (instance) {
  let button = instance.getRoot().button;
  button.style.backgroundColor = instance._color.toHEXA().toString();
});

svgColorPlaceholder.addEventListener('click', () => {
  svgPickr.show();
})

svgPickr.on('save', (color, instance) => {
  svgPickr.hide();
  let newColor = color.toHEXA().toString();
  let newRGB = color.toRGBA().slice(0, 3)
  let red = newRGB[0];
  let green = newRGB[1];
  let blue = newRGB[2];
  if ((red * 0.299 + green * 0.587 + blue * 0.114) > 186) {
    //light text use dark bg
    svgColorPlaceholder.style.backgroundColor = "#222222"
  } else {
    //dark text use light bg
    svgColorPlaceholder.style.backgroundColor = "#ffffff"
  }
  svgColorPlaceholder.querySelector('div').innerText = newColor
  svgColorPlaceholder.style.color = newColor
  

  let cso = canvas.getActiveObject();
  let pathSelected = false;
  let groupSelected = false;
  let groupElements = [];
  if(cso){
    if(cso.type == 'path' || cso.type == 'polygon'){
      pathSelected = true;
    }else if(cso.type == 'group'){
      groupElements = cso._objects
      groupSelected = true;
    }
  }
  if (cso && pathSelected ){
    cso.fill = newColor
  }else if(cso && groupSelected){
    for(var i of groupElements){
      i.fill = newColor
    }
  }else{
    var i = canvas.getObjects().length;
    while (i--) {
      var objType = canvas.item(i).get('type');
      if(objType == 'path' || objType == 'polygon'){
        canvas.item(i).fill = newColor
      }else if(objType == 'group'){
        for(var i of canvas.item(i)._objects){
          i.fill = newColor
        }
      }
    }
  }
  canvas.renderAll();


})


//add additional text

const addText = document.getElementById('moreText');
addText.addEventListener('click',function(e){
  if(e.target.tagName == 'BUTTON'){
    let textInputCount = addText.childElementCount
    //addText.innerHTML += '<input data-text="fabricText'+textInputCount+'" type="text" class="mb-1 w-full px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-sm border border-blueGray-300 outline-none focus:outline-none focus:ring w-full" placeholder="type to add" />'
    let text = new fabric.Textbox('double click to edit', {
      id: 'fabricText'+textInputCount,
      left: 50,
      top: 50,
      width: 250,
      fontSize: 22,
      fontFamily: "sans-serif",
      textAlign: 'center',
      fill: '#444'
    });
    canvas.centerObject(text);
    canvas.add(text);
  }

  // //input change triggers text to render
  // addText.onkeyup = function(e) {
  //   let matchTextInput = e.target.dataset.text
  //   if(e.target.tagName && e.target.tagName == 'INPUT'){
  //     let objs = canvas.getObjects();
  //     objs.forEach(i => {
  //       if(i.id == matchTextInput){
  //         i.text = e.target.value
  //         console.dir(i)
  //         canvas.renderAll();
  //       }
  //     });
  //   }
  // }



});





