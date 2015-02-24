///
/// > Created using [RapidGame](http://wizardfu.com/rapidgame). See the `LICENSE` file for the license governing this code.
///

#pragma once

#include "AppDelegate.h"

namespace Game
{
	/// Get / set the scale of one pixel.
	float getPixelScale();
	void setPixelScale(float scale);

	/// Get / set the content rect.
	const Rect& getContentRect();
	void setContentRect(const Rect& rect);
	
	/// Centralize and scale the given position.
	Vec2 centralize(const Vec2& position);
	Vec2 centralize(float x, float y);
	
	
};