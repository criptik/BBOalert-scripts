TESTER_SCRIPTS=alertTester.js myunittests.js

all_dev: alertBase.txt kbdBidSupport.js kbdBidSupportScript.js kbdAutoFocus.js kbdAutoFocusScript.js $(TESTER_SCRIPTS)
	#use local file rather than url
	cat kbdBidSupport.js kbdBidSupportScript.js | grep -v '//Javascript' > kbdBidSupportScript.dev
	cat kbdAutoFocus.js kbdAutoFocusScript.js | grep -v '//Javascript' > kbdAutoFocusScript.dev
	cat alertBase.txt kbdBidSupportScript.dev  kbdAutoFocusScript.dev $(TESTER_SCRIPTS) | xclip -selection clipboard

all_url: alertBase.txt kbdBidSupport.url kbdAutoFocus.url alertTester.url myunittests.js
	cat $^ | xclip -selection clipboard

null: null.data
	cat $^ | xclip -selection clipboard

all_large: alertBase.txt kbdBidSupport.js LARGE_BIDDING_BOX.txt $(TESTER_SCRIPTS)
	cat $^ | xclip -selection clipboard

opttest: optBase.txt alertTester.js optunittests.js
	cat $^ | xclip -selection clipboard

opttest2: optBase2.txt alertTester.js optunittests.js
	cat $^ | xclip -selection clipboard

%.txt : %.js
	sed -e s'/\/\/Script/Script/' $< | cpp -undef -P - >$@

all_dale: alertBase.txt dale.js
	cat $^ | xclip -selection clipboard

all_dropbox: alertBase.txt kbdBidSupport.js kbdAutoFocus.js alertTestDropBox.txt myunittests.js
	cat $^ | xclip -selection clipboard
