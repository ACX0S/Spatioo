import { useMemo } from "react";
import { useTheme } from "@/components/theme-provider";

export function useMapOptions() {
  const { theme } = useTheme();

  const standardMapStyle: google.maps.MapTypeStyle[] = [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ];

  const nightMapStyle: google.maps.MapTypeStyle[] = [
    {
      elementType: "geometry",
      stylers: [{ color: "#212121" }],
    },
    {
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#212121" }],
    },
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#181818" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#383838" }],
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [{ color: "#2c2c2c" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#000000" }],
    },
  ];
  const isDarkMode = theme === "dark";

  return useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    gestureHandling: "greedy",
    styles: isDarkMode ? nightMapStyle : standardMapStyle,
  }), [isDarkMode]);
}
