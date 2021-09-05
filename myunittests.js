//Script,onDataLoad
//# sourceURL=myunittests.js
window.RUNMYTESTS = function() {
    let tests = `
T, 1S--2N--,      3C, shortness in !C
T, ----1S--2N--,  3C, natural
T, 1S--2C--2D--,  2H, 4th suit forcing; might not have !H
T, 1S--,    2N, good !S raise; no singletons or void
T, ----1S--, 2N, natural
T, ----1D1N--, 2C, ask for 5-card major; could be weak
T, 1D----1N--, 2C, ask for 5-card major; could be weak
T, 1D----1N--, 2D, Jacoby transfer; 5+!Hs
T, 1H--3S--4C--, 4D,  
    `;
    
    
    ALERTTESTER.runTests(tests);
}
window.RUNMYTESTS();
//Script
//Script,MyTests
window.RUNMYTESTS();
R=''
//Script
Shortcut, MT, %MyTests%
