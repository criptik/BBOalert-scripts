//Script,onDataLoad
//# sourceURL=alertTester.js

/****
The alertTester script allows one to test whether your BBOalert rules
produce the alert text that you expect.  You specify a bidding context
(i.e., bidding history) and a new bid and the script will figure out
what alert text would be generated for the combination of that context
and that bid.

When you add new rules to BBOalert, you often want to check for their
correctness, especially when the rules involve using a script or a
regular expression.  This script helps with that and avoids having to
start a teaching table and manually enter bidding sequences there.  In
addition, it allows tests to be repeated easily.

The testing can be done as in this example which runs 3 Drury-related
tests (The third test line below checks that 2C after third-seat 1D
does NOT cause an alert.):

Script,onDataLoad
let tests = `
T, ----1H--,   2C, limit raise in !H
T, ------1S--, 2C, limit raise in !S
T, ----1D--,   2C, 
`;
ALERTTESTER.runTests(tests);
Script

ALERTTESTER.runTests takes a string consisting of multiple test lines.
(In javascript, surrounding text with backquotes as above is one way to
declare multi-line strings.)

Each test line consists of a comma separated list consisting of a
command field and a list of fields specific to that command.

<command>
   There are two commands supported:
      * T, <context>, <call>, <explanation> 
          whicih tests a specific context and bid combination.

      * SetOptions, Option, Option, ...
          is used to force enable option blocks
      
command == 'T':
---------------
   fields are <context>, <call>, <explanation>.  These have similar
   meanings to the normal BBOalert data lines, but each field must
   explicitly state a single string.  Wildcards, regular expressions
   or script calls are not allowed.

   <context> can be blank meaning the <call> is the opening bid.

   <explanation> can be blank, meaning that no alert is generated.

   Any of the three fields can be '+' to mean reuse the corresponding
   field from the previous test line.

command == 'SetOptions':
------------------------
   fields are a comma-separated list of option names, i.e. names of
   option blocks in your BBOalert data. Each listed option name will
   enable that block in your BBOalert data.  Note that vulnerability
   and seat-dependent options are legal fields for the SetOptions
   command.

   The "Startup Option Config" is the set of options that are enabled
   by default at startup, except that any vulnerability or
   seat-dependent options are disabled (since you are not actually at
   a BBO table).
   
   SetOptions always starts with the Startup Option Config and then
   adds the explicit listed options.  As usual, when an option that is
   part of a prefix set is enabled, the other options in that prefix
   set are disabled.

   So if SetOptions is not used or if SetOptions is used without
   any fields, the "Startup Option Config" is what is enabled.

   Two adjacent SetOptions command lines are treated the same as if all
   the options were on a single SetOptions command line.

Reporting Results
-----------------
runTests produces a summary line of successes and failures in the
BBOalert log area.  If there are failures, the details of each failure
can be seen by using the "Export Log" button and looking at what is in
the clipboard or by looking at the console.log in the browser tools
(Ctrl-Shift-J on Chrome).

The script example above automatically runs the tests each time BBO
starts up or when a new set of BBOalert data is imported.  This is
useful to confirm that things are still working as expected.
Alternatively, the runTests call could be wrapped in its own %Script%
name and run manually from a button or shortcut.

*****/

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
        return (txt.replace(/![cdhsnCDHSN]/g, suitCharToUpper));
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
//Script
