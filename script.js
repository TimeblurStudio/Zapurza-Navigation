/**
 * ------------------------------------------------
 * AUTHOR:  Mike Cj (mikecj184)
 * Copyright 2022 Timeblur
 * This code is licensed under MIT license (see LICENSE file for more details)
 * ------------------------------------------------
 */
//
let paperHeight, paperWidth;
//
//
let mainMap;
let navigationFile = null;
var navHitOptions = {
	segments: false,
	stroke: false,
	fill: true,
	tolerance: 5
};
let currentNavLoc = -1;
let navTweenItem;
//
//
let lightLayer;
let backgroundLayer;
let navLayer;
//
// Meter to keep track of FPS
window.FPSMeter.theme.transparent.container.transform = 'scale(0.75)';
window.meter = new window.FPSMeter({ margin: '-8px -16px', theme: 'transparent', graph: 1, history: 16 });
//
console.log('Initializing');
init();
//
//
//
//
/**
 * ------------------------------------------------
 * Main Init
 * ------------------------------------------------
 */
function init(){
	console.log('init called');
	//
	// Setup PAPER canvas
	let canvas = document.getElementById('main-map-canvas');
	paper.setup(canvas);
	paperHeight = canvas.offsetHeight;
	paperWidth = canvas.offsetWidth;

	//
	backgroundLayer = new paper.Layer();
	lightLayer = new paper.Layer();
	navLayer = new paper.Layer();

	// INTERACTIONS
	//initPanZoom();

	//
	loadHQ();

	//
	paper.project.activeLayer = navLayer;

	// Draw PAPER
	paper.view.draw();

  //
  // Update on paper events
  paper.view.onFrame = function(event) {
    window.meter.tick();
  };

  //
  //
  //
  //
  $(window).on('resize', function(){
    // Clear context and reload 
    // https://stackoverflow.com/questions/38954134/how-to-completely-remove-pixi-renderer-stage-and-assets
    window.location.reload(true);
  });
  //
}


function loadHQ(){
	console.log('loading High Quality Image');
	//

	//
  let image = document.getElementById('HQmap');
  var downloadingImage = new Image();
  downloadingImage.onload = function(){
		//
  	console.log('Loaded HQ image');
    image.src = this.src;
    //
    //
    initMap();
    //
    loadLightMask();
    //loadNavMask();
		initNav();
		//
  	//
  	lightLayer.sendToBack();
  	backgroundLayer.sendToBack();
  };
  downloadingImage.src = './assets/map.png';
}


function initMap(){
	//
	//
	//HQscroll
	// Create a raster item using the image tag with id=''
	let raster = new paper.Raster('HQmap');
	mainMap = raster;
	mainMap.opacity = 1;
	// Scale the raster
	let s = paperHeight/mainMap.height;
	console.log('SCALE: ' + s);
	mainMap.scale(s);
	//
	// Move the raster to the center of the view
	mainMap.position = paper.view.center;
	raster.position.x = 1.05*paperWidth/2;
	//
	scrollWidth = mainMap.width*s;
	scrollHeight = paperHeight;
	//
	backgroundLayer.addChild(mainMap);
	//
}

function loadLightMask(){

	console.log('Loading light mask');
	//
	//
	let navPath = './assets/Map-blend.svg';
	paper.project.importSVG(navPath, function(item){
		console.log('Loaded light mask');
		let lightFile = item;
		//
		let s = paperHeight/mainMap.height;
		let lms = paperHeight/item.bounds.height;//mask-scale
		console.log('Light SCALE: ' + lms);
		//
		item.scale(lms);
		item.position = paper.view.center;
		item.position.x = 1.05*paperWidth/2;
		item.opacity = 1;
		//
		lightLayer.addChild(item);
		//
	});
	//
	//
}

function loadNavMask(){
	console.log('Loading navigation mask');
	//
	//
	let navPath = './assets/Map-mask.svg';
	paper.project.importSVG(navPath, function(item){
		console.log('Loaded Navigation');
		let navigationFile = item;
		//
		let s = paperHeight/mainMap.height;
		let lms = paperHeight/item.bounds.height;//mask-scale
		console.log('Navigation SCALE: ' + lms);
		//
		item.scale(lms);
		item.position = paper.view.center;
		item.position.x = 1.05*paperWidth/2;
		item.opacity = 0.03;
		//
		navLayer.addChild(item);
		//
	});
	//
	//
}

function initNav(){
	console.log('Initializing navigation');
	$('.show').click(function(el){
		if(!$(el.currentTarget).hasClass('active')){
			resetActive();
			//
			$(el.currentTarget).addClass('active');
			//
			let chap_id = $(el.currentTarget).attr('data-id');
			if(chap_id.includes('toilet')){
				for(let i=0; i < 4; i++){
					let paperItem = paper.project.getItem({name: chap_id+'-'+i});
					paperItem.fillColor = '#b7b7b7';
					paperItem.opacity = 1;
					paperItem.blendMode = 'color-dodge';
				}
			}else{
				let paperItem = paper.project.getItem({name: chap_id});
				if(paperItem != null){
					paperItem.fillColor = '#b7b7b7';
					paperItem.opacity = 1;
					paperItem.blendMode = 'color-dodge';	
				}
			}
			//
		}else
			resetActive();
		//let locX = paper.project.getItem({name: 'nav-ch'+chap_id}).bounds.left;
	});
}

function resetActive(){
	let all_buttons = $('.nav').children();
	for(let i=0; i < all_buttons.length; i++){
		let this_button = $(all_buttons[i]);
		if(this_button.hasClass('active')){
			this_button.removeClass('active');
			//
			let chap_id = this_button.attr('data-id');
			if(chap_id.includes('toilet')){
				for(let i=0; i < 4; i++){
					let paperItem = paper.project.getItem({name: chap_id+'-'+i});
					paperItem.fillColor = '#1a1a1a';
					paperItem.opacity = 0.01;	
				}
			}else{
				let paperItem = paper.project.getItem({name: chap_id});
				if(paperItem != null){
					paperItem.fillColor = '#1a1a1a';
					paperItem.opacity = 0.01;
				}
			}
			//
		}
	}
}