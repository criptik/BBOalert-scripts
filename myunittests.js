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
T, ,         1N, 15-17 Balanced could have 5!H or 5!S
T, --,        +, +
T, ----,      +, 15-17 Balanced no 5M
T, ------,    +, +
T, --1N--, 2C, ask for 5-card major; could be weak
T, 1N--,    +, +
--------  Drury 4th suit Exceptions (3rd 4th seat opening only) ---------
T, 1H--2C--2D--,       2S, 4th suit forcing; might not have !S
T, --1H--2C--2D--,     2S, 4th suit forcing; might not have !S
T, ----1H--2C--2D--,   2S, natural
T, ------1H--2C--2D--, 2S, natural
--------  Splinter 4th suit Exceptions ---------
T, 1H--3S--4C--,       4D, 
----------------------------------------------
T, 1C--1D--1H--,       2S, 4th suit forcing; might not have !S
T, 1C--1D--1H--,       1S, natural; at least 4 !S
T, 1H--,               2N, good !H raise; no singletons or void
T, 1H--2N--,           3C, shortness in !c
T, 1N 2C,              2D, natural 5+!D; not forcing
T, ,        2N, 20-21 HCP Balanced; could have 5!H or 5!S
T,2C--**--, 2N, 22-24 HCP Balanced; could have 5!H or 5!S
T,1N 2D,    2N, asks partner to bid 3!C; then I will show my suit
T,1N 2H,    2N, asks partner to bid 3!C; then I will show my suit
T,1N 2S,    2N, asks partner to bid 3!C; then I will show my suit
T,     ,    1H, 
T,2H Db,    2S, lead directing and support for !H
T,2H Db,    3C, lead directing and support for !H
T,2S Db,    3H, lead directing and support for !S
T,2D Db,    3D, natural raise
T,2S Db,    3S, natural raise
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
