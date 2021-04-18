# alertTester Readme

The alertTester script allows one to test whether your BBOalert rules
produce the alert text that you expect.  You specify a bidding context
(i.e., bidding history) and a new bid and the script will figure out
what alert text would be generated for the combination of that context
and that bid.  It is also possible to control which option blocks get used for specific test commands.

When you add new rules to BBOalert, you often want to check for their
correctness, especially when the rules involve using a script or a
regular expression.  This script helps with that and avoids having to
start a teaching table and manually enter bidding sequences there.  In
addition, it allows tests to be repeated easily.

The testing can be done as in this example which runs 3 Drury-related
tests (The third test line below checks that 2C after third-seat 1D
does NOT cause an alert.):

```javascript
//Script,onDataLoad
//Javascript,https://raw.githubusercontent.com/criptik/BBOalert-scripts/main/alertTester.js
let tests = `
T, ----1H--,   2C, limit raise in !H
T, ------1S--, 2C, limit raise in !S
T, ----1D--,   2C, 
`;
window.ALERTTESTER.runTests(tests);
//Script
```

## Details
ALERTTESTER.runTests takes a string consisting of multiple test lines.
(In javascript, surrounding text with backquotes as above is one way to
declare multi-line strings.)

Each test line consists of a comma separated list consisting of a
command field and a list of fields specific to that command.

There are two commands supported:
* T, context, call, explanation 
  * whicih tests a specific context and bid combination.

* SetOptions, Option, Option, ...
  * is used to force enable option blocks
      
### command == 'T':
   fields are `<context>, <call>, <explanation>`.  These have similar
   meanings to the normal BBOalert data lines, but each field must
   explicitly state a single string.  Wildcards, regular expressions
   or script calls are not allowed.

   `<context>` can be blank meaning the `<call>` is the opening bid.

   `<explanation>` can be blank, meaning that no alert is generated.

   Any of the three fields can be '+' to mean reuse the corresponding
   field from the previous test line.

### command == 'SetOptions':
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

   To help with setting many options, multiple adjacent SetOptions
   command lines are treated the same as if all the options were on a
   single SetOptions command line.

## Reporting Results
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
