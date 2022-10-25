/**
 * ------------------------------------------------
 * AUTHOR:  Mike Cj (mikecj184)
 * Copyright 2022 Timeblur
 * This code is licensed under MIT license (see LICENSE file for more details)
 * 
 * Expore this possiblility in WebXR: 
 * https://www.youtube.com/watch?v=VOMysKbDNxk
 * https://github.com/MatthewHallberg/IndoorNavPlaceNote
 * ------------------------------------------------
 */

/*
TODO:
. Show current and other information on the popup
. Second click on location opens popup
. popup should show an image banner
. Dashboard for changing images 															
. pan and zoom


23rd Oct 2022:
. Studio area not shown																						DONE
. Gallery 7 hig	hlight problem 																	  DONE
. Show corresponding color in the bottom 													DONE						
. Marathi and English text 																				DONE


20th Oct 2022
. Fix wrong canteen location displayed 														DONE
. Center map location & Fix Header																DONE
. Add Foyer and Plaza																							DONE


4th Oct 2022
. Click on lightNav to highlight 													       	DONE
. Make locations easy to change names for mobile 									DONE
. Toilet add - texture 																						DONE
. Wrong toilet location displayed 																DONE
. Show visitor  																									DONE
. Speed problem 																									DONE
*/

//
let paperHeight, paperWidth;
//
//
let mainMap;
let navigationFile = null;
let currentNavLoc = -1;
let navTweenItem;
let allMobileLocations = ['visitorcenter', 'foyer', 'hall1', 'hall2', 'hall3', 'hall4', 'hall5', 'plaza', 'hall6', 'hall7', 'hall8', 'hall9', 'hall10', 'studio', 'canteen', 'toilet', 'audi', 'audifoyer', 'openair'];
let allMobileNames = ['Visitor center', 'Entrance foyer', 'Virtual museum', 'Gallery 2', 'Gallery 3', 'Gallery 4', 'Gallery 5', 'Plaza', 'Gallery 6', 'Gallery 7', 'Gallery 8', 'Gallery 9', 'Gallery 10', 'Studio', 'Canteen', 'Toilets', 'Auditorium', 'Auditorium foyer', 'Open air theater'];
let allMobileNamesMarathi = ['आगमन केंद्र', 'प्रवेशद्वार','वर्चुअल संग्रहालय', 'गैलरी 2', 'गैलरी 3', 'गैलरी 4', 'गैलरी 5', 'चौक','गैलरी 6', 'गैलरी 7', 'गैलरी 8', 'गैलरी 9', 'गैलरी 10', 'स्टूडियो', 'खाने का क्षेत्र', 'शौचालय', 'ऑडिटोरियम', 'ऑडिटोरियम फ्यूअर', 'खुला वातावरणीय थिएटर'];
let allMobileColors = ['#c98169', '#f7f7f7', '#c98169', '#c98169', '#c98169', '#c98169', '#c98169', '#f7f7f7', '#c98169', '#c98169', '#c98169', '#c98169', '#c98169', '#c98169', '#f7f7f7', '#c98169', '#c98169', '#f7f7f7', '#f7f7f7']; 
let currentMobileLocation = 'foyer';
let isMarathi = true;

var maskHitOptions = {
	segments: false,
	stroke: false,
	fill: true,
	tolerance: 5
};
//
//
let lightLayer;
let backgroundLayer;
let navLayer;
//
let debug = false;
//
if(debug){
	// Meter to keep track of FPS
	window.FPSMeter.theme.transparent.container.transform = 'scale(0.75)';
	window.meter = new window.FPSMeter({ margin: '-8px -16px', theme: 'transparent', graph: 1, history: 16 });	
	//
	document.getElementById("version").style.display = 'block';
}
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
	$.LoadingOverlay("show", {
		background : "rgba(0, 0, 0, 0.4)",
		imageColor : "#d2d2d2",
		imageResizeFactor : 0.5
	});
	// Add mobile location selectors
	for(let i=0; i < allMobileLocations.length; i ++){
		let html_option = '<option value="'+allMobileLocations[i]+'">'+allMobileNames[i]+'</option>';
		$('#locations').append(html_option);
	}
	// Language selection
	if(localStorage.getItem('isMarathi') == 'false')
		isMarathi = false;
	else
		isMarathi = true;
	if(isMarathi){
		$($("ul.buttonGroup").find("li")[1]).addClass("selected");
		$($("ul.buttonGroup").find("li")[0]).removeClass("selected");
	}else{
		$($("ul.buttonGroup").find("li")[0]).addClass("selected");
		$($("ul.buttonGroup").find("li")[1]).removeClass("selected");
	}
	// Language selection on change
	$("ul.buttonGroup").click(function (event) {
		$("li", this)
		.removeClass("selected")
		.filter(event.target)
		.addClass("selected");
		//
		// Get selected language from ul
		let selectedLang = $(this).find('li.selected').attr('id');
		if(selectedLang == 'marathi'){
			isMarathi = true;
			localStorage.setItem('isMarathi', 'true');
		}else{
			isMarathi = false;
			localStorage.setItem('isMarathi', 'false');
		}
		updateUItoLanguage();
	});
	updateUItoLanguage();
	
	// Setup PAPER canvas
	let canvas = document.getElementById('main-map-canvas');
	paper.setup(canvas);
	paperHeight = canvas.offsetHeight;
	paperWidth = canvas.offsetWidth;

	//
	backgroundLayer = new paper.Layer();
	lightLayer = new paper.Layer();
	navLayer = new paper.Layer();

	if(window.innerWidth < 512){
		backgroundLayer.scale(0.9);
		navLayer.scale(0.9);
		lightLayer.scale(0.9);
		backgroundLayer.position.y *= 1.1;
		navLayer.position.y *= 1.1;
		lightLayer.position.y *= 1.1;
	}
	

	// INTERACTIONS
	//initPanZoom();

	//
	loadHQ();

	//
	paper.project.activeLayer = navLayer;

	// Interactions
	paper.view.onMouseDown = function(event) {
		mousePos = event.point;
		//
		var hitResult = navLayer.hitTest(event.point, maskHitOptions);
		if(hitResult != null){
			locname = hitResult.item.name;
			if(locname.includes('toilet'))	locname = 'toilet';
			if(allMobileLocations.includes(locname)){
				console.log('Showing: ' + locname);
				removeHighlight(currentMobileLocation);
				currentMobileLocation = locname;
				highlightLocation(currentMobileLocation);
				$('#locations').val(currentMobileLocation);
				$('.mobilelocations').css('color', allMobileColors[allMobileLocations.indexOf(currentMobileLocation)]);
			}else
				console.log('Invalid location: ' + locname)
		}
	};
	//

	// Draw PAPER
	paper.view.draw();

	if(debug){
		//
	  // Update on paper events
	  paper.view.onFrame = function(event) {
	    window.meter.tick();
	  };	
	}
  
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

function updateUItoLanguage(){
	if(isMarathi){
		$($('#language').children()[0]).html('वर क्लिक करा');
		let length = $('#locations').children().length;
		for(let i=1; i < length; i++)
			$($('#locations').children()[i]).html(allMobileNamesMarathi[i-1]);
		$('#previous').html('< मागील');
		$('#next').html('पुढे >');
	}else{
		$($('#language').children()[0]).html('Click to navigate');
		let length = $('#locations').children().length;
		for(let i=1; i < length; i++)
			$($('#locations').children()[i]).html(allMobileNames[i-1]);
		$('#previous').html('< prev');
		$('#next').html('next >');
	}
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
    loadNavMask();
		initNav();
		initMobileMenu();
		//
  	//
  	lightLayer.sendToBack();
  	backgroundLayer.sendToBack();
  	//
		$.LoadingOverlay("hide");
		// Loaded - highlight current location
		setTimeout(function(){
			highlightLocation(currentMobileLocation);
			$('#locations').val(currentMobileLocation);
			$('.mobilelocations').css('color', allMobileColors[allMobileLocations.indexOf(currentMobileLocation)]);
			$('#locations').show();
		}, 1000);
  };
  downloadingImage.src = './assets/map-og-0.5.4.png';
}


function initMobileMenu(){
  for(let i=0; i < allMobileLocations.length; i++)
  	$('#loading').append('<option value="'+allMobileLocations[i]+'">'+allMobileNames[i]+'</option>')
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
	let navPath = './assets/Map-blend-0.5.4.svg';
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
	let navPath = './assets/Map-blend-0.5.4.svg';
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
		console.log(el.currentTarget);
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
	$('#locations').on('change', function(){
		removeHighlight(currentMobileLocation);
		currentMobileLocation = this.value;
		highlightLocation(this.value);
		$('.mobilelocations').css('color', allMobileColors[allMobileLocations.indexOf(currentMobileLocation)]);
	});
	$('#previous').on('click', function(){
		let index = allMobileLocations.indexOf(currentMobileLocation);	
		index--;
		if(index >  allMobileLocations.length)	index = 0;
		if(index <  0)	index = allMobileLocations.length-1;
		//
		removeHighlight(currentMobileLocation);
		currentMobileLocation = allMobileLocations[index];
		$('#locations').val(currentMobileLocation);
		$('.mobilelocations').css('color', allMobileColors[allMobileLocations.indexOf(currentMobileLocation)]);
		highlightLocation(currentMobileLocation);
	});
	$('#next').on('click', function(){
		let index = allMobileLocations.indexOf(currentMobileLocation);
		index++;
		if(index >  allMobileLocations.length-1)	index = 0;
		if(index <  0)	index = allMobileLocations.length-1;
		removeHighlight(currentMobileLocation);
		currentMobileLocation = allMobileLocations[index];
		$('#locations').val(currentMobileLocation);
		$('.mobilelocations').css('color', allMobileColors[allMobileLocations.indexOf(currentMobileLocation)]);
		highlightLocation(currentMobileLocation);
	});
}

function highlightLocation(loc){
	let chap_id = loc;
	if(chap_id.includes('toilet')){
		chap_id = 'toilet';
		for(let i=0; i < 4; i++){
			let paperItem = paper.project.getItem({name: chap_id+'-'+i});
			paperItem.fillColor = '#b7b7b7';
			paperItem.opacity = 1;
			paperItem.blendMode = 'color-dodge';
		}
	}else{
		console.log('Highlight: ' + chap_id);
		let paperItem = paper.project.getItem({name: chap_id});
		if(paperItem != null){
			paperItem.fillColor = '#b7b7b7';
			paperItem.opacity = 1;
			paperItem.blendMode = 'color-dodge';	
		}
	}
}

function removeHighlight(loc){
	let chap_id = loc;
	if(chap_id.includes('toilet')){
		for(let i=0; i < 4; i++){
			let paperItem = paper.project.getItem({name: chap_id+'-'+i});
			paperItem.fillColor = '#000';
			paperItem.opacity = 0.01;	
			paperItem.blendMode = 'normal';	
		}
	}else{
		console.log('Remove: ' + chap_id);
		let paperItem = paper.project.getItem({name: chap_id});
		if(paperItem != null){
			paperItem.fillColor = '#000';
			paperItem.opacity = 0.01;
			paperItem.blendMode = 'normal';	
		}
	}
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
					paperItem.fillColor = '#000';
					paperItem.opacity = 0.01;	
				}
			}else{
				let paperItem = paper.project.getItem({name: chap_id});
				if(paperItem != null){
					paperItem.fillColor = '#000';
					paperItem.opacity = 0.01;
				}
			}
			//
		}
	}
}