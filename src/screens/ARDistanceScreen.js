import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { ArMeasureViewNative, ArCommands } from '../native/ArMeasureViewNative';

const ARDistanceScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [trackingState, setTrackingState] = useState('PAUSED');
  const [distance, setDistance] = useState(null);
  const [pointCount, setPointCount] = useState(0);
  const arRef = useRef(null);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const status = await request(
      Platform.OS === 'android' 
        ? PERMISSIONS.ANDROID.CAMERA 
        : PERMISSIONS.IOS.CAMERA
    );
    setHasPermission(status === RESULTS.GRANTED);
  };

  const onTrackingState = useCallback((e) => {
    setTrackingState(e.nativeEvent.state);
  }, []);

  const onPointAdded = useCallback((e) => {
    setPointCount(e.nativeEvent.index + 1);
  }, []);

  const onMeasured = useCallback((e) => {
    setDistance(e.nativeEvent.distanceText);
  }, []);

  const onError = useCallback((e) => {
    console.warn('AR Error:', e.nativeEvent.code);
  }, []);

  const resetPoints = () => {
    if (arRef.current) {
      ArCommands.reset(arRef.current);
      setPointCount(0);
      setDistance(null);
    }
  };

  const undoPoint = () => {
    if (arRef.current) {
      ArCommands.undo(arRef.current);
      setPointCount(prev => Math.max(0, prev - 1));
      if (pointCount <= 2) setDistance(null);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={checkPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, { marginTop: 10, backgroundColor: '#757575' }]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (Platform.OS !== 'android') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>AR Measurement is only supported on Android in this version.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ArMeasureViewNative
        ref={arRef}
        style={StyleSheet.absoluteFill}
        onTrackingState={onTrackingState}
        onPointAdded={onPointAdded}
        onMeasured={onMeasured}
        onError={onError}
      />
      
      <View style={styles.topOverlay} pointerEvents="box-none">
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionText}>
            {trackingState !== 'TRACKING' 
              ? 'Move device to initialize AR...' 
              : pointCount === 0 
                ? 'Tap to place Point A' 
                : pointCount === 1 
                  ? 'Tap to place Point B' 
                  : 'Distance Measured'}
          </Text>
        </View>
      </View>

      <View style={styles.bottomOverlay} pointerEvents="box-none">
        {distance && (
          <View style={styles.resultCard}>
            <Text style={styles.resultText}>Distance: {distance}</Text>
          </View>
        )}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={undoPoint}>
            <Text style={styles.secondaryButtonText}>Undo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={resetPoints}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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
  errorText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  topOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  instructionCard: {
    backgroundColor: 'rgba(106, 27, 154, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  instructionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  resultCard: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 5,
  },
  resultText: {
    color: '#6A1B9A',
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  resetButton: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6A1B9A',
  },
  resetButtonText: {
    color: '#6A1B9A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ARDistanceScreen;
