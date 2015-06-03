///
/// > Created using [RapidGame](https://github.com/natweiss/rapidgame). See the `LICENSE` file for the license governing this code.
///

#include "Game.h"
#include "MenuScene.h"
#include "GameScene.h"

void MenuScene::onEnter()
{
	Scene::onEnter();

	string logoText = "TwoScene";
	string font = "DolceVita.ttf";
	CocosDenshion::SimpleAudioEngine::getInstance()->playBackgroundMusic("Intro.mp3");

	// Background
	auto bg = cocos2d::LayerColor::create(cocos2d::Color4B(218, 214, 212, 255));
	this->addChild(bg, -1);

	// Logo
	float y = 24;
	auto logo = cocos2d::Sprite::create("Logo.png");
	logo->setPosition(Game::centralize(0, 228 - y * 0.5f));
	this->addChild(logo, 1);
	logo->runAction(cocos2d::RepeatForever::create(cocos2d::Sequence::create(
		cocos2d::EaseInOut::create(cocos2d::MoveBy::create(2, cocos2d::Vec2(0, y)), 1.2),
		cocos2d::EaseInOut::create(cocos2d::MoveBy::create(2, cocos2d::Vec2(0, -y)), 1.2),
		nullptr
	)));
	
	// Title
	auto logoLabel = cocos2d::Label::createWithTTF(logoText.c_str(), font, 200);
	logoLabel->setColor(cocos2d::Color3B(128, 128, 128));
	logoLabel->setPosition(Game::centralize(0, 228));
	this->addChild(logoLabel, 1);
	
	// Menu
	auto menu = cocos2d::Menu::create();
	menu->setPosition(cocos2d::Vec2::ZERO);
	this->addChild(menu, 1);
	
	// Buttons
	auto playLabel = cocos2d::Label::createWithTTF("Play", font, 120);
	playLabel->setColor(cocos2d::Color3B(196, 196, 196));
	
	auto playButton = cocos2d::MenuItemLabel::create(playLabel, [] (Ref* ref)
	{
		auto scene = new GameScene;
		cocos2d::Director::getInstance()->replaceScene(scene);
		scene->release();		
	});
	playButton->setPosition(Game::centralize(0, -400));
	menu->addChild(playButton);
}


