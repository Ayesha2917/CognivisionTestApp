package com.cognivisiontestapp.ar

import android.view.MotionEvent
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.uimanager.ThemedReactContext
import com.google.ar.core.Anchor
import com.google.ar.core.Config
import com.google.ar.core.Plane
import com.google.ar.core.Pose
import com.google.ar.core.TrackingState
import io.github.sceneview.ar.ARSceneView
import io.github.sceneview.ar.node.AnchorNode
import io.github.sceneview.node.Node
import io.github.sceneview.node.SphereNode
import io.github.sceneview.math.Position
import android.graphics.Color
import kotlin.math.sqrt

class ArMeasureView(private val reactContext: ThemedReactContext) : FrameLayout(reactContext) {

    private val arSceneView = ARSceneView(reactContext)
    private val anchors = mutableListOf<Anchor>()
    private val markerNodes = mutableListOf<Node>()
    private var startedDispatched = false
    private var lastTrackingEmitMs = 0L

    init {
        addView(arSceneView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        configureSession()
        arSceneView.onSessionUpdated = { _, frame -> onFrame(frame.camera.trackingState) }
        wireTapHandler()
        if (!startedDispatched) {
            startedDispatched = true
            dispatchReactEvent("onStarted")
        }
    }

    override fun onDetachedFromWindow() {
        clearAll()
        arSceneView.destroy()
        super.onDetachedFromWindow()
    }

    private fun configureSession() {
        arSceneView.configureSession { session, config ->
            config.planeFindingMode = Config.PlaneFindingMode.HORIZONTAL_AND_VERTICAL
            config.depthMode =
                if (session.isDepthModeSupported(Config.DepthMode.AUTOMATIC)) Config.DepthMode.AUTOMATIC
                else Config.DepthMode.DISABLED
            config.lightEstimationMode = Config.LightEstimationMode.ENVIRONMENTAL_HDR
        }
    }

    private fun onFrame(state: TrackingState) {
        val now = System.currentTimeMillis()
        if (now - lastTrackingEmitMs < 200) return
        lastTrackingEmitMs = now
        dispatchReactEvent("onTrackingState", Arguments.createMap().apply {
            putString("state", state.name)
        })
    }

    private fun wireTapHandler() {
        arSceneView.setOnTouchListener { _, event ->
            if (event.action == MotionEvent.ACTION_UP) handleTap(event.x, event.y)
            true
        }
    }

    private fun handleTap(xPx: Float, yPx: Float) {
        val frame = arSceneView.frame ?: return
        if (frame.camera.trackingState != TrackingState.TRACKING) {
            dispatchReactEvent("onError", error("AR_NOT_TRACKING")); return
        }
        val hit = frame.hitTest(xPx, yPx).firstOrNull {
            it.trackable is Plane && (it.trackable as Plane).isPoseInPolygon(it.hitPose)
        }
        val anchor = hit?.createAnchor()
        if (anchor == null) { dispatchReactEvent("onError", error("HIT_TEST_FAILED")); return }
        addPoint(anchor)
    }

    private fun addPoint(anchor: Anchor) {
        anchors.add(anchor)
        
        val anchorNode = AnchorNode(arSceneView.engine, anchor)
        val sphereNode = SphereNode(
            engine = arSceneView.engine,
            radius = 0.02f,
            materialInstance = arSceneView.materialLoader.createColorInstance(Color.PURPLE)
        )
        anchorNode.addChildNode(sphereNode)
        arSceneView.addChildNode(anchorNode)
        markerNodes.add(anchorNode)

        dispatchReactEvent("onPointAdded", Arguments.createMap().apply {
            putInt("index", anchors.size - 1)
            putMap("world", anchor.pose.toMap())
        })
        
        if (anchors.size >= 2) {
            measureBetween(anchors[anchors.size - 2], anchors.last())
        }
    }

    private fun measureBetween(a: Anchor, b: Anchor) {
        val meters = distance(a.pose, b.pose)
        dispatchReactEvent("onMeasured", Arguments.createMap().apply {
            putDouble("distanceMeters", meters.toDouble())
            putString("distanceText", formatDistance(meters))
        })
    }

    fun undoLastPoint() {
        if (anchors.isNotEmpty()) {
            anchors.removeAt(anchors.size - 1).detach()
            markerNodes.removeAt(markerNodes.size - 1).let { arSceneView.removeChildNode(it) }
        }
    }

    fun clearAll() {
        anchors.forEach { it.detach() }; anchors.clear()
        markerNodes.forEach { arSceneView.removeChildNode(it) }; markerNodes.clear()
    }

    fun resetMeasurement() = clearAll()

    private fun distance(a: Pose, b: Pose): Float {
        val dx = b.tx() - a.tx(); val dy = b.ty() - a.ty(); val dz = b.tz() - a.tz()
        return sqrt(dx * dx + dy * dy + dz * dz)
    }

    private fun formatDistance(m: Float): String =
        if (m < 1f) String.format("%.1f cm", m * 100) else String.format("%.2f m", m)

    private fun Pose.toMap() = Arguments.createMap().apply {
        putDouble("x", tx().toDouble()); putDouble("y", ty().toDouble()); putDouble("z", tz().toDouble())
    }

    private fun error(code: String) = Arguments.createMap().apply { putString("code", code) }
}
