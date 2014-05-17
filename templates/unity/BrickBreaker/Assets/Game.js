//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//
﻿
static var score : int = 0;
static var lives : int = 3;

public var guiSkin : GUISkin;
public var music : AudioClip;
public var block : GameObject;
public var xBlocks : int = 11;
public var yBlocks : int = 2;

function Start() {
	// Create blocks
	createBlocks();
	
	// Play music
	audio.loop = true;
	audio.clip = music;
	audio.Play();
}

function OnGUI() {
	// Show score and lives
	GUI.color = Color(.5, .5, .5, 1);
	GUI.skin = guiSkin;
	GUI.Label(Rect(40, 20, 100, 50), "Score: " + score);

	GUI.color = Color(.5, .5, .5, 1);
	GUI.skin = guiSkin;
	GUI.Label(Rect(Screen.width - 95, 20, 100, 50), "Lives: " + lives);
}

function createBlocks(){
	for (var y = 0; y < yBlocks; y++){
		for (var x = 0; x < xBlocks; x++){
			Instantiate(block, Vector3(-5*21 + x*21, 10 + y*10, 0), Quaternion.identity);
		}
	}
}
