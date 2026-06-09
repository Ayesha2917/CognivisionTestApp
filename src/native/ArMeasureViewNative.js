import { requireNativeComponent, UIManager, findNodeHandle } from 'react-native';

export const ArMeasureViewNative = requireNativeComponent('ArMeasureView');

export const ArCommands = {
  reset: (ref) => dispatch(ref, 'reset'),
  undo:  (ref) => dispatch(ref, 'undo'),
  clear: (ref) => dispatch(ref, 'clear'),
  capture: (ref, requestId) => dispatch(ref, 'capture', [requestId]),
};

function dispatch(ref, name, args = []) {
  const node = findNodeHandle(ref);
  if (node == null) return;
  UIManager.dispatchViewManagerCommand(node, name, args);
}
