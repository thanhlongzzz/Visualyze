var myAudio;
var dropPlaylists;
var dropListMusic;
var dropListBackG;
var indexSongNow;
var info;

var backG;
var backgNow;
var objects = [];

var mic;
var AmplitudeData;
var FftData;
var ampLevel;
var fftAnalyze;
var fftWave;

var rectChooseMulti;
var designMode = false;
var mouseActive = 0; // when mouse not move after 5s -> close dat.gui
var preWidth, preHeight;
var client_id = '587aa2d384f7333a886010d5f52f302a'; // Soundcloud

function setup() {
	// first setting
	createCanvas(windowWidth, windowHeight).smooth().position(0, 0).drop(getFileLocal);
	colorMode(HSB);
	angleMode(DEGREES);
	imageMode(CENTER);
	rectMode(CENTER);
	textSize(20);
	textAlign(CENTER, CENTER);
	
	preWidth = width;
	preHeight = height;
	mic = new p5.AudioIn();
	AmpData = new p5.Amplitude();
	FftData = new p5.FFT(0.4, 1024);
	
	// add object
	info = new InfoSong();
	rectChooseMulti = new rectChooseMultiObject();
	addGui();

	// background
	backgNow = floor(random(0, BackList.length));
	VisualizeGui.backgs = BackList[backgNow].name;
	backG = loadImage(BackList[backgNow].link);

	// create Audio
	indexSongNow = floor(random(SongList.length-1));
	VisualizeGui.songs = SongList[indexSongNow].name;
	addAudioFromID(SongList[indexSongNow].id);

	// theme
	var nameTheme = random(['HauMaster', 'HoangTran', 'HauMasterLite']);
	VisualizeGui.themes = nameTheme;
	loadJSON('default theme/'+nameTheme+'.json',
				// loaded
				function(data){loadTheme(data, false);},
				// error
				function(){
					var id = SongList[indexSongNow].id;
					addAudioFromID(id);
				}
			);
}

function draw(){
	if((focused && VisualizeGui.checkFocus) || !VisualizeGui.checkFocus){
		animationBackground();
		autoChangeBackFunc();

		if(second() - mouseActive > 1 && gui.closed) // auto hide dat.GUI
			gui.domElement.style.display = "none";

		// get data to visualyze
		if(myAudio){
			ampLevel = AmpData.getLevel();
			fftWave = FftData.waveform();
			fftAnalyze = FftData.analyze();
			fftAnalyze.splice(65, 1024-64);
				
			// run all objects
			for(var i = 0; i < objects.length; i++)
				objects[i].run();
		}

		// choose multi object
		if(rectChooseMulti.isActive && designMode){
			rectChooseMulti.show();
		}
	}
}

function keyPressed(){
	if(keyCode == 83) { // S key
		designMode = !designMode;
		VisualizeGui.showDesignMode = designMode;
		if(designMode) showFolder('Design');
	
	} else if(keyCode == LEFT_ARROW){
		if(myAudio.elt.currentTime >= 5 && !myAudio.elt.paused)
			myAudio.play().time(myAudio.elt.currentTime-5);

	} else if(keyCode == RIGHT_ARROW && !myAudio.elt.paused){
		if(myAudio.elt.currentTime < myAudio.elt.duration-5)
			myAudio.play().time(myAudio.elt.currentTime+5);

	} else if(keyCode == 67) {	// C key
		if(myAudio){
			if(!myAudio.elt.controls)
				myAudio.showControls();
			else myAudio.hideControls();
		}
	}
}

function mousePressed(){
	if(designMode){
		for(var i = 0; i < objects.length; i++)
			objects[i].boxcontain.mouseChoose();

		// if choose multi object => when click mouse 
		// => need to check position of mouse
		// => is mouse position inside any 'choosed' object
		var foundObjectInChoose = false;
		for(var i = 0; i < objects.length; i++){
			if(objects[i].boxcontain.allowChangepos 
			&& objects[i].boxcontain.chooseMulti){
				foundObjectInChoose = true;
				break;
			}
		}

		if(!foundObjectInChoose)
			for(var i = 0; i < objects.length; i++)
				objects[i].boxcontain.setChooseMulti(false);

	} else {
		// check if mouse click on a button
		for(var i = 0; i < objects.length; i++){
			if(objects[i].objectType == 'ButtonShape')
				objects[i].clicked();
		}
	}
}

function mouseDragged(){
	if(designMode){
		for(var i = 0; i < objects.length; i++)
			objects[i].boxcontain.drag();
	
		if(keyIsDown(CONTROL) && rectChooseMulti.isActive){
			// save end pos while drag + ctrl
			rectChooseMulti.setEnd(mouseX, mouseY);
	
		} else {
			rectChooseMulti.setActive(true);
			// begin and end position will = first pos + ctrl
			rectChooseMulti.setBegin(mouseX, mouseY);
			rectChooseMulti.setEnd(mouseX, mouseY);
		}
	}
}

function mouseReleased(){
	if(rectChooseMulti.isActive && designMode){
		for(var i = 0; i < objects.length; i++){
			if(isPointInsideRect(objects[i].pos, rectChooseMulti.beginPoint, rectChooseMulti.endPoint))
				objects[i].boxcontain.setChooseMulti(true);
		}
		rectChooseMulti.setActive(false);
	}
}

function mouseMoved() {
	mouseActive = second();
	gui.domElement.style.display = "";
}

function windowResized() {
	for(var i = 0; i < objects.length; i++){
		var newPos = createVector(objects[i].pos.x/preWidth*windowWidth, objects[i].pos.y/preHeight*windowHeight);
		var newSize = createVector(objects[i].size.x/preWidth*windowWidth, objects[i].size.y/preHeight*windowHeight);;
		objects[i].setPosition(newPos.x, newPos.y);
		objects[i].setSize(newSize.x, newSize.y);
		
		objects[i].boxcontain.applyPosition();
		objects[i].boxcontain.applySize();
	}
	resizeCanvas(windowWidth, windowHeight, true);
	preWidth = windowWidth;
	preHeight = windowHeight;
}
