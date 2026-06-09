package com.cognivisiontestapp.ar

import android.view.View
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event

class ArViewerEvent(
    surfaceId: Int,
    viewTag: Int,
    private val name: String,
    private val payload: WritableMap,
) : Event<ArViewerEvent>(surfaceId, viewTag) {
    override fun getEventName() = name
    override fun getEventData() = payload
}

fun View.dispatchReactEvent(eventName: String, payload: WritableMap = Arguments.createMap()) {
    val reactContext = context as? ReactContext ?: return
    val viewTag = id
    if (viewTag == View.NO_ID) return
    val dispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, viewTag) ?: return
    val surfaceId = UIManagerHelper.getSurfaceId(reactContext)
    dispatcher.dispatchEvent(ArViewerEvent(surfaceId, viewTag, eventName, payload))
}
