clean:
	cd src/proj.android; make clean
	rm -rf ~/Library/Developer/Xcode/DerivedData/cocos2dx-prebuilt*

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
