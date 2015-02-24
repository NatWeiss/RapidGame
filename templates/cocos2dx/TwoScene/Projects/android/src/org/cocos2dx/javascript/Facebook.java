//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//
package org.cocos2dx.javascript;

import java.util.Arrays;
import java.util.Map;
import java.util.HashMap;

import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import android.app.Activity;
import android.content.Intent;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.Log;

import com.facebook.Request;
import com.facebook.Response;
import com.facebook.Session;
import com.facebook.SessionState;
import com.facebook.UiLifecycleHelper;
import com.facebook.model.GraphUser;
import com.facebook.model.GraphObject;
import com.facebook.FacebookRequestError;
import com.facebook.HttpMethod;
import com.facebook.widget.WebDialog;
import com.facebook.widget.WebDialog.OnCompleteListener;
import com.facebook.FacebookException;
import com.facebook.FacebookOperationCanceledException;
	
public class Facebook {
	private static final String TAG = "FacebookJava: ";
	private static Facebook instance;
	private UiLifecycleHelper uiHelper;
	private Session.StatusCallback statusCallback = new SessionStatusCallback();
	private Activity activity;
	private Context context;
	private Handler handler;

	private boolean debug;
	private boolean loggedIn;
	private boolean canvasMode;
	private String userId;
	private Map<String,String> devInfo;
	private Map<String,String> playerNames;
	private Map<String,String> playerFirstNames;
	private Map<String,String> playerImageUrls;
	private String[] friendIds;

	public Facebook(Activity activity, Context context) {
		this.activity = activity;
		this.context = context;
		instance = this;
		uiHelper = new UiLifecycleHelper(activity, statusCallback);
		devInfo = new HashMap<String,String>();
		playerNames = new HashMap<String,String>();
		playerFirstNames = new HashMap<String,String>();
		playerImageUrls = new HashMap<String,String>();
		clearModule();
		handler = new Handler() {
			@Override
			public void handleMessage(Message msg) {
				super.handleMessage(msg);
				switch (msg.what) {
					case 1:
						_showUI("");
					break;
					default:
					break;
				}
			}
		};
	}
	
	private void clearModule() {
		debug = false;
		loggedIn = false;
		canvasMode = false;
		userId = "";
		devInfo.clear();
		playerNames.clear();
		playerFirstNames.clear();
		playerImageUrls.clear();
		friendIds = new String[1];
	}

	public static native void nativeCallRunningLayer(String method, String param1);
	public static native void nativeOnGetImageUrl(String id, String url);
	
	public static void init() {
		Session session = Session.openActiveSessionFromCache(instance.context);
		instance.log("Init Android SDK, App ID " + (session != null ? session.getApplicationId() : ""));
	}

	public static void login(String scope) {
		Session session = Session.getActiveSession();
		if (session != null && !session.isOpened() && !session.isClosed()) {
			session.openForRead(
				new Session.OpenRequest(instance.activity)
					.setPermissions(Arrays.asList("basic_info"))
					.setCallback(instance.statusCallback)
			);
		} else {
			Session.openActiveSession(instance.activity, true, instance.statusCallback);
		}
	}

	private class SessionStatusCallback implements Session.StatusCallback {
		@Override
		public void call(Session session, SessionState state, Exception exception) {
			onSessionStateChange(session, state, exception);
		}
	}	

	private void onSessionStateChange(Session session, SessionState state, Exception exception) {
		if (state.isOpened()) {
			log("User is authorized, token: " + session.getAccessToken().substring(0,4) + "...");
			loggedIn = true;
			
			Request.executeMeRequestAsync(session, new Request.GraphUserCallback() {
				@Override
				public void onCompleted(GraphUser user, Response response) {
					if (user != null) {
						userId = user.getId();
						playerNames.put("me", user.getName());
						playerFirstNames.put("me", user.getFirstName());
						//deleteRequests();
						nativeCallRunningLayer("onGetMyPlayerName", user.getFirstName());
					}
				}
			});
			
			loadPlayerImageUrl("me");
			
			loadFriends();
			
		} else if (state.isClosed()) {
			log("Logged out");
			loggedIn = false;
		}
		nativeCallRunningLayer("onGetLoginStatus", loggedIn ? "true" : "false");
	}

	public static boolean isLoggedIn() {
		return instance.loggedIn;
	}

	public static void logout() {
		Session session = Session.getActiveSession();
		if (session != null && !session.isClosed()) {
			session.closeAndClearTokenInformation();
		}
	}
	
	public static void setDebugMode(String enabled) {
		instance.debug = enabled.equals("true");
		instance.log("Set debug mode to " + instance.debug);
	}
	
	private void log(String s) {
		if (debug) {
			Log.i("cocos2dx-plugin", TAG + s);
		}
	}
	
	private void loadPlayerImageUrl(final String id) {
		Session session = Session.getActiveSession();
		if (session == null) {
			return;
		}
		log("Loading player image url for " + id);

		String path = id + "/picture";
		Bundle params = new Bundle();
		params.putString("redirect", "0");
		params.putString("width", "100");
		params.putString("height", "100");

		Request request = new Request(session, path, params, HttpMethod.GET, new Request.Callback() {
			public void onCompleted(Response response) {
				if(response.getError() != null){
					log(response.getError().getErrorMessage());
					return;
				}

				GraphObject graphObject = response.getGraphObject();
				if (graphObject == null || graphObject.getProperty("data") == null ) {
					log("Improper graph object");
					return;
				}

				try {
					String url = "";
					JSONObject jsonObject = graphObject.getInnerJSONObject();
					JSONObject dataObject = jsonObject.getJSONObject("data");
					url = dataObject.getString("url");
					log("Got image url " + url + " for " + id);
					playerImageUrls.put(id, url);
					nativeOnGetImageUrl(id, url);
				} catch (JSONException e) {
					log("Error parsing image URL request");
					e.printStackTrace();
				}
			}
		});
		request.executeAsync();		
	}

	private void loadFriends() {
		Session session = Session.getActiveSession();
		if (session == null) {
			return;
		}
		
		String path = "me/friends";
		Bundle params = new Bundle();
		params.putString("fields", "id,name,first_name");

		Request request = new Request(session, path, params, HttpMethod.GET, new Request.Callback() {
			public void onCompleted(Response response) {
				if(response.getError() != null){
					log(response.getError().getErrorMessage());
					return;
				}

				GraphObject graphObject = response.getGraphObject();
				if (graphObject == null || graphObject.getProperty("data") == null ) {
					log("Improper graph object");
					return;
				}

				try {
					JSONObject jsonObject = graphObject.getInnerJSONObject();
					JSONArray array = jsonObject.getJSONArray("data");
					if (array.length() > 0) {
						friendIds = new String[array.length()];
					}
					
					int actualCount = 0;
					for (int i = 0; i < array.length(); i++) {
						JSONObject object = (JSONObject)array.get(i);
						//log("friend id = " + object.getString("id"));
						String id = object.getString("id");
						if (id.length() > 0) {
							friendIds[i] = id;
							playerNames.put(id, object.getString("name"));
							playerFirstNames.put(id, object.getString("first_name"));
							actualCount++;
						}
					}
					
					log("Parsed " + actualCount + " friends");
				} catch (JSONException e) {
					log("Error parsing image URL request");
					e.printStackTrace();
				}
			}
		});
		request.executeAsync();		
	}
	
	public static void requestPublishPermissions(String perms) {
		instance.log("Would request publish permissions: " + perms);
	}
	
	public static String getPlayerName(String id) {
		instance.log("Getting player name for " + id);
		instance.log("Returning " + instance.playerNames.get(id));
		return instance.playerNames.get(id);
	}

	public static String getPlayerFirstName(String id) {
		return instance.playerFirstNames.get(id);
	}

	public static String getPlayerImageUrl(String id) {
		instance.log("Get player image url for " + id);
		if (instance.playerImageUrls.containsKey(id)) {
			instance.log("Immediately returning url " + instance.playerImageUrls.get(id));
			return instance.playerImageUrls.get(id);
		}

		// this is causing a weird JNI crash
//		if (!id.equals("me")) {
//			instance.loadPlayerImageUrl(id);
//		}
		return "";
	}

	public static String getRandomFriendId(String unused) {
		int size = instance.friendIds.length;
		if (size > 0) {
			return instance.friendIds[(int)(Math.random() * size)];
		}
		return "";
	}
	
	public static void showUI(String info) {
		Message message = Message.obtain();
		message.what = 1;
		instance.handler.sendMessage(message);
	}
	
	public void _showUI(String info) {
		Bundle params = new Bundle();
		params.putString("message", "Learn how to make your Android apps social");

		WebDialog requestsDialog = (new WebDialog.RequestsDialogBuilder(activity, Session.getActiveSession(), params))
			.setOnCompleteListener(new OnCompleteListener() {
				@Override
				public void onComplete(Bundle values, FacebookException error) {
					String ret = "";
					if (error != null) {
						if (error instanceof FacebookOperationCanceledException) {
							log("Request cancelled");
						} else {
							log("Network error");
						}
					} else {
						final String requestId = values.getString("request");
						if (requestId != null) {
							log("Request sent, id " + requestId);
						} else {
							log("Request cancelled");
						}
					}
					//nativeCallRunningLayer("onSocialUIResponse", ret);
				}
			})
			.build();
		requestsDialog.show();
	}
	
	public static String getSDKVersion(String unused) {
		instance.log("Would get SDK version");
		return "";
	}
	
	public void onCreate(Bundle savedInstanceState) {
		//uiHelper.onCreate(savedInstanceState);
	}
	
	public void onResume() {
		// For scenarios where the main activity is launched and user
		// session is not null, the session state change notification
		// may not be triggered. Trigger it if it's open/closed.
		Session session = Session.getActiveSession();
		if (session != null && (session.isOpened() || session.isClosed())) {
			onSessionStateChange(session, session.getState(), null);
		}
		uiHelper.onResume();
	}

	public void onPause() {
		uiHelper.onPause();
	}

	public void onActivityResult(int requestCode, int resultCode, Intent data) {
		uiHelper.onActivityResult(requestCode, resultCode, data);
	}

	public void onSaveInstanceState(Bundle outState) {
		uiHelper.onSaveInstanceState(outState);
	}

	public void onDestory() {
		uiHelper.onDestroy();
	}
}
