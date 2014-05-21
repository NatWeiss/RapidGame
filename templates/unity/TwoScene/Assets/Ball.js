//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

public var ball : GameObject;
public var wallSound : AudioClip;
public var jumpSound : AudioClip;

function Update() {
	if (Input.GetMouseButtonDown(0) || Input.GetMouseButtonDown(1)
	|| Input.GetMouseButtonDown(2) || Input.GetButtonDown("Jump")){
		ball.rigidbody.velocity = Vector3(
			(Input.mousePosition.x < Screen.width * .5 ? -1 : 1) * 250,
			ball.rigidbody.velocity.y < 200 ? 200 : 0,
			0);
		audio.PlayOneShot(jumpSound, 1.0);
	}
}

function OnCollisionEnter(col:Collision){
	var vel = Mathf.Abs(ball.rigidbody.velocity.x) + Mathf.Abs(ball.rigidbody.velocity.y);
	vel = Mathf.Clamp01(vel / 250);
	if (col.gameObject.tag == "wall") {
		audio.PlayOneShot(wallSound, vel);
		Game.score += 10;
	}
}
