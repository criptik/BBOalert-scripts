//Script,onDataLoad
//# sourceURL=alertTester.js

class ALERTTESTER {
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
    
    static runTests(tests) {
        let prevctx, prevbid, prevexp, numtests, failures;
        numtests = failures = 0;
        prevbid = prevctx = prevexp = '';
        let testLines = tests.split('\n');
        for (let line of testLines) {
            numtests++;
            let fields = line.split(',').slice(1);  // ignore first 'T' field
            if (fields.length < 3) continue;   // comment, ignore
            for (let n = 0; n < fields.length; n++) {
                fields[n] = fields[n].trim();
            }
            let [ctx, bid, exp] = fields;
            //console.log(numtests, ctx, bid, exp);
            //continue;
            ctx = window.elimineSpaces(ctx);
            if (ctx == '+') ctx = prevctx;
            if (bid == '+') bid = prevbid;
            if (exp == '+') exp = prevexp;
            exp = this.ignoreSuitCase(exp);

            let actual = this.getAlertFor(ctx, bid);
            
            if (actual !== exp) {
                this.logMessage(`TEST ERROR: ctx=${ctx}, bid=${bid}, expected:"${exp}", got:"${actual}"`);
                failures++;
            }
            prevctx = ctx;
            prevbid = bid;
            prevexp = exp;
        }
        
        let summaryMsg = `${numtests} Alert Tests complete, successes:${numtests - failures}, failures:${failures}`;
        this.logMessage(summaryMsg);
        window.addBBOalertLog(summaryMsg + '<br>');
        if (failures > 0) {
            window.addBBOalertLog('see Export Log or Console.log for details <br>');
        }
    }
} // end of class
//Script
