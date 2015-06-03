///
/// > Created using [RapidGame](https://github.com/natweiss/rapidgame). See the `LICENSE` file for the license governing this code.
///

#include "Game.h"
#include "MenuScene.h"
#include "GameScene.h"

const double physicsStep = 1.0 / 240.0;
const int collisionTypeBall = 1;
const int collisionTypeWall = 2;
const int ballSpeed = 1500;
const int gravity = -2500;
const int labelPadding = 60;
const int wallThickness = 40;
int GameScene::score = 0;
cocos2d::Label* GameScene::scoreLabel = nullptr;

GameScene::GameScene()
{
	ball = nullptr;
	score = 0;
	accumulator = 0.0;
	space = nullptr;
}

GameScene::~GameScene()
{
}

void GameScene::onEnter()
{
	Scene::onEnter();
	auto& winSize = cocos2d::Director::getInstance()->getWinSize();
	auto& contentRect = Game::getContentRect();
	string fontName = "DolceVita.ttf";
	int x1 = contentRect.origin.x + wallThickness;
	int x2 = x1 + contentRect.size.width - wallThickness * 2;
	int y1 = contentRect.origin.y + wallThickness;
	int y2 = y1 + contentRect.size.height - wallThickness * 2;

	// Music
	CocosDenshion::SimpleAudioEngine::getInstance()->playBackgroundMusic("Song.mp3", true);

	// Stretched big background
	auto bg2 = cocos2d::LayerColor::create(cocos2d::Color4B(208, 204, 202, 255));
	bg2->setScale(2);
	this->addChild(bg2, -1);

	// Actual background
	auto bg = cocos2d::LayerColor::create(cocos2d::Color4B(218, 214, 212, 255), contentRect.size.width, contentRect.size.height);
	bg->setPosition(contentRect.origin);
	this->addChild(bg, 0);

	// Labels
	stringstream ss;
	ss << "Score: " << score;
	scoreLabel = cocos2d::Label::createWithTTF(ss.str().c_str(), fontName, 45);
	scoreLabel->setAnchorPoint(cocos2d::Vec2(0, 1));
	scoreLabel->setPosition(x1 + labelPadding, y2 - labelPadding);
	scoreLabel->setColor(cocos2d::Color3B(128, 128, 128));
	this->addChild(scoreLabel, 1);

	auto sceneLabel = cocos2d::Label::createWithTTF("Game Scene", fontName, 200);
	sceneLabel->setColor(cocos2d::Color3B(128, 128, 128));
	sceneLabel->setPosition(Game::centralize(0, 228));
	this->addChild(sceneLabel, 1);
	sceneLabel->runAction(cocos2d::Sequence::create(
		cocos2d::FadeOut::create(5),
		cocos2d::RemoveSelf::create(),
		nullptr
	));

	// Touch listners
	auto dispatcher = cocos2d::Director::getInstance()->getEventDispatcher();
	auto listener = cocos2d::EventListenerTouchAllAtOnce::create();
	listener->onTouchesBegan = [this] (const vector<cocos2d::Touch*>& touches, cocos2d::Event* event) {this->touchHandler("began", touches, event);};
	dispatcher->addEventListenerWithSceneGraphPriority(listener, this);

	// Start physics
	space = cpSpaceNew();
	space->gravity = cpv(0, gravity);

	// Walls
	createPhysicsBox(x1, y1, x2, contentRect.origin.y, 0.9, 0, collisionTypeWall); // bottom
	createPhysicsBox(x1, y2, x2, y2 + wallThickness, 0.9, 0, collisionTypeWall); // top
	createPhysicsBox(contentRect.origin.x, contentRect.origin.y, x1, y2 + wallThickness, 0.9, 0, collisionTypeWall); // left
	createPhysicsBox(x2, contentRect.origin.y, x2 + wallThickness, y2 + wallThickness, 0.9, 0, collisionTypeWall); // right

	// Ball
	ball = cocos2d::Sprite::create("Ball.png");
	createPhysicsSprite(ball, cocos2d::Vec2(winSize.width * 0.5f, winSize.height * 0.5f), 1.0f, 0.0f, collisionTypeBall);
	this->addChild(ball, 1);

	// Collision handler
	cpSpaceAddCollisionHandler(space, collisionTypeBall, collisionTypeWall, nullptr, nullptr, nullptr, GameScene::onCollision, nullptr);

	// Update
	this->scheduleUpdate();
}

void GameScene::update(float delta)
{
	// Step physics
	accumulator += delta;
	while (accumulator > physicsStep)
	{
		cpSpaceStep(space, physicsStep);
		accumulator -= physicsStep;
	}
	
	// Move ball sprite with body
	if (ball)
	{
		auto v = static_cast<cpBody*>(ball->getUserData())->p;
		ball->setPosition(v.x, v.y);
	}
}

void GameScene::onExit()
{
	Scene::onExit();
	this->unscheduleUpdate();

	for (auto& shape : shapes)
		cpShapeFree(shape);
	shapes.clear();

	cpSpaceRemoveCollisionHandler(space, collisionTypeBall, collisionTypeWall);
	cpSpaceFree(space);
}

void GameScene::createPhysicsBox(int x1, int y1, int x2, int y2, float elasticity, float friction, int collisionType)
{
	cpShape* shape = nullptr;
	int start = shapes.size();

	// create box as four segments
	shapes.push_back(cpSegmentShapeNew(space->staticBody, cpv(x1, y1), cpv(x1, y2), 0.0f));
	shapes.push_back(cpSegmentShapeNew(space->staticBody, cpv(x1, y2), cpv(x2, y2), 0.0f));
	shapes.push_back(cpSegmentShapeNew(space->staticBody, cpv(x2, y2), cpv(x2, y1), 0.0f));
	shapes.push_back(cpSegmentShapeNew(space->staticBody, cpv(x2, y1), cpv(x1, y1), 0.0f));
	for (int i = 0; i < 4; i++)
	{
		shapes[start + i]->e = elasticity;
		shapes[start + i]->u = friction;
		shapes[start + i]->collision_type = collisionType;
		cpSpaceAddStaticShape(space, shapes[start + i]);
	}
}

void GameScene::createPhysicsSprite(cocos2d::Sprite* sprite, cocos2d::Vec2 pos, float elasticity, float friction, int collisionType)
{
	auto& size = sprite->getContentSize();
	float w = size.width * 0.5f;
	float h = size.height * 0.5f;
	cpVect verts[] = {cpv(-w, -h), cpv(-w, h), cpv(w, h), cpv(w, -h)};
	const int n = sizeof(verts) / sizeof(verts[0]);

	// body
	auto body = cpBodyNew(1.0f, cpMomentForPoly(1.0f, n, verts, cpvzero));
	body->p = cpv(pos.x, pos.y);
	cpSpaceAddBody(space, body);

	// shape
	auto shape = cpCircleShapeNew(body, w, cpvzero);
	shape->e = elasticity;
	shape->u = friction;
	shape->collision_type = collisionType;
	cpSpaceAddShape(space, shape);
	shapes.push_back(shape);

	sprite->setUserData(body);
}

void GameScene::onCollision(cpArbiter* arb, cpSpace* space, void* data)
{
	score += 10;
	stringstream ss;
	ss << "Score: " << score;
	scoreLabel->setString(ss.str());
	CocosDenshion::SimpleAudioEngine::getInstance()->playEffect("Wall.mp3");
}

void GameScene::touchHandler(const string& type, const vector<cocos2d::Touch*>& touches, cocos2d::Event* event)
{
	if (type == "began")
	{
		auto& winSize = cocos2d::Director::getInstance()->getWinSize();
		CocosDenshion::SimpleAudioEngine::getInstance()->playEffect("Intro.mp3");
		static_cast<cpBody*>(ball->getUserData())->v = cpv(
			touches[0]->getLocation().x < winSize.width * 0.5f ? -ballSpeed : ballSpeed,
			ballSpeed
		);
	}
}


