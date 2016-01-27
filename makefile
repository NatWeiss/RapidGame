clean:
	# cd src/proj.android; make clean
	cd templates/cocos2dx/TwoScene/Projects/android; make clean
	cd templates/cocos2djs/TwoScene/Projects/android; make clean
	# rm -rf ~/Library/Developer/Xcode/DerivedData/cocos2dx-prebuilt*

doc:
	cp README.md README.litcoffee
	rm -rf docs
	docco -o docs -c src/docco/docco.css -t src/docco/docco.jst -l linear README.litcoffee templates/cocos2djs/TwoScene/Assets/lib/Game.js templates/cocos2djs/TwoScene/Assets/*.js templates/cocos2djs/TwoScene/Server/Server.js    #*/
	sed -i "" 's/README.litcoffee/README.md/g' docs/*.html    #*/
	mv docs/server.html docs/Server.html
	cp -r src/docco/public docs/
	cp -r src/docco/index.html docs/
	rm README.litcoffee
	cp -r ${dest}docs/* ../wizardfu.com/wordpress/docs/rapidgame/ #*/
	@src/docco/delete-between "<p>Created using" "this code.</p>" docs/Game.html
	@src/docco/delete-between "<p>Created using" "this code.</p>" docs/GameScene.html
	@src/docco/delete-between "<p>Created using" "this code.</p>" docs/MenuScene.html
	@src/docco/delete-between "<p>Created using" "this code.</p>" docs/Server.html

ver = cocos2d-x-3.9
patch:
	mkdir -p /tmp/ccx/cocos2d-x
	cd /tmp/ccx/cocos2d-x && cp ~/Downloads/${ver}.zip . && unzip ${ver}.zip && rm ${ver}.zip
	#cd /tmp/ccx && unzip ${ver}.zip && mv ${ver} cocos2d-x && rm ${ver}.zip
	find /tmp/ccx/cocos2d-x -name .gitignore -delete
	#find /tmp/ccx/cocos2d-x -type f -exec chmod 644 {} +
	git init /tmp/ccx/cocos2d-x
	cd /tmp/ccx/cocos2d-x && git add * && git commit -a -m initial
	rm -rf /tmp/ccx/cocos2d-x/plugin/plugins/facebook/proj.ios/FacebookSDK.framework
	cp -afv src/cocos2d-x/* /tmp/ccx/cocos2d-x/
	cd /tmp/ccx/cocos2d-x && git -c core.filemode=false diff > patch # && git diff --staged --binary >> patch
	mv /tmp/ccx/cocos2d-x/patch ./cocos2d.patch
	rm -rf /tmp/ccx
	ls cocos2d.patch
