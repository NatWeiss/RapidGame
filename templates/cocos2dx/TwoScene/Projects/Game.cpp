///
/// > Created using [RapidGame](https://github.com/natweiss/rapidgame). See the `LICENSE` file for the license governing this code.
///

#include "Game.h"

float _pixelScale = 1.0f;
cocos2d::Rect _contentRect(0,0,1024,768);

float Game::getPixelScale()
{
	return _pixelScale;
}

void Game::setPixelScale(float scale)
{
	_pixelScale = scale;
}

cocos2d::Vec2 Game::centralize(const cocos2d::Vec2& p)
{
	return Game::centralize(p.x, p.y);
}

cocos2d::Vec2 Game::centralize(float x, float y)
{
	auto winSize = cocos2d::Director::getInstance()->getWinSize();
	return cocos2d::Vec2(winSize.width * 0.5f + x * _pixelScale, winSize.height * 0.5f + y * _pixelScale);
}

const cocos2d::Rect& Game::getContentRect()
{
	return _contentRect;
}

void Game::setContentRect(const cocos2d::Rect& rect)
{
	_contentRect = rect;
}


