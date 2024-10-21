package com.wishlistnativeweb;

import android.app.Activity;
import android.content.Intent;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

public class ShareModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "ShareModule";
    private Activity mActivity;

    public ShareModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mActivity = getCurrentActivity();
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void getSharedData(Promise promise) {
        if (mActivity != null) {
            Intent intent = mActivity.getIntent();
            String action = intent.getAction();
            String type = intent.getType();

            WritableMap map = Arguments.createMap();

            if (Intent.ACTION_SEND.equals(action) && type != null) {
                if ("text/plain".equals(type)) {
                    String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
                    if (sharedText != null) {
                        map.putString("sharedText", sharedText);
                    }
                } else if (type.startsWith("image/")) {
                    String imageUri = intent.getParcelableExtra(Intent.EXTRA_STREAM).toString();
                    map.putString("sharedImage", imageUri);
                }
            }

            promise.resolve(map);
        } else {
            promise.reject("Activity is null");
        }
    }
}
