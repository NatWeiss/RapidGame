///
/// > Created using [RapidGame](http://wizardfu.com/rapidgame). See the `LICENSE` file for the license governing this code.
///

#pragma once

#include "AppDelegate.h"

class GameScene : public Scene
{
	public:
		GameScene();
		virtual ~GameScene();
		virtual void onEnter();
		virtual void onExit();
		virtual void update(float delta);

	private:
		Sprite* ball;
		double accumulator;
		cpSpace* space;
		vector<cpShape*> shapes;
		static int score;
		static Label* scoreLabel;

		void createPhysicsBox(int x1, int y1, int x2, int y2, float elasticity, float friction, int collisionType);
		void createPhysicsSprite(Sprite* sprite, Vec2 pos, float elasticity, float friction, int collisionType);
		static void onCollision(cpArbiter* arb, cpSpace* space, void* data);
		void touchHandler(const string& type, const vector<Touch*>& touches, Event* event);
};


