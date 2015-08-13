///
/// > Created using [RapidGame](https://github.com/natweiss/rapidgame). See the `LICENSE` file for the license governing this code.
///

#include "MyGame.h"

float _pixelScale = 1.0f;
cocos2d::Rect _contentRect(0,0,1024,768);

float MyGame::getPixelScale()
{
	return _pixelScale;
}

void MyGame::setPixelScale(float scale)
{
	_pixelScale = scale;
}

cocos2d::Vec2 MyGame::centralize(const cocos2d::Vec2& p)
{
	return MyGame::centralize(p.x, p.y);
}

cocos2d::Vec2 MyGame::centralize(float x, float y)
{
	auto winSize = cocos2d::Director::getInstance()->getWinSize();
	return cocos2d::Vec2(winSize.width * 0.5f + x * _pixelScale, winSize.height * 0.5f + y * _pixelScale);
}

const cocos2d::Rect& MyGame::getContentRect()
{
	return _contentRect;
}

void MyGame::setContentRect(const cocos2d::Rect& rect)
{
	_contentRect = rect;
}


