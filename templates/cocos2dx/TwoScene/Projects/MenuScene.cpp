///
/// > Created using [RapidGame](http://wizardfu.com/rapidgame). See the `LICENSE` file for the license governing this code.
///

#include "Game.h"
#include "MenuScene.h"
#include "GameScene.h"

void MenuScene::onEnter()
{
	Scene::onEnter();

	string logoText = "TwoScene";
	string font = "DolceVita.ttf";
	SimpleAudioEngine::getInstance()->playBackgroundMusic("Intro.mp3");

	// Background
	auto bg = LayerColor::create(Color4B(218, 214, 212, 255));
	this->addChild(bg, -1);

	// Logo
	float y = 24;
	auto logo = Sprite::create("Logo.png");
	logo->setPosition(Game::centralize(0, 228 - y * 0.5f));
	this->addChild(logo, 1);
	logo->runAction(RepeatForever::create(Sequence::create(
		EaseInOut::create(MoveBy::create(2, Vec2(0, y)), 1.2),
		EaseInOut::create(MoveBy::create(2, Vec2(0, -y)), 1.2),
		nullptr
	)));
	
	// Title
	auto logoLabel = Label::createWithTTF(logoText.c_str(), font, 200);
	logoLabel->setColor(Color3B(128, 128, 128));
	logoLabel->setPosition(Game::centralize(0, 228));
	this->addChild(logoLabel, 1);
	
	// Menu
	auto menu = Menu::create();
	menu->setPosition(Vec2::ZERO);
	this->addChild(menu, 1);
	
	// Buttons
	auto playLabel = Label::createWithTTF("Play", font, 120);
	playLabel->setColor(Color3B(196, 196, 196));
	
	auto playButton = MenuItemLabel::create(playLabel, [] (Ref* ref)
	{
		auto scene = new GameScene;
		Director::getInstance()->replaceScene(scene);
		scene->release();		
	});
	playButton->setPosition(Game::centralize(0, -400));
	menu->addChild(playButton);
}


