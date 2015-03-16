///
/// > Created using [RapidGame](https://github.com/natweiss/rapidgame). See the `LICENSE` file for the license governing this code.
///

#include "Game.h"

float _pixelScale = 1.0f;
Rect _contentRect(0,0,1024,768);

float Game::getPixelScale()
{
	return _pixelScale;
}

void Game::setPixelScale(float scale)
{
	_pixelScale = scale;
}

Vec2 Game::centralize(const Vec2& p)
{
	return Game::centralize(p.x, p.y);
}

Vec2 Game::centralize(float x, float y)
{
	auto winSize = Director::getInstance()->getWinSize();
	return Vec2(winSize.width * 0.5f + x * _pixelScale, winSize.height * 0.5f + y * _pixelScale);
}

const Rect& Game::getContentRect()
{
	return _contentRect;
}

void Game::setContentRect(const Rect& rect)
{
	_contentRect = rect;
}


