import { COLORS } from '@/constants/colors';
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg'; // Import Svg and Path
import { format } from "date-fns";

const ACTIVE_COLOR = '#5BA064'; // Color for the active segment
const INACTIVE_COLOR = '#D3D3D3'; // Color for the inactive segments

// Helper function to convert polar coordinates to cartesian
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0; // -90 to start from the top
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

// Helper function to generate SVG arc path data
const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  const d = [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
  return d;
};

// This component simulates the circular progress and truck icon
const DeliveryIcon = ({step}: {step: number}) => {
  const svgSize = 60; // Overall size of the SVG container
  const strokeWidth = 5; // Thickness of the arc segments
  const radius = (svgSize / 2) - (strokeWidth / 2); // Radius of the arc
  const center = svgSize / 2; // Center point for SVG coordinates

  // Define the 5 segments with their start/end angles and colors
  // Each segment is approximately 70 degrees with a 2-degree gap to create separation
  const segments = [
    { start: 0, end: 68, color: step >= 1 ? ACTIVE_COLOR : INACTIVE_COLOR }, // Green for the first segment
    { start: 72, end: 140, color: step >= 2 ? ACTIVE_COLOR : INACTIVE_COLOR }, // Light Gray for subsequent segments
    { start: 144, end: 212, color: step >= 3 ? ACTIVE_COLOR : INACTIVE_COLOR },
    { start: 216, end: 284, color: step >= 4 ? ACTIVE_COLOR : INACTIVE_COLOR },
    { start: 288, end: 356, color: step >= 5 ? ACTIVE_COLOR : INACTIVE_COLOR },
  ];

  return (
    <View style={styles.iconContainer}>
      {/* SVG container for drawing the segmented circle */}
      <Svg height={svgSize} width={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        {segments.map((segment, index) => (
          <Path
            key={index}
            // Generate path data for each arc segment
            d={describeArc(center, center, radius, segment.start, segment.end)}
            stroke={segment.color} // Set stroke color based on segment definition
            strokeWidth={strokeWidth} // Set stroke width
            fill="none" // No fill for the arc
          />
        ))}
      </Svg>
      {/* Inner circle and truck icon, positioned absolutely over the SVG */}
      <View style={styles.innerCircleAbsolute}>
        <Image
            source={require('../assets/images/cleen-logo.png')} 
            style={styles.truckIcon}
        />
      </View>
    </View>
  );
};

const ProgressDetails = ({process_steps}) => {
  // 1. Number of completed items
  const completedItems = process_steps.filter(item => item.status === 'completed');
  const numberOfCompletedItems = completedItems.length;

  // 2. The completed entry with the largest id
  let currentEntry = {
    name: "Thanks for you order",
    text: "We are preparing your order",
  };

  if (completedItems.length > 0) {
    currentEntry = completedItems.reduce((prev, current) => {
        return (prev.id > current.id) ? prev : current;
    });
  }
  console.log("Current Entry: ", currentEntry);
  return (
    <View style={styles.container}>
      <DeliveryIcon step={numberOfCompletedItems} />
      <View style={styles.textContainer}>
        <Text style={styles.statusTitle}>{currentEntry?.name}</Text>
        <Text style={styles.deliveryInfo}>{currentEntry?.text}</Text>
        <Text style={styles.timeRange}>{currentEntry?.updated_at ? format(currentEntry?.updated_at, "MMMM do, yyyy - H:mm") : '-'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Arrange icon and text horizontally
    alignItems: 'center', // Align items vertically in the center
    backgroundColor: COLORS.background,
    padding: 20,
    marginBottom: 10,
    marginTop: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3, // For Android shadow
  },
  iconContainer: {
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // Needed for absolute positioning of inner circle
    width: 60, // Ensure container matches SVG size
    height: 60, // Ensure container matches SVG size
  },
  // This style is now for the inner circle positioned absolutely
  innerCircleAbsolute: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25, // Makes it a circle
    backgroundColor: COLORS.background, // Lighter green background for the icon area
    justifyContent: 'center',
    alignItems: 'center',
    top: 5, // Center it within the 60x60 container
    left: 5, // Center it within the 60x60 container
  },
  truckIcon: {
    fontSize: 24,
    height: 24,
    width: 34,
  },
  textContainer: {
    flex: 1, // Allows text to take up remaining space
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  deliveryInfo: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  timeRange: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 2,
  },
});

export default ProgressDetails;
