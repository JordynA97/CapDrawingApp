"use strict";
//set variables
let ctx,dragging=false,lineWidth,strokeStyle;
let allPoints = [];
let allStrokes = [];
let allColors = [];
let currentLayer = [];
let undoPoints = [];
let undoStrokes = [];
let undoColors = [];
let sizeSlider = document.querySelector("#sizeSlider");
var dlLink;
var imgURL;
let currentStencil;

/* v UNDO and REDO v */

	let undoBtn = document.querySelector

/* ^ UNDO and REDO ^ */

/* v COLOR BUTTONS v */

let redColor = document.querySelector("#redColor");
let pinkColor = document.querySelector("#pinkColor");
let orangeColor = document.querySelector("#orangeColor");
let yellowColor = document.querySelector("#yellowColor");
let greenColor = document.querySelector("#greenColor");
let mintColor = document.querySelector("#mintColor");
let blueColor = document.querySelector("#blueColor");
let purpleColor = document.querySelector("#purpleColor");
let whiteColor = document.querySelector("#whiteColor");
let blackColor = document.querySelector("#blackColor");

/* ^ COLOR BUTTONS ^ */

/* v STENCIL BUTTONS v */
let iguanaBtn = document.querySelector("#iguanaStencil");
let frogBtn = document.querySelector("#frogStencil");
let jaguarBtn = document.querySelector("#jaguarStencil");
let monkeyBtn = document.querySelector("#monkeyStencil");
let slothBtn = document.querySelector("#slothStencil");
let toucanBtn = document.querySelector("#toucanStencil");
/* ^ STENCIL BUTTONS ^ */

//firebase variables
const DRAWINGPATH = "saveDrawings";
let allDrawings = {};

initFirebase();
init();

// FUNCTIONS
function init(){

	const resizeCanvas = () => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	window.onresize = resizeCanvas;
	window.onload = resizeCanvas;

	ctx = canvas.getContext('2d');
	lineWidth = 3;
	strokeStyle = "red";
	
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = strokeStyle;
	ctx.lineCap = "round"; 
	ctx.lineJoin = "round";
	
	// Hook up event handlers
	canvas.onmousedown = doMousedown;
	canvas.onmousemove = doMousemove;
	canvas.onmouseup = doMouseup;
	canvas.onmouseout = doMouseout;
	sizeSlider.onchange = changePenSize;
	
	window.onhashchange = onLocationHashChanged;

	redColor.onclick = changeColor;
	pinkColor.onclick = changeColor;
	orangeColor.onclick = changeColor;
	yellowColor.onclick = changeColor;
	greenColor.onclick = changeColor;
	mintColor.onclick = changeColor;
	blueColor.onclick = changeColor;
	purpleColor.onclick = changeColor;
	whiteColor.onclick = changeColor;
	blackColor.onclick = changeColor;

	iguanaBtn.onclick = stencilSelect;
	frogBtn.onclick = stencilSelect;
	jaguarBtn.onclick = stencilSelect;
	monkeyBtn.onclick = stencilSelect;
	slothBtn.onclick = stencilSelect;
	toucanBtn.onclick = stencilSelect;
}

function loadDrawing(points){
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	
	ctx.strokeStyle = strokeStyle;
	ctx.lineWidth = lineWidth;
	
	// for(let layer of points){
	// 	ctx.beginPath();
	// 	ctx.moveTo(layer[0].x, layer[0].y);
		
	// 	for(let p of layer){
	// 		ctx.lineTo(p.x, p.y);
	// 		ctx.stroke();
	// 	}
		
	// 	ctx.closePath();
	// }
	// had to rewrite this loop since for each wouldn't allow for proper functionality
	for(let i = 0; i < points.length; i++){
		ctx.lineWidth = allStrokes[i];
		ctx.strokeStyle = allColors[i];
		ctx.beginPath();
		ctx.moveTo(points[i][0].x, points[i][0].y);
		for(let j = 0; j < points[i].length; j++){
			ctx.lineTo(points[i][j].x, points[i][j].y);
			ctx.stroke();
		}
		ctx.closePath();
	}
}

//change drawing to start from on drag to on mouse down.

// EVENT CALLBACK FUNCTIONS
function doMousedown(e){
	dragging = true;
	let mouse = getMouse(e);
	ctx.beginPath();
	ctx.moveTo(mouse.x, mouse.y);
	
	//points
	currentLayer.push(mouse);
	allPoints.push(currentLayer);
	allStrokes.push(lineWidth);
	allColors.push(strokeStyle);
	undoPoints = [];//clears undo array so no undo/redo produces wanted results
	undoStrokes = [];
	undoColors = [];
}

function doMousemove(e) {
	// bail out if the mouse button is not down
	if(!dragging) return;
	
	// get location of mouse in canvas coordinates
	let mouse = getMouse(e);
	ctx.strokeStyle = strokeStyle;
	ctx.lineWidth = lineWidth;
	
	// draw a line to x,y of mouse
	ctx.lineTo(mouse.x, mouse.y);
	
	// stroke the line
	ctx.stroke();
	
	//points
	currentLayer.push(mouse);

}

function doMouseup(e) {
	ctx.closePath();
	
	if(dragging){
		//points
		currentLayer = [];
		console.log(allPoints);
		dragging = false;
	}
	loadStencil(currentStencil);
}

// if the user drags out of the canvas
function doMouseout(e) {
	ctx.closePath();
	
	if(dragging){
		//points
		currentLayer = [];
		console.log(allPoints);
		dragging = false;
	}
	
	//points
	currentLayer = [];
	console.log(allPoints);
}


function doClear(){
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	allPoints = [];
	allStrokes = [];
	allColors = []
	loadStencil(currentStencil);
}

function onLocationHashChanged(){
	let key = window.location.hash.substring(1);
	allPoints = allDrawings[key].points;
	loadDrawing(allPoints);
	console.log("changed drawing");
}

function exportCanvasAsPNG() {
	//console.log("button going through")
	
	imgURL = canvas.toDataURL("image/png"); //gets canvas data as png
	
	dlLink = document.createElement('a');//creates a download link
	dlLink.download = document.querySelector("#creatureName").value;//this is the name of the file to be downloaded
	dlLink.href = imgURL;//sets the link of the a element
	dlLink.dataset.downloadurl = ["image/png", dlLink.download, dlLink.href].join(':');//creates the actual download

	document.body.appendChild(dlLink);//adds the download link
 	dlLink.click();//auto clicks the link
	document.body.removeChild(dlLink);//deletes the link
}

function addToPage(){
	document.querySelector("#creatureFinal").src = canvas.toDataURL("image/png");
	
}

function changePenSize(){ //just takes the slider val and changes line width.
	console.log(ctx);
	lineWidth = sizeSlider.value;
	console.log("size slider : " + sizeSlider.value);
}

function changeColor(){//general change function for the colors
	//the values are being set in the html
	strokeStyle = this.value;
}

//firebase
function onDataChanged(data){
	let bigString = "";
	allDrawings = data.val();
	console.log(allDrawings);
	
	if(!allDrawings){
		drawingList.innerHTML = "";
		return;
	}
	
	for(let key of Object.keys(allDrawings)){
		//one set of points
		let drawing = allDrawings[key];
		bigString += `<li><a href = "#${key}"> ${key}</a></li>`;
	}
	
	drawingList.innerHTML = bigString;
}

function onFirebaseError(error){
	console.log(`ERROR=$(error)`);
}

// UTILITIES
function getMouse(e){
	let mouse = {};
	mouse.x = e.pageX - e.target.offsetLeft;
	mouse.y = e.pageY - e.target.offsetTop;
	return mouse;
}

//FIREBASE
function initFirebase(){

	// Initialize Firebase
	var config = {
	apiKey: "AIzaSyB83TKMW-91E2FNaZzzcOs_7VmnIsPeYWA",
	authDomain: "share-draw-230de.firebaseapp.com",
	databaseURL: "https://share-draw-230de.firebaseio.com",
	projectId: "share-draw-230de",
	storageBucket: "share-draw-230de.appspot.com",
	messagingSenderId: "435389588658",
	appId: "1:435389588658:web:39d0b31b4ab3691e5295ab"
	};
	firebase.initializeApp(config);

	firebase.database().ref(DRAWINGPATH).on("value",onDataChanged, onFirebaseError);
}

//CREATE UNDO FUNCTIONALITY
function undoButton() {
	if(allPoints.length > 0){
		undoPoints.push(allPoints[allPoints.length-1]);
		allPoints.pop();
		undoStrokes.push(allStrokes[allStrokes.length-1]);
		allStrokes.pop();
		undoColors.push(allColors[allColors.length-1]);
		allColors.pop();
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		loadDrawing(allPoints);
		console.log("pop");
	}
	loadStencil(currentStencil);
}

function redoButton(){
	if(undoPoints.length > 0){
		allPoints.push(undoPoints[undoPoints.length-1]);
		undoPoints.pop();
		allStrokes.push(undoStrokes[undoStrokes.length-1]);
		undoStrokes.pop();
		allColors.push(undoColors[undoColors.length-1]);
		undoColors.pop();
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		loadDrawing(allPoints);
		console.log("push");
	}
	loadStencil(currentStencil);
}

//STENCILS

function loadStencil(name){
	
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	loadDrawing(allPoints);
                //Loading of the home test image - img1
                var img1 = new Image();
                img1.src = '../Stencils/' + name + '.png';
                //drawing of the test image - img1
                img1.onload = function () {
                    //draw background image
                    ctx.drawImage(img1, (ctx.canvas.width/2) - (ctx.canvas.height/2), (ctx.canvas.height/2) - ((ctx.canvas.height * 0.82)/2),ctx.canvas.height,ctx.canvas.height * 0.82);
                    //draw a box over the top
                    
                }; 
}

function stencilSelect(){
	//error is because its looking for an undefined stencil when one isnt selected.
	//can either be fixed or can be left alone too
	if(this.value === "undefined"){
		removeStencil();
	}else{
		currentStencil = this.value;
		loadStencil(this.value);
	}

	stencilScreenOff();
}

function removeStencil(){
	currentStencil = "";
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	loadDrawing(allPoints);
	stencilScreenOff();
}

function trashDrawing(){
	trashScreenOff();
	doClear();
}

function completeWasChecked(){
	checkCompleteOff();
	completeScreenOn();
}
//ALL OVERLAY CONTROLS (repetitive i know)

function trashScreenOn(){
	document.getElementById("trashScreen").style.display = "flex";
	document.getElementById("overlayBackground").style.display = "block";
}

function trashScreenOff(){
	document.getElementById("trashScreen").style.display = "none";
	document.getElementById("overlayBackground").style.display = "none";
}

function stencilScreenOn(){
	document.getElementById("stencilScreen").style.display = "flex";
}

function stencilScreenOff(){
	document.getElementById("stencilScreen").style.display = "none";
}

function completeScreenOn() {
	document.getElementById("completeScreen").style.display = "flex";
}
  
function completeScreenOff() {
	document.getElementById("completeScreen").style.display = "none";

	if(allPoints.length == 0) return;
		console.log("doSave");
		firebase.database().ref(DRAWINGPATH).push({
			points: allPoints
		});

	doClear();
}

function checkCompleteOn(){
	document.getElementById("completeCheckScreen").style.display = "flex";
	document.getElementById("overlayBackground").style.display = "block";
	addToPage();
}

function checkCompleteOff(){
	document.getElementById("completeCheckScreen").style.display = "none";
	document.getElementById("overlayBackground").style.display = "none";
}