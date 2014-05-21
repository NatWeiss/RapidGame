--
--  Created using [RapidGame](http://wizardfu.com/rapidgame).
--  See the `LICENSE` file for the license governing this code.
--  Developed by Nat Weiss.
--

require ("physics")

local gameName = "TwoScene"
local playMusic = true
local debugPhysics = false
local gravity = 20
local ballSpeed = 750
local wallAlpha = 0
local wallThickness = 20
local fontName = native.systemFont
local music = audio.loadStream("Song.mp3");
local introSound = audio.loadSound("Intro.mp3");
local wallSound = audio.loadSound("Wall.mp3");

local score = 0
local menuScene = nil
local gameScene = nil
local ball = nil
local scoreLabel = nil

function clamped( value, lowest, highest )
	return math.max( lowest, math.min( highest, value ) )
end

function getBodyShape(obj)
	local w = obj.contentWidth * obj.xScale
	local h = obj.contentHeight * obj.yScale
	return { -w,-h, -w,h, w,h, w,-h }
end

function main ()
	display.setStatusBar(display.HiddenStatusBar);
	getFontName("Dolce")
	setUpPhysics()
	createBackground()
	createMenuScene()
end

function getFontName(startsWith)
	local fonts = native.getFontNames()
	startsWith = string.lower( startsWith )
	for i, name in ipairs(fonts) do
	    j, k = string.find( string.lower(name), startsWith )
	    if j ~= nil  then
	        fontName = tostring( name )
	        print( "Font = " .. fontName )
	        break
	    end
	end
end

function setUpPhysics()
	physics.start()
	physics.setGravity( 0, gravity )
	if debugPhysics then
		physics.setDrawMode("hybrid")
	end
end

function createBackground()
	local w = display.contentWidth
	local h = display.contentHeight

	-- Stretched big background
	local bg = display.newRect( w * .5, h * .5, w * 2, h * 2)
	bg:setFillColor( 208/255, 204/255, 202/255 )

	-- Actual background
	bg = display.newRect( w * .5, h * .5, w, h)
	bg:setFillColor( 218/255, 214/255, 212/255 )
end

function createMenuScene()
	if gameScene ~= nil then
		gameScene:removeSelf()
		gameScene = nil
		ball = nil
		scoreLabel = nil
		Runtime:removeEventListener("touch", touchListener)
	end
	menuScene = display.newGroup()
	audio.stop()

	-- Play sound
	local logoText = gameName
	audio.play(introSound)

	-- Logo
	local yOffset = -100
	local logo = display.newImage( "Logo.png" )
	logo.x = display.contentWidth * .5
	logo.y = display.contentHeight * .5 + yOffset
	logo:scale(.5,.5)
	menuScene:insert( logo )
	local tweenY = 12
	local tweenDuration = 2000
	local tweenLogo
	tweenLogo = function()
		transition.to(logo, {time=tweenDuration, delta=true, y=tweenY, transition=easing.inOutQuad})
		transition.to(logo, {time=tweenDuration, delay=tweenDuration, delta=true, y=-tweenY, onComplete=tweenLogo, transition=easing.inOutQuad})
	end
	logo.y = logo.y - (tweenY * .5)
	tweenLogo()

	-- Logo label
	local label = display.newText( logoText, logo.x, logo.y, fontName, 110 )
	label:setFillColor( .5, .5, .5 )
	menuScene:insert( label )

	-- Buttons
	local fillValue = .65
	yOffset = 200
	local playLabel = display.newText( "Play", display.contentWidth * .5, display.contentHeight * .5 + yOffset, fontName, 60 )
	playLabel:setFillColor( fillValue, fillValue, fillValue )
	playLabel:addEventListener("tap", function ()
		playLabel:setFillColor( 1, .5, .5 )
		transition.to(playLabel, {time=200, xScale=1.2, yScale=1.2})
		transition.to(playLabel, {time=200, delay=200, xScale=1, yScale=1})
		transition.to(menuScene, {time=500, alpha=0, onComplete=createGameScene})
	end)
	menuScene:insert( playLabel )
end

function createGameScene()
	if menuScene ~= nil then
		menuScene:removeSelf()
		menuScene = nil
	end
	gameScene = display.newGroup()

	score = 0

	createWalls()
	createBall()
	createLabels()
	if playMusic then
		audio.play(music, {loops =- 1});
	end

	local label = display.newText( "Game Scene", display.contentWidth * .5, display.contentHeight * .5 - 100, fontName, 110 )
	label:setFillColor( .5, .5, .5 )
	gameScene:insert( label )
	transition.to(label, {time=5000, alpha=0})
end

function createWalls()
	local w = display.contentWidth
	local h = display.contentHeight
	local bounce = 0.2

	-- Left wall
	local wall = display.newRect(wallThickness * .5, h * .5, wallThickness, h)
	wall.alpha = wallAlpha
	wall.type = "wall"
	physics.addBody(wall, "static", {friction=0, bounce = bounce})
	gameScene:insert(wall)

	-- Top wall
	wall = display.newRect(w * .5, wallThickness * .5, w * 2, wallThickness)
	wall.alpha = wallAlpha
	wall.type = "wall"
	physics.addBody(wall, "static", {friction=0, bounce = bounce})
	gameScene:insert(wall)

	-- Right wall
	wall = display.newRect(w - wallThickness * .5, h * .5, wallThickness, h * 2)
	wall.alpha = wallAlpha
	wall.type = "wall"
	physics.addBody(wall, "static", {friction=0, bounce = bounce})
	gameScene:insert(wall)

	-- Bottom wall
	wall = display.newRect(w * .5, h + wallThickness * .5, w * 2, wallThickness)
	wall.alpha = wallAlpha
	wall.type = "wall"
	physics.addBody(wall, "static", {friction=0, bounce = bounce})
	gameScene:insert(wall)
end

function touchListener(event)
	if event.phase == "began" then
		if ball then
			local xVel = ballSpeed
			if event.x < display.contentWidth * .5 then
				xVel = -xVel
			end
			ball:setLinearVelocity(xVel, -ballSpeed)
			audio.play(introSound)
		end
	end
end

function createBall()
	local ballRadius = 10

	ball = display.newImage('Ball.png')
	ball.x = display.contentWidth * .5
	ball.y = display.contentHeight * .5
	ball:scale(.5,.5)
	physics.addBody(ball, "dynamic", {density = 2, friction = .5, bounce = .8, radius = ballRadius})
	gameScene:insert( ball )

	ball.collision = function(self, event)
		if(event.phase == "ended") then
			-- Bounce off wall
			if event.other.type == "wall" then
				audio.play(wallSound)
				score = score + 10
				scoreLabel.text = "Score: "..score
			end
		end
	end

	ball:addEventListener("collision", ball)
	Runtime:addEventListener("touch", touchListener)
end

function createLabels()
	local paddingX = 70
	local paddingY = 40
	local fontSize = 20

	scoreLabel = display.newText( "Score: "..score, paddingX, paddingY, fontName, fontSize )
	scoreLabel:setFillColor( .5, .5, .5 )
	gameScene:insert( scoreLabel )
end

main()
