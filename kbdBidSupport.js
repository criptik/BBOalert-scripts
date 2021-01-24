//Script,onBiddingBoxDisplayed
//# sourceURL=onBiddingBoxDisplayed.js

// debugger;
// this logic makes sure class is only defined once
// even when onBiddingBoxDisplayed is called many times
if (typeof(KbdBidHelperClass) == 'undefined') {
    window.KbdBidHelperClass = class KbdBidHelper {

	constructor() {
	    // we hold the keydown listener function so we can remove it if needed
	    // we only want to have one listener at any time
	    if (KbdBidHelper.boundListenFunc === undefined) KbdBidHelper.boundListenFunc = null;
	    if (KbdBidHelper.buttonIndexMap === undefined) this.initButtonIndexMap();
	    KbdBidHelper.instance = this;
	    this.elBiddingButtons = null;
	    // grab bidding button elements
	    let elBiddingBox = document.querySelector(".biddingBoxClass");
	    if (elBiddingBox == null) {
		console.log('Error: elBiddingBox missing');
		return;
	    }
	    this.elBiddingButtons = elBiddingBox.querySelectorAll(".biddingBoxButtonClass");
	    if (this.elBiddingButtons == null) {
		console.log('Error: elBiddingButtons missing');
		return;
	    }
	    if (this.elBiddingButtons.length < 17) {
		console.log(`Error: elBiddingButtons length is only ${this.elBiddingButtons.length}`);
		return;
	    }
  
	}

	// set the following to return true to get verbose console.log for keyBid debugging
	isVerbose() {
	    return false;
	}

	// set up button index map
	initButtonIndexMap() {
	    let map = new Map();
	    // buttons 0-6 for bidding levels 1-7
	    for (let n=0; n<=6; n++) {
		let key = `${n+1}`;
		map.set(key, n);
	    }
	    // buttons 7-11 for suits CDHSN
	    for (let n=7; n<=11; n++) {
		let key = 'CDHSN'[n-7];
		map.set(key, n);
	    }
	    // pass, double, redouble and OK buttons
	    map.set('--', 12);
	    map.set('Db', 13);
	    map.set('Rd', 14);
	    map.set('OK', 16);
	    KbdBidHelper.buttonIndexMap = map;		
	}

	static getInstance() {
	    return KbdBidHelper.instance;
	}

	// call the mousedown listener for a given button name
	buttonMouseDownListener(name) {
	    let idx = KbdBidHelper.buttonIndexMap.get(name);
	    if (idx == undefined) {
		console.log(`Error: no button idx for "${name}"`);
		return;
	    }
	    let mouseDownFunc = this.elBiddingButtons[idx].onmousedown;
	    if (mouseDownFunc == null) {
		console.log(`Error: null mousedown for "${name}"`);
	    }
	    mouseDownFunc();
	}
	
	isSettingSet(settingIndex) {
	    let rd = document.getElementById('rightDiv');
	    if (rd == null) return '';
	    let sc = rd.querySelectorAll('.settingClass');
	    if (sc.length < settingIndex+1) {
		if (sc.length == 0) return '';
	    }
	    if (document.querySelectorAll('.settingClass')[settingIndex].querySelector('mat-slide-toggle').classList[2] == "mat-checked") return 'Y';
	    else return 'N';
	}

	isKeyboardEntrySet() {
	    return this.isSettingSet(7);
	}


	// functions for testing the legality of a bid, used by handleKeyboardBid
	isBidLevelChar(ch) {
	    return ('1234567'.includes(ch));
	}

	isLevSuitBid(bid) {
	    if (bid == null) return false;
	    else return(this.isBidLevelChar(bid[0]));
	}

	bidAtPos(ctx, pos) {
	    return ctx.slice(pos, pos+2);
	}

	findLastLevSuitPos(s) {
	    let pos = s.length-2;
	    while ((pos >= 0) && (!this.isLevSuitBid(this.bidAtPos(s, pos)))) {
		pos -= 2;
	    }
	    return pos;
	}

	isBidByOpp(s, pos) {
	    let bidsFromEnd = (s.length - pos)/2;
	    return ((bidsFromEnd % 2) == 1);
	}

	findLastLevSuitBid(s) {
	    let pos = this.findLastLevSuitPos(s);
	    let bid = null;
	    let byOpp = null;
	    if (pos >= 0) {
		bid = this.bidAtPos(s, pos);
		byOpp = this.isBidByOpp(s, pos);
	    }
	    return {bid, byOpp};
	}

	findLastNonPassPos(s) {
	    let pos = s.length-2;
	    while ((pos >= 0) && (this.bidAtPos(s, pos) == '--')) {
		pos -= 2;
	    }
	    return pos;
	}
	
	findLastNonPassBid(s) {
	    let pos = this.findLastNonPassPos(s);
	    let bid = null;
	    let byOpp = null;
	    if (pos >= 0) {
		bid = this.bidAtPos(s, pos);
		byOpp = this.isBidByOpp(s, pos);
	    }
	    return {bid, byOpp};
	}

	isHigherThan(bid, prevBid) {
	    if (bid[0] > prevBid[0]) return true;
	    else if (bid[0] < prevBid[0]) return false;
	    else {
		// levels are the same, check suit
		let idx = 'CDHSN'.indexOf(bid[1]);
		let previdx = 'CDHSN'.indexOf(prevBid[1]);
		return (idx > previdx);
	    }
	}

	isLegalBid(bid, ctx) {
	    // pass is always legal
	    if (bid == '--') return true;
	    if (this.isLevSuitBid(bid[0])) {
		let lastBidObj = this.findLastLevSuitBid(ctx);
		if (lastBidObj.bid == null) return true;
		return(this.isHigherThan(bid, lastBidObj.bid));
	    }
	    if (bid == 'Db') {
		let lastNonPassObj = this.findLastNonPassBid(ctx);
		if (lastNonPassObj.bid == null) return false;
		return (this.isLevSuitBid(lastNonPassObj.bid) && lastNonPassObj.byOpp);
	    }
	    if (bid == 'Rd') {
		let lastNonPassObj = this.findLastNonPassBid(ctx);
		if (lastNonPassObj.bid == null) return false;
		return ((lastNonPassObj.bid == 'Db') && lastNonPassObj.byOpp);
	    }

	    // should not get this far, but if we do it is not legal
	    return false;
	}

	handleKeyboardBid(e) {
	    // this listener will ignore anything if the bidding box is not visible
	    if (!window.biddingBoxDisplayed) {
		return;
	    }
	    // will also ignore anything caught from an INPUT element
	    // (for example, keyboard input for cards played)
	    if (e.target.nodeName == 'INPUT') {
		return;
	    }
	    
	    let ukey = e.key.toUpperCase();
	    if (this.isVerbose()) console.log(`ukey=${ukey}`);

	    // here we check for Enter to record the callText 
	    if (ukey === 'ENTER') {
		// Enter goes to OK button
		// we would like to ignore it if OK button not visible
		// but the button goes away before this listener is called
		if (this.keyBuffer.length == 2) { 
		    console.log(`recorded bid of ${this.keyBuffer}`);
		    // call the appropriate mouseDown function code
		    this.buttonMouseDownListener('OK');
		}
		// restart bid gathering
		this.keyBuffer = '';
		return;
	    }
	    // level bids just add to keybuffer and return
	    // the appropriate mouseDown function will be called later
	    else if (this.isBidLevelChar(ukey)) {
		window.addLog(`key:[${ukey}]`);
		this.keyBuffer = ukey;
		return;
	    }
	    // the following keystrokes "finish" a bid
	    else if (ukey == 'P') {
		window.addLog(`key:[${ukey}]`);
		this.keyBuffer = '--';
		// pass is always legal
	    }
	    else if ('CDHSN'.includes(ukey) && (this.keyBuffer.length != 0) && this.isBidLevelChar(this.keyBuffer[0])) {
		window.addLog(`key:[${ukey}]`);
		this.keyBuffer += ukey;  // add suit to bid
		let ctx = window.getContext();
		if (!this.isLegalBid(this.keyBuffer, ctx)) {
		    this.keyBuffer = '';
		    // special case if bid was insufficient but suit was diamonds
		    // BBO interprets that as a "double"
		    if ((ukey == 'D') && this.isLegalBid('Db', ctx)) {
			this.keyBuffer = 'Db';
		    }
		}
	    }
	    else if (this.keyBuffer == '' && ukey == 'D') {
		window.addLog(`key:[${ukey}]`);
		this.keyBuffer = 'Db';
		let ctx = window.getContext();
		if (!this.isLegalBid(this.keyBuffer, ctx)) {
		    this.keyBuffer = '';
		}
	    }
	    else if (ukey == 'R') {
		window.addLog(`key:[${ukey}]`);
		this.keyBuffer = 'Rd';
		let ctx = window.getContext();
		if (!this.isLegalBid(this.keyBuffer, ctx)) {
		    this.keyBuffer = '';
		}
	    }
	    else {
		// any other ukey value is just ignored
		return;
	    }

	    if (this.keyBuffer == '') {
		if (this.isVerbose()) console.log('no callText found in keyboard listener');
	    }

	    // if we got this far we have a non-empty (legal) this.keyBuffer, call appropriate mousedown functions
	    if (this.isBidLevelChar(this.keyBuffer[0])) {
		window.addLog(`keyCall:[${this.keyBuffer}]`);
		if (this.isVerbose()) console.log(`keyCall:[${this.keyBuffer}]`);
		// call mousedown for each of the two parts
		let levelchar = this.keyBuffer[0];
		let suitchar = this.keyBuffer[1];
		this.buttonMouseDownListener(levelchar);
		this.buttonMouseDownListener(suitchar);
	    }
	    else {
		// pass, double, redouble
		this.buttonMouseDownListener(this.keyBuffer);
	    }
	    this.keyBuffer = '';
	}

	// main activity when bidding box created
	// if keyboard bidding is set, hook in necessary listeners
	addKeyDownListener() {
	    // before we install new keydown listener, remove any existing listener that we had put in
	    // for now we will listen at document level 
	    // and then ignore the kbd input from INPUT elements, etc.
	    this.removeKeyDownListener();
	    if (this.isKeyboardEntrySet() == 'Y') {
		KbdBidHelper.boundListenFunc = this.handleKeyboardBid.bind(this);
		document.addEventListener('keydown', KbdBidHelper.boundListenFunc, true);
		console.log('Keyboard bidding listener set up');
	    }
	}

	removeKeyDownListener() {
	    if (KbdBidHelper.boundListenFunc != null) {
		document.removeEventListener('keydown', KbdBidHelper.boundListenFunc, true);
	    }
	    console.log('Keyboard bidding listener removed');
	}
    }; // end of class	
} // end of if class defined

// main code, create a new instance on each onBiddingBoxDisplayed Event
// and attach the listener
let helper = new window.KbdBidHelperClass();
helper.addKeyDownListener();

//Script

//Script,onBiddingBoxRemoved
//# sourceURL=onBiddingBoxRemoved.js

// debugger;
let helper = window.KbdBidHelperClass.getInstance();
if (helper != null) {
    helper.removeKeyDownListener();
}

//Script