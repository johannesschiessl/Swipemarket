declare module "react-native-swiper" {
  import React from "react";
  import { ViewStyle } from "react-native";

  export interface SwiperProps {
    style?: ViewStyle;
    children: React.ReactNode;
    loop?: boolean;
    autoplay?: boolean;
    autoplayTimeout?: number;
    showsPagination?: boolean;
    activeDotColor?: string;
    onIndexChanged?: (index: number) => void;
    // Add any additional prop types as needed
  }

  export default class Swiper extends React.Component<SwiperProps> {
    scrollBy: (index: number, animated?: boolean) => void;
  }
}
