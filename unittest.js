//Script,onDataLoad
//# sourceURL=unittest.js

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
        for (let singleTest of tests) {
            numtests++;
            let [ctx, bid, exp] = singleTest;
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
            window.addBBOalertLog('see Export All or Console for details <br>');
        }
    }
} // end of class

tests = [
    ['', '1N', '15-17 Balanced could have 5!H or 5!S'],
    ['--', '+', '+'],
    ['----', '+', '15-17 Balanced no 5M'],
    ['------', '+', '+'],
    ['--1N--', '2C', 'ask for 5-card major; could be weak'],
    ['1N--',   '+',  '+'],
    ['1H--2C--2D--',  '2S',  '4th suit forcing; might not have !S'],
    ['--1H--2C--2D--',  '2S',  '4th suit forcing; might not have !S'],
    ['----1H--2C--2D--',  '2S',  '4th suit forcing; might not have !S'],
    ['------1H--2C--2D--',  '2S',  '4th suit forcing; might not have !S'],
    ['1C--1D--1H--',  '2S',  '4th suit forcing; might not have !S'],
    ['1C--1D--1H--',  '1S',  'natural; at least 4 !S'],
    ['1H--', '2N', 'good !H raise; no singletons or void'],
    ['1H--2N--', '3C', 'shortness in !c'],
    // test no alert
    ['', '1H', ''],
];
// add some tests programatically
for (let wk2suit of 'DHS') {
    for (let queryRespSuit of 'CDHS') {
        let alertText;
        if (queryRespSuit == wk2suit) {
            alertText = 'No outside A or K';
        }
        else {
            alertText = `A or K in !${queryRespSuit}`;
        }
        tests.push([`2${wk2suit}--2N--`, `3${queryRespSuit}`, alertText]);
    }
}
ALERTTESTER.runTests(tests);

//Script
