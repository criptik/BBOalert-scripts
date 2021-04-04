TESTER_SCRIPTS=alertTester.js myunittests.js

all: alertBase.txt kbdBidSupport.js $(TESTER_SCRIPTS)
	cat $^ | xclip -selection clipboard

all_focus: alertBase.txt kbdBidSupport.js kbdAutoFocus.js $(TESTER_SCRIPTS)
	cat $^ | xclip -selection clipboard

all_large: alertBase.txt kbdBidSupport.js LARGE_BIDDING_BOX.txt $(TESTER_SCRIPTS)
	cat $^ | xclip -selection clipboard

%.txt : %.js
	sed -e s'/\/\/Script/Script/' $< | cpp -undef -P - >$@

all_dale: alertBase.txt dale.js
	cat $^ | xclip -selection clipboard

