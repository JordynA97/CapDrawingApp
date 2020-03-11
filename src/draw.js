"use strict";
	//set variables
	let ctx,dragging=false,lineWidth,strokeStyle;
	let allPoints = [];
	let currentLayer = [];
	let exportBtn = document.querySelector("#exportPNG");
	let clearButton = document.querySelector("#clearButton");
	let saveButton = document.querySelector("#saveButton");
	let clearCloudButton = document.querySelector("#clearCloudButton");
	let sizeSlider = document.querySelector("#sizeSlider");
	var dlLink;
	var imgURL;
	
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

	//firebase
	const DRAWINGPATH = "saveDrawings";
	let allDrawings = {};
	
	initFirebase();
	init();

	// FUNCTIONS
	function init(){
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
		clearButton.onclick = doClear;
		saveButton.onclick = doSave;
		clearCloudButton.onclick = doClearCloud;
		exportBtn.onclick = exportCanvasAsPNG;
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
	}
	
	function loadDrawing(points){
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		
		ctx.strokeStyle = strokeStyle;
		ctx.lineWidth = lineWidth;
		
		for(let layer of points){
			ctx.beginPath();
			ctx.moveTo(layer[0].x, layer[0].y);
			
			for(let p of layer){
				ctx.lineTo(p.x, p.y);
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
	}
	
	function doSave(){
		if(allPoints.length == 0) return;
		console.log("doSave");
		firebase.database().ref(DRAWINGPATH).push({
			points: allPoints
		});
	}
	
	function doClearCloud(){
		firebase.database().ref(DRAWINGPATH).remove();
	
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
		dlLink.download = "image";//this is the name of the file to be downloaded
		dlLink.href = imgURL;//sets the link of the a element
		dlLink.dataset.downloadurl = ["image/png", dlLink.download, dlLink.href].join(':');//creates the actual download
	
		// document.body.appendChild(dlLink);//adds the download link
		// dlLink.click();//auto clicks the link
		// document.body.removeChild(dlLink);//deletes the link
		//doing ^ all at the same time makes no change to the actual html page
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
  
  console.log(firebase);
  
  firebase.database().ref(DRAWINGPATH).on("value",onDataChanged, onFirebaseError);
 }

 function emailDrawing(){
	//put values into variables to use when sending email
	var recipient = document.getElementById("email").value;
	var name = document.getElementById("emailRecipientName").value;

	// Change all values to your own
	let params = {
	   user_id: 'user_c5WJKW86pjWQpiPmooWXU',
	   service_id: 'gmail',
	   	template_id: 'template_r9h26Pnk',
		template_params: {
		 'image': imgURL,
		 'name': name,
		 'recipient': recipient,
		}
	};

	//customize any necessary headers
	let headers = {
	   "Content-type": "application/json"
	};

	//basic needs of the fetch
	let options = {
	   method: 'POST',
	   headers: headers,
	   body: JSON.stringify(params)
	};

	 //fetch the email send api
	fetch('https://api.emailjs.com/api/v1.0/email/send', options)
	   	.then((httpResponse) => {
		if (httpResponse.ok) {
		   alert("Your email has been sent!");
		} else {
		   	return httpResponse.text()
			.then(text => Promise.reject(text));
		}
	})
	.catch((error) => {
		alert("Your email could not be sent: " + error);
	});

	//close the form after its sent (edit this later for when we make an overlay for it)
	//document.getElementById("emailUploadTemplates").style.display = "none";
}
 