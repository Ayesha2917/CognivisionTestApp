package com.cognivisiontestapp.ar

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class ArMeasurePackage : ReactPackage {
    override fun createViewManagers(ctx: ReactApplicationContext): List<ViewManager<*, *>> =
        listOf(ArMeasureViewManager())
    override fun createNativeModules(ctx: ReactApplicationContext): List<NativeModule> =
        emptyList()
}
