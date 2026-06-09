package com.cognivisiontestapp.ar

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class ArMeasureViewManager : SimpleViewManager<ArMeasureView>() {

    override fun getName() = "ArMeasureView"

    override fun createViewInstance(ctx: ThemedReactContext) = ArMeasureView(ctx)

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> =
        mutableMapOf(
            "onStarted"       to mapOf("registrationName" to "onStarted"),
            "onTrackingState" to mapOf("registrationName" to "onTrackingState"),
            "onPointAdded"    to mapOf("registrationName" to "onPointAdded"),
            "onMeasured"      to mapOf("registrationName" to "onMeasured"),
            "onResult"        to mapOf("registrationName" to "onResult"),
            "onError"         to mapOf("registrationName" to "onError"),
        )

    override fun getCommandsMap(): MutableMap<String, Int> =
        mutableMapOf("reset" to 1, "undo" to 2, "clear" to 3)

    override fun receiveCommand(view: ArMeasureView, commandId: String?, args: ReadableArray?) {
        when (commandId) {
            "reset", "1" -> view.resetMeasurement()
            "undo", "2"  -> view.undoLastPoint()
            "clear", "3" -> view.clearAll()
        }
    }

    @ReactProp(name = "planeOrientation")
    fun setPlaneOrientation(view: ArMeasureView, value: String?) {
        // Implementation if needed
    }
}
