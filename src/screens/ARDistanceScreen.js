import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  requireNativeComponent,
  UIManager,
  findNodeHandle,
} from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const ArMeasureViewNative = requireNativeComponent('ArMeasureView');

const ArCommands = {
  reset: (ref) => dispatch(ref, 'reset'),
  undo:  (ref) => dispatch(ref, 'undo'),
  clear: (ref) => dispatch(ref, 'clear'),
};

function dispatch(ref, name, args = []) {
  const node = findNodeHandle(ref);
  if (node == null) return;
  UIManager.dispatchViewManagerCommand(node, name, args);
}

const ARDistanceScreen = ({ navigation }) => {
  const arRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [trackingState, setTrackingState] = useState('NOT_INITIALIZED');
  const [pointsCount, setPointsCount] = useState(0);
  const [distanceText, setDistanceText] = useState(null);

  const requestPermission = async () => {
    const permission = Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA;
    const status = await check(permission);
    
    if (status === RESULTS.GRANTED) {
      setHasPermission(true);
    } else {
      const result = await request(permission);
      setHasPermission(result === RESULTS.GRANTED);
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  const onStarted = () => {
    console.log('AR Session Started');
  };

  const onTrackingState = (event) => {
    setTrackingState(event.nativeEvent.state);
  };

  const onPointAdded = (event) => {
    setPointsCount(event.nativeEvent.index + 1);
  };

  const onMeasured = (event) => {
    setDistanceText(event.nativeEvent.distanceText);
  };

  const onError = (event) => {
    const code = event.nativeEvent.code;
    console.log('AR Error:', code);
  };

  const handleReset = () => {
    ArCommands.clear(arRef.current);
    setPointsCount(0);
    setDistanceText(null);
  };

  const handleUndo = () => {
    ArCommands.undo(arRef.current);
    setPointsCount(prev => Math.max(0, prev - 1));
    if (pointsCount <= 2) {
      setDistanceText(null);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Camera permission is required</Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.permissionButton, { marginTop: 20, backgroundColor: '#757575' }]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ArMeasureViewNative
        ref={arRef}
        style={StyleSheet.absoluteFill}
        onStarted={onStarted}
        onTrackingState={onTrackingState}
        onPointAdded={onPointAdded}
        onMeasured={onMeasured}
        onError={onError}
      />

      <SafeAreaView style={styles.uiContainer} pointerEvents="box-none">
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              {trackingState !== 'TRACKING' 
                ? 'Move phone to find planes...' 
                : pointsCount === 0 
                  ? 'Tap to place Point A' 
                  : pointsCount === 1 
                    ? 'Tap to place Point B' 
                    : 'Distance Measured'}
            </Text>
          </View>
        </View>

        <View style={styles.bottomContainer} pointerEvents="box-none">
          {distanceText && (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Measured Distance</Text>
              <Text style={styles.resultValue}>{distanceText}</Text>
            </View>
          )}
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.undoBtn]} onPress={handleUndo}>
              <Text style={styles.actionBtnText}>Undo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.resetBtn]} onPress={handleReset}>
              <Text style={styles.actionBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  uiContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'android' ? 20 : 0,
  },
  backBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  instructionContainer: {
    backgroundColor: 'rgba(106, 27, 154, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: '70%',
  },
  instructionText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  resultLabel: {
    color: '#757575',
    fontSize: 14,
    marginBottom: 5,
  },
  resultValue: {
    color: '#6A1B9A',
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  actionBtn: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
    minWidth: 120,
    alignItems: 'center',
  },
  undoBtn: {
    backgroundColor: '#757575',
  },
  resetBtn: {
    backgroundColor: '#6A1B9A',
  },
  actionBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ARDistanceScreen;
