//Script,onDataLoad
//# sourceURL=optunittests.js
window.RUNMYTESTS = function() {
    let tests = `
// default
T, ,         1C, natural minor suit opening
SetOptions, A 13, B_@V
T, ,         1C, 13 HCP in !C
T, ,         1D, 13 HCP in !D
T, ,         2D, 14 HCP in !D
SetOptions, A 14
SetOptions, B_@N
T, ,         1C, 14 HCP in !C
T, ,         2D, 13 HCP in !D
// this should reset to default options
SetOptions
T, ,         1C, natural minor suit opening
T, ,         2D, natural 2 of a minor
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
