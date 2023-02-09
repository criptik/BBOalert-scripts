//Script,onDataLoad
//# sourceURL=alertTester.js

window.ALERTTESTER = class {
    static logMessage(msg) {
        window.addLog(msg);
        console.log(msg);
    }

    static ignoreSuitCase(txt) {
        function suitCharToUpper(match, offset, string) {
            return match.toUpperCase();
        }
        return (txt.replace(/![cdhsnCDHSN]/g, suitCharToUpper));
    }

    static getAlertFor(ctx, bid) {
        // call into BBOAlert findAlert but using our own parameters to userScript
        try {
	    window.userScript = function(S, CR, C, BR, B) {
		return window.ALERTTESTER.orig_userScript(S, CR, ctx, BR, bid);
	    };
            let alertText = window.findAlert(ctx, bid);
            alertText = this.ignoreSuitCase(alertText);
	    window.userScript = window.ALERTTESTER.orig_userScript;
            return alertText;
        } catch (err) {
            console.log('getAlertFor', err);
        }
    }

    static getOptButtons() {
        let adPanel = window.parent.document.getElementById("adpanel");
        if (adPanel == null) {
            console.log('adpanel null');
            return null;
        }
        let btns = adPanel.querySelectorAll('button');
        if (btns == null) {
            console.log('btns null');
        }
        return btns;
    }

    static setButtonOff(btn) { 
        btn.style.backgroundColor = "white";
    }

    static setButtonOn(btn) { 
        btn.style.backgroundColor = "lightgreen";
    }

    static isSeatOrVulDependent(txt) {
        return (/@[1234nvNV]/.test(txt));
    }
            
    static initOptions() {
        // first clear things to init state
        // then clear anything that is seat or vul dependent
        window.initOptionDefaults();
        let btns = this.getOptButtons();
        if (btns == null) return;
        for (let btn of btns) {
            if (this.isSeatOrVulDependent(btn.textContent)) {
                this.setButtonOff(btn);
            }
        }
        
    }

    static setSamePrefixOff(btns, optName) {
        let prefix = optName.split(' ')[0];
        for (let btn of btns) {
            let myPrefix = btn.textContent.split(' ')[0];
            if (myPrefix == prefix && btn.textContent != optName) {
                this.setButtonOff(btn);
            }
        }
    }        

    static handleSetOptions(prevcmd, optNames) {
        if (prevcmd != 'SetOptions') {
            this.initOptions();
        }
        // empty list just sets to default
        console.log(optNames, optNames.length);
        if (optNames.length == 0) return true;   
        let btns = this.getOptButtons();
        if (btns == null){
            console.log('btns null');
            return false;
        }
        for (let optName of optNames) {
            if (optName == '') continue;
            let idx = window.findOption(optName);
            if (idx < 0) {
                console.log(`no such option button ${optName}`);
                return false;
            }
            this.setButtonOn(btns[idx]);
            // turn off other buttons with same prefix
            this.setSamePrefixOff(btns, optName);
        }
        return true;
    }

    static isButtonOn(btn) {
        return (btn.style.backgroundColor == "lightgreen");
    }

    static runTests(tests) {
        window.initOptionDefaults();
        let prevcmd, prevctx, prevbid, prevexp, numtests, failures;
        numtests = failures = 0;
        prevbid = prevctx = prevexp = '';
        prevcmd = prevctx = prevexp = '';
        let testLines = tests.split('\n');
        for (let line of testLines) {
            let fields = line.split(',');
            // debugger;
            for (let n = 0; n < fields.length; n++) {
                fields[n] = fields[n].trim();
            }
            let cmd = fields[0];
            if (cmd == 'SetOptions') {
                let optSuccess = this.handleSetOptions(prevcmd, fields.slice(1));
                if (!optSuccess) {
                    this.logMessage(`error on ${fields}`);
                }
            }
            else {
                // a normal test line
                if (fields.length < 4) continue;   // comment, ignore
                numtests++;
                let [tmarker, ctx, bid, exp] = fields;
                //console.log(numtests, ctx, bid, exp);
                //continue;
                ctx = window.elimineSpaces(ctx);
                if (ctx == '+') ctx = prevctx;
                if (bid == '+') bid = prevbid;
                if (exp == '+') exp = prevexp;
                exp = this.ignoreSuitCase(exp);
                
                let actual = this.getAlertFor(ctx, bid);
                
                if (actual !== exp) {
                    window.addLog(`TEST ERROR: ctx=${ctx}, bid=${bid}, expected:"${exp}", got:"${actual}"`);
                    console.group(`TEST ERROR: ctx=${ctx}, bid=${bid}`);
                    console.log(`expected:"${exp}"`);
                    console.log(`actual  :"${actual}"`);
                    console.groupEnd();
                    failures++;
                }
                prevctx = ctx;
                prevbid = bid;
                prevexp = exp;
            }
            prevcmd = cmd;
        }
        
        let summaryMsg = `${numtests} Alert Tests complete, successes:${numtests - failures}, failures:${failures}`;
        this.logMessage(summaryMsg);
        window.addBBOalertLog(`<br>${summaryMsg}<br>`);
        if (failures > 0) {
            window.addBBOalertLog('see Export Log or Console.log for details <br>');
        }
    }
} // end of class

window.ALERTTESTER.orig_userScript = window.userScript;

//Script
