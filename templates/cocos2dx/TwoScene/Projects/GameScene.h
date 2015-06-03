///
/// > Created using [RapidGame](https://github.com/natweiss/rapidgame). See the `LICENSE` file for the license governing this code.
///

#pragma once

#include "AppDelegate.h"

class GameScene : public cocos2d::Scene
{
	public:
		GameScene();
		virtual ~GameScene();
		virtual void onEnter();
		virtual void onExit();
		virtual void update(float delta);

	private:
		cocos2d::Sprite* ball;
		double accumulator;
		cpSpace* space;
		vector<cpShape*> shapes;
		static int score;
		static cocos2d::Label* scoreLabel;

		void createPhysicsBox(int x1, int y1, int x2, int y2, float elasticity, float friction, int collisionType);
		void createPhysicsSprite(cocos2d::Sprite* sprite, cocos2d::Vec2 pos, float elasticity, float friction, int collisionType);
		static void onCollision(cpArbiter* arb, cpSpace* space, void* data);
		void touchHandler(const string& type, const vector<cocos2d::Touch*>& touches, cocos2d::Event* event);
};


