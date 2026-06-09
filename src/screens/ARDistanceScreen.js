import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Pressable,
  Alert,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import Svg, { Line, Circle, Text as SvgText } from 'react-native-svg';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const { width, height } = Dimensions.get('window');

const ARDistanceScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [pointA, setPointA] = useState(null);
  const [pointB, setPointB] = useState(null);
  const [distance, setDistance] = useState(null);
  
  const device = useCameraDevice('back');

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const status = await check(PERMISSIONS.ANDROID.CAMERA);
    if (status === RESULTS.GRANTED) {
      setHasPermission(true);
    } else {
      const result = await request(PERMISSIONS.ANDROID.CAMERA);
      setHasPermission(result === RESULTS.GRANTED);
    }
  };

  const handleTap = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    
    if (!pointA) {
      setPointA({ x: locationX, y: locationY });
    } else if (!pointB) {
      const pB = { x: locationX, y: locationY };
      setPointB(pB);
      calculateDistance(pointA, pB);
    }
  };

  const calculateDistance = (p1, p2) => {
    const distPx = Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
    );
    // Formula: approxCm = distancePixels / 10
    const approxCm = (distPx / 10).toFixed(1);
    setDistance(approxCm);
  };

  const reset = () => {
    setPointA(null);
    setPointB(null);
    setDistance(null);
  };

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.btn} onPress={checkPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No camera device found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />
      
      <Pressable style={StyleSheet.absoluteFill} onPress={handleTap}>
        <Svg style={StyleSheet.absoluteFill}>
          {pointA && (
            <>
              <Circle cx={pointA.x} cy={pointA.y} r="10" fill="#6A1B9A" />
              <SvgText
                x={pointA.x}
                y={pointA.y - 15}
                fill="white"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
              >
                A
              </SvgText>
            </>
          )}
          {pointB && (
            <>
              <Circle cx={pointB.x} cy={pointB.y} r="10" fill="#6A1B9A" />
              <SvgText
                x={pointB.x}
                y={pointB.y - 15}
                fill="white"
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
              >
                B
              </SvgText>
            </>
          )}
          {pointA && pointB && (
            <Line
              x1={pointA.x}
              y1={pointA.y}
              x2={pointB.x}
              y2={pointB.y}
              stroke="#6A1B9A"
              strokeWidth="3"
            />
          )}
        </Svg>
      </Pressable>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>
              {!pointA ? 'Tap Point A' : !pointB ? 'Tap Point B' : 'Distance Calculated'}
            </Text>
          </View>
        </View>

        <View style={styles.bottomContent} pointerEvents="box-none">
          {distance && (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Approx Distance</Text>
              <Text style={styles.resultValue}>{distance} cm</Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
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
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  btn: {
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  instructionBox: {
    backgroundColor: 'rgba(106, 27, 154, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  instructionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bottomContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
  },
  resultLabel: {
    color: '#757575',
    fontSize: 14,
  },
  resultValue: {
    color: '#6A1B9A',
    fontSize: 24,
    fontWeight: 'bold',
  },
  resetBtn: {
    backgroundColor: '#6A1B9A',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  resetBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ARDistanceScreen;
