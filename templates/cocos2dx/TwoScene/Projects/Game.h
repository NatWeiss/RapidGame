///
/// > Created using [RapidGame](https://github.com/natweiss/rapidgame). See the `LICENSE` file for the license governing this code.
///

#pragma once
#include "AppDelegate.h"

namespace Game
{
	/// Get / set the scale of one pixel.
	float getPixelScale();
	void setPixelScale(float scale);

	/// Get / set the content rect.
	const cocos2d::Rect& getContentRect();
	void setContentRect(const cocos2d::Rect& rect);
	
	/// Centralize and scale the given position.
	cocos2d::Vec2 centralize(const cocos2d::Vec2& position);
	cocos2d::Vec2 centralize(float x, float y);
};