import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View, type LayoutRectangle, type StyleProp, type ViewStyle } from 'react-native';

export type Point = { x: number; y: number };

export type SignaturePadProps = {
  /** Current strokes (array of lines, each line is an array of points) */
  strokes: Point[][];
  /** Called whenever the strokes change */
  onChange?: (strokes: Point[][]) => void;
  /** Optional hint text shown when there is no signature */
  placeholder?: string;
  /** Optional style for the container */
  style?: StyleProp<ViewStyle>;
  /** When true, disables drawing and only renders existing strokes */
  disabled?: boolean;
};

export function SignaturePad({ strokes, onChange, placeholder, style, disabled }: SignaturePadProps) {
  const layoutRef = useRef<LayoutRectangle | null>(null);
  const currentStroke = useRef<Point[]>([]);
  const allStrokesRef = useRef<Point[][]>(strokes);
  const [renderStrokes, setRenderStrokes] = useState<Point[][]>(strokes);
  const onChangeRef = useRef(onChange);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Sync from outside (e.g., clear button)
  useEffect(() => {
    allStrokesRef.current = strokes;
    setRenderStrokes(strokes);
  }, [strokes]);

  const panResponder = useMemo(() => {
    if (disabled) return null;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (!layoutRef.current) return;
        const x = evt.nativeEvent.locationX;
        const y = evt.nativeEvent.locationY;
        currentStroke.current = [{ x, y }];
        const next = [...allStrokesRef.current, currentStroke.current];
        allStrokesRef.current = next;
        // Cancel any pending RAF and render immediately so the stroke appears at once
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        setRenderStrokes([...next]);
      },
      onPanResponderMove: (evt) => {
        if (!layoutRef.current || currentStroke.current.length === 0) return;
        const x = evt.nativeEvent.locationX;
        const y = evt.nativeEvent.locationY;
        // Mutate in-place to avoid O(n) array copies per event
        currentStroke.current.push({ x, y });
        // Throttle re-renders to one per animation frame
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            setRenderStrokes([...allStrokesRef.current]);
          });
        }
      },
      onPanResponderRelease: () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        // Flush final state
        setRenderStrokes([...allStrokesRef.current]);
        currentStroke.current = [];
        onChangeRef.current?.([...allStrokesRef.current]);
      },
      onPanResponderTerminate: () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        setRenderStrokes([...allStrokesRef.current]);
        currentStroke.current = [];
        onChangeRef.current?.([...allStrokesRef.current]);
      },
    });
  }, [disabled]);

  // If the prop is explicitly empty (e.g. clear button), bypass local state and clear immediately
  const displayStrokes = strokes.length === 0 ? strokes : renderStrokes;
  const hasPoints = displayStrokes.some((stroke) => stroke.length > 0);

  return (
    <View
      style={[styles.container, style]}
      onLayout={(event) => {
        layoutRef.current = event.nativeEvent.layout;
      }}
      {...(panResponder ? panResponder.panHandlers : {})}
    >
      {!hasPoints && placeholder ? (
        <View style={styles.placeholderContainer} pointerEvents="none">
          <Text style={styles.placeholderText}>{placeholder}</Text>
        </View>
      ) : null}

      {displayStrokes.map((stroke, strokeIndex) => {
        if (stroke.length === 0) return null;

        // Single isolated point — render a small dot
        if (stroke.length === 1) {
          return (
            <View
              key={`dot-${strokeIndex}`}
              pointerEvents="none"
              style={[styles.dot, { left: stroke[0].x - 1.5, top: stroke[0].y - 1.5 }]}
            />
          );
        }

        // Render a line segment between each consecutive pair of points
        return stroke.slice(1).map((pt, i) => {
          const prev = stroke[i];
          const dx = pt.x - prev.x;
          const dy = pt.y - prev.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          if (length < 0.5) return null;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          const midX = (prev.x + pt.x) / 2;
          const midY = (prev.y + pt.y) / 2;
          return (
            <View
              key={`seg-${strokeIndex}-${i}`}
              pointerEvents="none"
              style={[
                styles.segment,
                {
                  width: length,
                  left: midX - length / 2,
                  top: midY - 1.5,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            />
          );
        });
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 180,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#111',
  },
  segment: {
    position: 'absolute',
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#111',
  },
  placeholderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
