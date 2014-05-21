//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

static var score : int = 0;
public var guiSkin : GUISkin;
public var titleSkin : GUISkin;
public var music : AudioClip;
public var ball : GameObject;

function Start() {	
	Game.score = 0;

	Instantiate(ball, Vector3(0, 0, 0), Quaternion.identity);
	
	// Play music
	audio.loop = true;
	audio.clip = music;
	audio.Play();
}

function OnGUI() {
	// Show score
	GUI.color = Color(.5, .5, .5, 1);
	GUI.skin = guiSkin;
	GUI.Label(Rect(40, 20, 100, 50), "Score: " + score);

	// Show game scene label
	var fadeTime = 5;
	if (Time.timeSinceLevelLoad < fadeTime) {
		GUI.color = Color(.5, .5, .5, 1.0 - (Time.timeSinceLevelLoad / fadeTime));
		GUI.skin = titleSkin;
		var w = 1000;
		var h = 300;
		var rect = Rect((Screen.width-w)*.5, (Screen.height-h)*.5 - 100, w, h);
		GUI.Label(rect, "Game Scene");
	}

}
