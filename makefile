all: alertBase.txt kbdBidSupport.js
	cat alertBase.txt kbdBidSupport.js | xclip -selection clipboard

test: alertBase.txt alertTest.js
	cat alertBase.txt alertTest.js | xclip -selection clipboard
