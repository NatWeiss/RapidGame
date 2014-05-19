//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

public var ball : GameObject;
public var dieSound : AudioClip;
public var blockSound : AudioClip;
public var wallSound : AudioClip;
public var paddleSound : AudioClip;
public var particles : ParticleSystem;

function Update() {
	// Lose a life
	if (transform.position.y < -100) {
		Game.lives--;
		audio.PlayOneShot(dieSound, 0.33);
		
		// Move ball back to paddle
		var paddle = GameObject.FindGameObjectWithTag("paddle");
		var paddleScript = GameObject.FindGameObjectWithTag("paddle").GetComponent(Paddle);
		transform.position.y = paddle.transform.position.y + 5.5;
		transform.position.x = paddle.transform.position.x;
		ball.rigidbody.Sleep();
		paddleScript.attachedBall = this.gameObject;
	}

	// Go back to menu	
	if (Game.lives <= 0 || GameObject.FindGameObjectsWithTag("block").Length <= 0) {
		Application.LoadLevel("Menu");
	}
}

function OnCollisionEnter(col:Collision){
	if (col.gameObject.tag == "block") {
		// Create particle system
		var ps:ParticleSystem = Instantiate(
			particles,
			col.gameObject.transform.position,
			Quaternion.identity
		) as ParticleSystem;

		// Make sure particles will be destroyed
		Destroy(
			ps.gameObject,
			ps.startLifetime
		);
		
		audio.PlayOneShot(blockSound, 0.5);
		Game.score += 10;
		Destroy(col.gameObject);
	}
	
	if (col.gameObject.tag == "wall") {
		audio.PlayOneShot(wallSound, 0.5);
	}

	if (col.gameObject.tag == "paddle") {
		audio.PlayOneShot(paddleSound, 0.5);
	}
}
