//Script,onDataLoad
//# sourceURL=optunittests.js
window.RUNMYTESTS = function() {
    let tests = `
// default
T, ,         1C, natural minor suit opening
SetOptions, A 13, B_@n
T, ,         1C, 13 HCP in !C
T, ,         1D, 13 HCP in !D
T, ,         2D, 12 HCP in !D
SetOptions, A 12, B_@n
T, ,         1C, 12 HCP in !C
T, ,         2D, 12 HCP in !D
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
