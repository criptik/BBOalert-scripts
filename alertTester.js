//Script,onDataLoad
//# sourceURL=alertTester.js

window.ALERTTESTER = class {
    // copied some stuff from execUserScript so we can use our own ctx and bid
    static execUserScript(txt, ctx, bid) {
        try {
            // console.log('in myExecUserScript', ctx, bid);
            var rec = txt.split('%');
            if (rec.length < 2) return txt;
            var txt1 = '';
            var script;
            for (var i = 0; i < rec.length; i++) {
                if (i % 2 == 0) {
                    txt1 = txt1 + rec[i];
                } else {
                    script = getScript(rec[i]);
                    if (script != '') {
                        txt1 = txt1 + window.userScript(script, window.foundContext, ctx, window.foundCall, bid);
                    } else {
                        txt1 = txt1 + "%" + rec[i];
                        if (i < rec.length - 1) txt1 = txt1 + "%";
                    }
                }
            }
            return txt1;
        } catch(err) {
            console.log('myExecUserScript', err);
            return 'ERROR';
        }
    }

    static logMessage(msg) {
        window.addLog(msg);
        console.log(msg);
    }

    static ignoreSuitCase(txt) {
        function suitCharToUpper(match, offset, string) {
            return match.toUpperCase();
        }
        return (txt.replace(/ ![cdhsnCDHSN]/g, suitCharToUpper));
    }

    static getAlertFor(ctx, bid) {
        // call into BBOAlert findAlert but then use our own execUserScript
        try {
            let alertText = window.findAlert(ctx, bid);
            alertText = this.execUserScript(alertText, ctx, bid);
            alertText = this.ignoreSuitCase(alertText);
            return alertText;
        } catch (err) {
            console.log('getAlertFor', err);
        }
    }

    static getOptButtons() {
        let adPanel = document.getElementById("adpanel");
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
        let btns = this.getOptButtons();
        if (btns == null){
            console.log('btns null');
            return false;
        }
        for (let optName of optNames) {
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
                let optSuccess = false;
                if (fields.length >= 2) {
                    optSuccess = this.handleSetOptions(prevcmd, fields.slice(1));
                }
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
//Script
