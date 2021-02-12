all: alertBase.txt kbdBidSupport.js
	cat $^ | xclip -selection clipboard

all_focus: alertBase.txt kbdBidSupport.js kbdAutoFocus.js
	cat $^ | xclip -selection clipboard

all_large: alertBase.txt kbdBidSupport.js LARGE_BIDDING_BOX.txt
	cat $^ | xclip -selection clipboard

%.txt : %.js
	sed -e s'/\/\/Script/Script/' $< | cpp -undef -P - >$@

test: alertBase.txt alertTest.js
	cat alertBase.txt alertTest.js | xclip -selection clipboard
