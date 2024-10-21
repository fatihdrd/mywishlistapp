package com.wishlistnativeweb

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView
class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "wishlistNativeWeb"

      override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent) {
        val action = intent.action
        val type = intent.type

        if (Intent.ACTION_SEND == action && type != null) {
            when {
                "text/plain" == type -> {
                    val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
                    sendDataToReactNative("text", sharedText)
                }
                type.startsWith("image/") -> {
                    val imageUri = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
                    sendDataToReactNative("image", imageUri.toString())
                }
            }
        }
    }

    // Veriyi React Native tarafına gönderiyoruz
    private fun sendDataToReactNative(key: String, value: String?) {
        val initialProps: WritableMap = Arguments.createMap()
        initialProps.putString(key, value)

        // ShareScreen'e başlangıç verisini gönderiyoruz
        this.reactInstanceManager.currentReactContext?.let {
            it.getJSModule(com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onShareReceived", initialProps)
        }
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
