import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ObjectDistanceScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices.back;

  // Fake detected boxes
  const [boxA, setBoxA] = useState({ x: 50, y: 150, width: 100, height: 100 });
  const [boxB, setBoxB] = useState({ x: 200, y: 400, width: 120, height: 80 });

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const status = await request(
      Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA
    );
    setHasPermission(status === RESULTS.GRANTED);
  };

  const calculateDistance = () => {
    const x1 = boxA.x;
    const y1 = boxA.y;
    const w1 = boxA.width;
    const h1 = boxA.height;

    const x2 = boxB.x;
    const y2 = boxB.y;
    const w2 = boxB.width;
    const h2 = boxB.height;

    // Nearest edges calculation
    let dx = 0;
    if (x1 + w1 < x2) {
      dx = x2 - (x1 + w1);
    } else if (x2 + w2 < x1) {
      dx = x1 - (x2 + w2);
    }

    let dy = 0;
    if (y1 + h1 < y2) {
      dy = y2 - (y1 + h1);
    } else if (y2 + h2 < y1) {
      dy = y1 - (y2 + h2);
    }

    const distancePixels = Math.sqrt(dx * dx + dy * dy);
    const approxCm = (distancePixels / 10).toFixed(1);

    return { approxCm, dx, dy, x1, y1, w1, h1, x2, y2, w2, h2 };
  };

  const resetBoxes = () => {
    // Randomize positions for "Reset" effect
    setBoxA({
      x: Math.random() * (SCREEN_WIDTH - 150) + 20,
      y: Math.random() * (SCREEN_HEIGHT / 3) + 50,
      width: 80 + Math.random() * 40,
      height: 80 + Math.random() * 40,
    });
    setBoxB({
      x: Math.random() * (SCREEN_WIDTH - 150) + 20,
      y: Math.random() * (SCREEN_HEIGHT / 3) + SCREEN_HEIGHT / 2,
      width: 80 + Math.random() * 40,
      height: 80 + Math.random() * 40,
    });
  };

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>Camera permission is required</Text>
        <TouchableOpacity style={styles.btn} onPress={checkPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.center}>
        <Text>Loading Camera...</Text>
      </View>
    );
  }

  const { approxCm, x1, y1, w1, h1, x2, y2, w2, h2 } = calculateDistance();

  // Determine line start and end points (simplified to centers for visual clarity if needed, 
  // but let's try to point to edges)
  const lineX1 = x1 + w1 / 2;
  const lineY1 = y1 + h1 / 2;
  const lineX2 = x2 + w2 / 2;
  const lineY2 = y2 + h2 / 2;

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />

      <Svg style={StyleSheet.absoluteFill}>
        {/* Box A */}
        <Rect
          x={x1}
          y={y1}
          width={w1}
          height={h1}
          stroke="#6A1B9A"
          strokeWidth="3"
          fill="rgba(106, 27, 154, 0.2)"
        />
        <SvgText x={x1} y={y1 - 10} fill="#6A1B9A" fontSize="16" fontWeight="bold">
          Object A
        </SvgText>

        {/* Box B */}
        <Rect
          x={x2}
          y={y2}
          width={w2}
          height={h2}
          stroke="#6A1B9A"
          strokeWidth="3"
          fill="rgba(106, 27, 154, 0.2)"
        />
        <SvgText x={x2} y={y2 - 10} fill="#6A1B9A" fontSize="16" fontWeight="bold">
          Object B
        </SvgText>

        {/* Line between centers (as a proxy for edge distance line) */}
        <Line
          x1={lineX1}
          y1={lineY1}
          x2={lineX2}
          y2={lineY2}
          stroke="white"
          strokeWidth="2"
          strokeDasharray="5, 5"
        />
      </Svg>

      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Object Distance</Text>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Edge Distance</Text>
          <Text style={styles.resultValue}>{approxCm} cm</Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetBtn} onPress={resetBoxes}>
            <Text style={styles.resetBtnText}>Reset Objects</Text>
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
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
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
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  resultCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    alignSelf: 'center',
    width: '80%',
    elevation: 5,
  },
  resultLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6A1B9A',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resetBtn: {
    backgroundColor: '#6A1B9A',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  resetBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btn: {
    backgroundColor: '#6A1B9A',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ObjectDistanceScreen;
