TESTER_SCRIPTS=alertTester.js myunittests.js

# LOCAL_JS=kbdBidSupport.js kbdBidSupportScript.js kbdAutoFocus.js kbdAutoFocusScript.js alertTester.js myunittests.js
LOCAL_JS=kbdBidSupport.js kbdBidSupportScript.js kbdAutoFocus.js kbdAutoFocusScript.js 
LOCAL_JS_TEST=$(LOCAL_JS) alertTester.js myunittests.js
#use local file rather than url
all_dev: alertBase.txt $(LOCAL_JS)
	cat $(LOCAL_JS) | grep -v '//Javascript' >local.dev
	cat alertBase.txt local.dev | xclip -selection clipboard

all_test: alertBase.txt $(LOCAL_JS_TEST)
	cat $(LOCAL_JS_TEST) | grep -v '//Javascript' >local.dev
	cat alertBase.txt local.dev | xclip -selection clipboard

all_url: alertBase.txt kbdBidSupportScript.js kbdAutoFocusScript.js myunittests.js
	cat $^ | xclip -selection clipboard

null: null.data
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
