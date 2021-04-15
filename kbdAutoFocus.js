//Script,onDataLoad
//# sourceURL=kbdAutoFocus.js
// Version 1.0

window.AUTOFOCUSHELPER = class {
    constructor() {
        // if there is any old listeners around, attempt to remove them
        try {
            window.AUTOFOCUSHELPERINSTANCE.removeKeyDownListenerIfAny();
            window.AUTOFOCUSHELPERINSTANCE.removeKeyUpListenerIfAny();
        }    
        catch (e) {
        }
        this.verbose = false;   // set true for debugging info
        this.isMeActive = null;
    }

    logIfVerbose(txt) {
        if (this.verbose) console.log(txt);
    }
    
    inKbdEntryFocus(elem) {
        return ((this.elDealViewerDiv != null) && this.elDealViewerDiv.contains(elem));
    }

    //autofocus stuff
    onAuctionBoxDisplayed() {
        this.elDealViewerDiv = document.querySelector('.dealViewerDivClass');
        if (this.elDealViewerDiv != null) {
            for (let el of document.querySelectorAll('.dealViewerDivClass *')) {
                el.style.cursor = 'crosshair';
            }
        }
        this.myDirection = window.mySeat();
        this.declDir = null;
        this.lastActivePlayer = null;
        this.removeKeyDownListenerIfAny();
        this.removeKeyUpListenerIfAny();
    }

    onAuctionBoxHidden() { 
        let elTrickPanels = document.querySelectorAll('.tricksPanelTricksLabelClass');
        this.declDir = (elTrickPanels.length > 0) ? elTrickPanels[0].innerText[0] : '';
        this.logIfVerbose(`declDir detected as ${this.declDir}`);
        this.addKeyDownListener();
        this.addKeyUpListener();
    }

    plog(txt) {
        this.logtxt += (txt + '\n');
    }
    
    handleKeyDown(e) {
        this.needKeyUp = true;
    }
    
    handleKeyUp(e) {
        this.needKeyUp = false;
        if (this.focusChatOnKeyUp) {
            this.moveFocusTo(window.getChatInput());
            this.focusChatOnKeyUp = false;
        }
    }
    
    addKeyDownListener() {
        this.removeKeyDownListenerIfAny();
        this.boundKeyDownFunc = this.handleKeyDown.bind(this);
        document.addEventListener('keydown', this.boundKeyDownFunc, true);
    }
    
    removeKeyDownListenerIfAny() {
        if (this.boundKeyDownFunc != null) {
            document.removeEventListener('keydown', this.boundKeyDownFunc, true);
        }
    }
    
    addKeyUpListener() {
        this.removeKeyUpListenerIfAny();
        this.boundKeyUpFunc = this.handleKeyUp.bind(this);
        document.addEventListener('keyup', this.boundKeyUpFunc, true);
    }

    removeKeyUpListenerIfAny() {
        if (this.boundKeyUpFunc != null) {
            document.removeEventListener('keyup', this.boundKeyUpFunc, true);
        }
    }

    onNewActivePlayer() {
        this.logIfVerbose(`start: act=${window.activePlayer}, last=${this.lastActivePlayer}`);
        if (window.activePlayer == this.lastActivePlayer) return;
        this.lastActivePlayer = window.activePlayer;
        
        // always ignore if we have already entered some Input somewhere
        let nonEmptyInput = ((document.activeElement.nodeName == 'INPUT') && (document.activeElement.value != ''));
        let onCardTable = this.inKbdEntryFocus(document.activeElement);
        let onChat = (document.activeElement == window.getChatInput());
        
        // check if I am becoming active or inactive
        let activeId = window.activePlayer.substring(1);
        let activeDirection = window.activePlayer[0];
        let myId = window.whoAmI();
        let isTeachingTable = (myId == window.LHOpponent);
        let isMe = !isTeachingTable ? (activeId == myId) : (activeDirection == 'S');
        if (this.declDir != null) {
            // we are in the play part rather than bidding
            // if it's our turn but we are dummy, isMe gets set off
            if (isMe && (this.getOppositeDirection(this.declDir) == activeDirection)) {
                isMe = false;
            }
            // if we're declarer and dummy to play, isMe gets set on
            else if ((this.getOppositeDirection(this.declDir) == activeDirection) && (this.myDirection = this.declDir)) {
                isMe = true;
            }
                
        }
        this.logIfVerbose(`onNewPlayer: ${window.activePlayer} actElem=${document.activeElement.nodeName}, onCardTable=${onCardTable}, onChat=${onChat}, NEI=${nonEmptyInput}, ${isMe}, ${this.isMeActive}`);
        // detect a change
        if (isMe !== this.isMeActive) {
            this.isMeActive = isMe;
            // only move focus if we are in certain locations
            if (!nonEmptyInput && (onCardTable || onChat || (document.activeElement.nodeName == 'BODY'))) {
                let elDest;
                if (isMe) {
                    elDest = document.querySelector('.cardSurfaceClass');
                }
                else {
                    elDest = window.getChatInput();
                    elDest.style.caretColor = 'red';
                    if (this.needKeyUp) {
                        // if keyup not seen yet, delay setting focus
                        this.focusChatOnKeyUp = true;
                        return;
                    }
                }
                this.moveFocusTo(elDest);
                // elDest.click();
            }
        }
    }

    getOppositeDirection(dir) {
        let s = 'NESW';
        let dirIdx = s.indexOf(dir);
        return s[(dirIdx + 2) % 4];
    }
    moveFocusTo(elDest) {
        if (elDest != null) {
            if ((elDest.tabIndex === undefined) || (elDest.tabIndex < 0)) {
                elDest.tabIndex = 0;
            }
            setTimeout(function () {
                elDest.focus();
                this.logIfVerbose(`focus is now on ${document.activeElement}`); 
            }, 500);
        }
    }
} // end of class declaration

//Script
