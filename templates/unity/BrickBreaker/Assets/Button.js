//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

public var quit = false;

function Start() {
	renderer.material.color = Color(0, 0, 0, .25);
}

function OnMouseEnter() {
	if (quit) {
		renderer.material.color = Color(.5, 0, 0, .5);
	} else {
		renderer.material.color = Color(.32, .73, .86, .5);
	}
}

function OnMouseExit() {
	renderer.material.color = Color(0, 0, 0, .25);
}

function OnMouseUp () {
	if (quit == true) {
		Application.Quit();
	} else {
		Game.score = 0;
		Game.lives = 3;
		Application.LoadLevel("Game");
	}
}
