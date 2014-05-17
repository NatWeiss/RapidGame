--
--  Created using [RapidGame](http://wizardfu.com/rapidgame).
--  See the `LICENSE` file for the license governing this code.
--  Developed by Nat Weiss.
--

require ("physics")

local gameName = "BrickBreaker"
local playMusic = true
local debugPhysics = false
local ballSpeed = 750
local ballPadding = 8
local maxBallAngle = 75
local paddleSpeed = 0.75
local minPaddleMovement = 12
local wallAlpha = 0
local wallThickness = 20
local brickPadding = 8
local numOfRows = 4
local numOfCols = 11
local fontName = native.systemFont
local music = audio.loadStream("Song.mp3");
local introSound = audio.loadSound("Intro.mp3");
local winSound = audio.loadSound("Win.mp3");
local loseSound = audio.loadSound("Lose.mp3");
local paddleSound = audio.loadSound("Paddle.mp3");
local brickSound = audio.loadSound("Brick.mp3");
local wallSound = audio.loadSound("Wall.mp3");
local dieSound = audio.loadSound("Die.mp3");

local lives = 3
local score = 0
local brickCount = 0
local menuScene = nil
local gameScene = nil
local ball = nil
local paddle = nil
local scoreLabel = nil
local livesLabel = nil
local touchX = 0
local isHeld = false

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
	physics.setGravity( 0, 0 )
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
		paddle = nil
		ball = nil
		livesLabel = nil
		scoreLabel = nil
		Runtime:removeEventListener("touch", touchListener)
	end
	menuScene = display.newGroup()
	audio.stop()

	-- Play sound
	local logoText = gameName
	if lives == 3 and score == 0 then
		audio.play(introSound)
	elseif lives > 0 then
		audio.play(winSound)
		logoText = "You Won!"
	else
		audio.play(loseSound)
		logoText = "Game Over"
	end

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
	local xOffset = 150
	local playLabel = display.newText( "Play", display.contentWidth * .5 - xOffset, display.contentHeight * .5 + yOffset, fontName, 60 )
	playLabel:setFillColor( fillValue, fillValue, fillValue )
	playLabel:addEventListener("tap", function ()
		playLabel:setFillColor( 1, .5, .5 )
		transition.to(playLabel, {time=200, xScale=1.2, yScale=1.2})
		transition.to(playLabel, {time=200, delay=200, xScale=1, yScale=1})
		transition.to(menuScene, {time=500, alpha=0, onComplete=createGameScene})
	end)
	menuScene:insert( playLabel )

	local exitLabel = display.newText( "Exit", display.contentWidth * .5 + xOffset, display.contentHeight * .5 + yOffset, fontName, 60 )
	exitLabel:setFillColor( fillValue, fillValue, fillValue )
	menuScene:insert( exitLabel )
	exitLabel:addEventListener("tap", function ()
		exitLabel:setFillColor( 1, .5, .5 )
		timer.performWithDelay(400, function() exitLabel:setFillColor(fillValue, fillValue, fillValue) end, 1)
		transition.to(exitLabel, {time=200, xScale=1.2, yScale=1.2})
		transition.to(exitLabel, {time=200, delay=200, xScale=1, yScale=1})
		native.requestExit( )
	end)
end

function createGameScene()
	if menuScene ~= nil then
		menuScene:removeSelf()
		menuScene = nil
	end
	gameScene = display.newGroup()

	score = 0
	lives = 3

	createWalls()
	createBricks()
	createPaddle()
	createBall()
	createLabels()
	if playMusic then
		audio.play(music, {loops =- 1});
	end
end

function createWalls()
	local w = display.contentWidth
	local h = display.contentHeight

	-- Left wall
	local wall = display.newRect(wallThickness * .5, h * .5, wallThickness, h)
	wall.alpha = wallAlpha
	wall.type = "wall"
	physics.addBody(wall, "static", {friction=0, bounce = 1})
	gameScene:insert(wall)

	-- Top wall
	wall = display.newRect(w * .5, wallThickness * .5, w * 2, wallThickness)
	wall.alpha = wallAlpha
	wall.type = "wall"
	physics.addBody(wall, "static", {friction=0, bounce = 1})
	gameScene:insert(wall)

	-- Right wall
	wall = display.newRect(w - wallThickness * .5, h * .5, wallThickness, h * 2)
	wall.alpha = wallAlpha
	wall.type = "wall"
	physics.addBody(wall, "static", {friction=0, bounce = 1})
	gameScene:insert(wall)

	-- Bottom wall
	wall = display.newRect(w * .5, h + wallThickness * .5, w * 2, wallThickness)
	wall.alpha = wallAlpha
	wall.type = "bottomWall"
	physics.addBody(wall, "static", {friction=0, bounce = 1})
	gameScene:insert(wall)
end

function createBricks()
	local brick = display.newImage("Brick.png")
	local w = brick.contentWidth * .5 + brickPadding
	local h = brick.contentHeight * .5 + brickPadding
	local bottomLeft = {x = display.contentWidth * .5 - (w * numOfCols) * .5 + w * .5, y = display.contentHeight * .5 - 10}
	display.remove(brick)

	brickCount = 0
	for row = 0, numOfRows - 1 do
		for col = 0, numOfCols - 1 do
			local brick = display.newImage( "Brick.png" )
			brick.x = bottomLeft.x + (col * w)
			brick.y = bottomLeft.y - (row * h)
			brick:scale(.5,.5)
			brick.type = "destructible"
			physics.addBody(brick, "static", {friction=0, bounce=1, shape=getBodyShape(brick)})
			gameScene:insert( brick )
			brickCount = brickCount + 1
		end
	end
end

function createPaddle()
	paddle = display.newImage( "Paddle.png" )
	paddle.x = display.contentWidth * .5
	paddle.y = display.contentHeight - 50
	paddle:scale(.5,.5)
	paddle.type = "paddle"
	physics.addBody(paddle, "static", {friction=0, bounce=1, shape=getBodyShape(paddle)})
	gameScene:insert( paddle )

	Runtime:addEventListener("touch", touchListener)
end

function touchListener(event)
	isHeld = event.phase ~= "ended" and event.phase ~= "cancelled"
	touchX = event.x

	local moveBall = function(doLaunch)
		if ball ~= nil then
			local vx, vy = ball:getLinearVelocity()
			if vx == 0 and vy == 0 then
				-- Move ball with paddle
				ball.x = paddle.x
				ball.y = paddle.y - paddle.contentHeight - ballPadding
				
				-- Launch the ball
				if doLaunch then
					ball:setLinearVelocity(0, -ballSpeed)
				end
			end
		end
	end

	local tPrevious = system.getTimer()
	local movePaddle
	movePaddle = function(e)
		if isHeld and paddle ~= nil then
			local tDelta = e.time - tPrevious
			tPrevious = e.time

			local direction = 1
			if math.abs(touchX - paddle.x) < minPaddleMovement then
				direction = 0
			elseif touchX < paddle.x then
				direction = -1
			end

			paddle.x = paddle.x + (direction * tDelta * paddleSpeed)
			paddle.x = clamped(
				paddle.x,
				wallThickness + paddle.contentWidth * .5,
				display.contentWidth - wallThickness - paddle.contentWidth * .5
			)
			moveBall(false)
		else
			Runtime:removeEventListener( "enterFrame", movePaddle )
		end
	end

	if event.phase == "began" then
		Runtime:addEventListener( "enterFrame", movePaddle )
	elseif event.phase == "ended" then
		moveBall(true)
	end
end

function createBall()
	local ballRadius = 10

	ball = display.newImage('Ball.png')
	ball.x = paddle.x
	ball.y = paddle.y - paddle.contentHeight - ballPadding
	ball:scale(.5,.5)
	physics.addBody(ball, "dynamic", {friction=0, bounce = 1, radius=ballRadius})
	gameScene:insert( ball )

	ball.collision = function(self, event)
		if(event.phase == "ended") then
			-- Destroy a brick
			if event.other.type == "destructible" then
				audio.play(brickSound);
				event.other:removeSelf()
				createBrickExplosion(event.other.x, event.other.y)

				score = score + 10
				scoreLabel.text = "Score: "..score

				brickCount = brickCount - 1
				if brickCount <= 0 then
					createMenuScene()
					return
				end
			end

			-- Bounce off paddle
			if event.other.type == "paddle" then
				audio.play(paddleSound)

				local angle = ball.x - paddle.x
				angle = clamped(angle, -maxBallAngle, maxBallAngle)
				angle = angle * (math.pi / 180)

				local vx = math.sin(angle) * ballSpeed
				local vy = -math.abs(math.cos(angle) * ballSpeed)
				ball:setLinearVelocity( vx, vy )
			end

			-- Bounce off wall
			if event.other.type == "wall" then
				audio.play(wallSound)
			end

			-- Lose a life
			if event.other.type == "bottomWall" or ball.y > paddle.y + ballPadding then
				lives = lives - 1
				if lives <= 0 then
					createMenuScene()
					return
				end

				audio.play(dieSound)
				livesLabel.text = "Lives: "..lives

				local onTimerComplete = function(event)
					createBall()
				end
				self:removeSelf()
				ball = nil
				timer.performWithDelay(500, onTimerComplete, 1)
			end
		end
	end

	ball:addEventListener("collision", ball)
end

function createLabels()
	local paddingX = 70
	local paddingY = 40
	local fontSize = 20

	scoreLabel = display.newText( "Score: "..score, paddingX, paddingY, fontName, fontSize )
	scoreLabel:setFillColor( .5, .5, .5 )
	gameScene:insert( scoreLabel )

	livesLabel = display.newText( "Lives: "..lives, display.contentWidth - paddingX, paddingY, fontName, fontSize )
	livesLabel:setFillColor( .5, .5, .5 )
	gameScene:insert( livesLabel )
end

function createBrickExplosion(x, y)
	local count = 15
	local xRange = 200
	local yRange = 50
	local xMin, xMax = x-xRange, x+xRange
	local yMin, yMax = y-yRange, y+yRange
	local params = {
		alpha = 0,
		xScale = 0.3,
		yScale = 0.3,
		onComplete = function(target) target:removeSelf(); end
	}
	for i = 1, count do
		local obj = display.newImage( "Particle.png" )
		obj.x = x
		obj.y = y
		params.x = math.random(xMin, xMax)
		params.y = math.random(yMin, yMax)
		params.time = math.random(250, 500)
		transition.to(obj, params)
	end
end

main()
