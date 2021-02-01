all: alertBase.txt kbdBidSupport.js
	cat alertBase.txt kbdBidSupport.js | xclip -selection clipboard

%.txt : %.js
	sed -e s'/\/\/Script/Script/' $< | cpp -undef -P - >$@

test: alertBase.txt alertTest.js
	cat alertBase.txt alertTest.js | xclip -selection clipboard
