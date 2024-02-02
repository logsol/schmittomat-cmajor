import * as PIXI from 'pixi.js';

function createGradTexture(quality, frm, to)
{
  // adjust it if somehow you need better quality for very very big images
  const canvas = document.createElement('canvas');

  canvas.width = 1;
  canvas.height = quality;

  const ctx = canvas.getContext('2d');

  // use canvas2d API to create gradient
  const grd = ctx.createLinearGradient(0, 0, 0, quality);

  grd.addColorStop(0, '#' + frm.toString(16));
  grd.addColorStop(1, '#' + to.toString(16));

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 1, quality);

  return PIXI.Texture.from(canvas);
}

function startup(view)
{
  
  var knobSize = 50;

  // Circles
  let bgCircle = new PIXI.Graphics();
  let bcCircleLineThickness = 2;
  bgCircle.beginFill(0x081218);
  bgCircle.drawCircle(0, 0, knobSize);
  bgCircle.endFill();

  let lightCircleRadius = knobSize-bcCircleLineThickness;
  let lightCircle = new PIXI.Graphics();
  lightCircle.beginFill(0x9F978B);
  lightCircle.drawCircle(0, 0, lightCircleRadius);
  lightCircle.endFill();

  let lightCircleSprite = new PIXI.Sprite(createGradTexture(lightCircleRadius*2, 0xc1b6aa, 0x8c8176));
  lightCircleSprite.position.x = -lightCircleRadius;
  lightCircleSprite.position.y = -lightCircleRadius;
  lightCircleSprite.width = lightCircleRadius*2;
  lightCircleSprite.height = lightCircleRadius*2;
  lightCircleSprite.mask = lightCircle;

  let innerCircleRadius = lightCircleRadius-6;
  let innerCircle = new PIXI.Graphics();
  innerCircle.beginFill(0x9F978B);
  innerCircle.drawCircle(0, 0, innerCircleRadius);
  innerCircle.endFill();

  let innerCircleSprite = new PIXI.Sprite(createGradTexture(innerCircleRadius*2, 0xa2988c, 0x8c8176));
  innerCircleSprite.position.x = -innerCircleRadius;
  innerCircleSprite.position.y = -innerCircleRadius;
  innerCircleSprite.width = innerCircleRadius*2;
  innerCircleSprite.height = innerCircleRadius*2;
  innerCircleSprite.mask = innerCircle;

  // Arcs
  let progress = 30;
  let origin = -Math.PI*1.25;
  let full = Math.PI*0.25; 
  let range = full-origin;
  let degree = origin+(range/100*progress);

  const backArc = new PIXI.Graphics();
  backArc.lineStyle(7, 0x323232, 1);
  backArc.arc(0, 0, knobSize+10, origin, full);

  const activeArc = new PIXI.Graphics();
  activeArc.lineStyle(7, 0xE3B142, 1);
  activeArc.arc(0, 0, knobSize+10, origin, degree);

  // Indicator
  let indicatorCircleRadius = 4;
  let indicatorCircleCenterDistance = knobSize-16;
  let indicatorCircle = new PIXI.Graphics();
  let x = indicatorCircleCenterDistance * Math.cos(degree);
  let y = indicatorCircleCenterDistance * Math.sin(degree);
  let indicatorCircleColor = 0x232323;
  indicatorCircle.beginFill(indicatorCircleColor);
  indicatorCircle.drawCircle(x, y, indicatorCircleRadius);
  indicatorCircle.endFill();

  // Setup drag handler
  function updateCallback(newValue) {
    progress = newValue;
    
    // Active Arc
    let origin = -Math.PI*1.25;
    let full = Math.PI*0.25; 
    let range = full-origin;
    let degree = origin+(range/100*progress);
    
    activeArc.clear();
    activeArc.lineStyle(7, 0xE3B142, 1);
    activeArc.arc(0, 0, knobSize+10, origin, degree);
    
    // Indicator
    let x = indicatorCircleCenterDistance * Math.cos(degree);
    let y = indicatorCircleCenterDistance * Math.sin(degree);
    indicatorCircle.clear();
    indicatorCircle.beginFill(indicatorCircleColor);
    indicatorCircle.drawCircle(x, y, indicatorCircleRadius);
    indicatorCircle.endFill();
  }
  
  let handle = bgCircle;
  handle.eventMode = 'static';
  handle.cursor = 'pointer';
  var lastStartY = 0;
  handle
      .on('pointerdown', function(e){
        lastStartY = e.global.y;
        onDragStart(lastStartY, progress, updateCallback)
      })
      .on('pointerup', onDragEnd)
      .on('pointerupoutside', onDragEnd);

  let knob = new PIXI.Sprite();
  knob.addChild(bgCircle);
  knob.addChild(lightCircleSprite);
  knob.addChild(lightCircle);
  knob.addChild(innerCircleSprite);
  knob.addChild(innerCircle);
  knob.addChild(backArc);
  knob.addChild(activeArc);
  knob.addChild(indicatorCircle); 

  knob.x = app.screen.width / 2;
  knob.y = app.screen.height / 2;

  //app.stage.addChild(knob);
  app.stage.addChild(knob);
  app.start();
}

// Listen to pointermove on stage once handle is pressed.
function onDragStart(lastStartY, progress, updateCallback)
{
  app.stage.eventMode = 'static';
  app.stage.addEventListener('mousemove', function(e) {
    onDrag(e, lastStartY, progress, updateCallback);
  });
}

// Stop dragging feedback once the handle is released.
function onDragEnd()
{
  app.stage.eventMode = 'auto';
  app.stage.removeEventListener('pointermove', onDrag);
}

// Update the handle's position
function onDrag(e, lastStartY, progress, updateCallback)
{
  progress += (lastStartY - e.global.y) * 0.9;
  progress = progress < 0 ? 0 : (progress > 100 ? 100 : progress);
  updateCallback(progress);
}

// Create our application instance
var app = new PIXI.Application({ 
  width: window.innerWidth/2,
  height: window.innerHeight/2,
  backgroundColor: 0x4B4B4B,
  antialias: true,
  resolution: 2,
  autoResize:true
});

let root = document.createElement("div");
root.id = "root";
root.appendChild(app.view);
document.body.appendChild(app.view);
startup();


// /*
//     This simple web component just manually creates a set of plain sliders for the
//     known parameters, and uses some listeners to connect them to the patch.
// */
// class DemoView extends HTMLElement
// {
//     constructor (patchConnection)
//     {
//         super();
//         this.patchConnection = patchConnection;
//         this.classList = "demo-patch-element";
//         this.innerHTML = this.getHTML();
//     }

//     connectedCallback()
//     {
//         this.paramListener = (event) =>
//         {
//             // Each of our sliders has the same IDs as an endpoint, so we can find
//             // the HTML element from the endpointID that has changed:
//             const slider = this.querySelector ("#" + event.endpointID);

//             if (slider)
//                 slider.value = event.value;
//         };

//         // Attach a parameter listener that will be triggered when any param is moved
//         this.patchConnection.addAllParameterListener (this.paramListener);

//         for (const param of this.querySelectorAll (".param"))
//         {
//             // When one of our sliders is moved, this will send the new value to the patch.
//             param.oninput = () => this.patchConnection.sendEventOrValue (param.id, param.value);

//             // for each slider, request an initial update, to make sure it shows the right value
//             this.patchConnection.requestParameterValue (param.id);
//         }
//     }

//     disconnectedCallback()
//     {
//         // when our element goes offscreen, we should remove any listeners
//         // from the PatchConnection (which may be shared with other clients)
//         this.patchConnection.removeAllParameterListener (this.paramListener);
//     }

//     getHTML()
//     {
//         return `
//         <style>
//             .demo-patch-element {
//                 background: #bcb;
//                 display: block;
//                 width: 100%;
//                 height: 100%;
//                 padding: 10px;
//                 overflow: auto;
//             }

//             .param {
//                 display: inline-block;
//                 margin: 10px;
//                 width: 300px;
//             }
//         </style>

//         <div id="controls">
//           <input type="range" class="param" id="roomSize" min="0" max="100">Room Size</input>
//           <input type="range" class="param" id="damping"  min="0" max="100">Damping</input>
//           <input type="range" class="param" id="width"    min="0" max="100">Width</input>
//           <input type="range" class="param" id="wetLevel" min="0" max="100">Wet Level</input>
//           <input type="range" class="param" id="dryLevel" min="0" max="100">Dry Level</input>
//         </div>`;
//     }
// }

// window.customElements.define ("demo-patch-view", DemoView);

/* This is the function that a host (the command line patch player, or a Cmajor plugin
   loader, or our VScode extension, etc) will call in order to create a view for your patch.

   Ultimately, a DOM element must be returned to the caller for it to append to its document.
   However, this function can be `async` if you need to perform asyncronous tasks, such as
   fetching remote resources for use in the view, before completing.

   When using libraries such as React, this is where the call to `ReactDOM.createRoot` would
   go, rendering into a container component before returning.
*/

export default function createPatchView (patchConnection)
{
    console.log("welcome");
    return app.view;
    //return new DemoView (patchConnection);
}