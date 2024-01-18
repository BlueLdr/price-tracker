import { css, keyframes } from "@emotion/react";
import styled from "@emotion/styled";

import { rgba } from "~/utils";

import type { BadgeProps } from "@mui/material/Badge";

//================================================

type PulseIntensity = 1 | 2 | 3;
type DotSize = "sm" | "md" | "lg";

const intensitySizeMap = {
  sm: 1.5,
  md: 2,
  lg: 2.5,
} satisfies Record<DotSize, number>;

const modeColorStrengthMap = {
  dark: {
    weak: "dark",
    strong: "light",
  },
  light: {
    weak: "light",
    strong: "dark",
  },
} as const;

//================================================

const pulseLow = (
  colorMain: string,
  colorStrong: string,
  colorWeak: string,
  size: DotSize,
) => keyframes`
  0% {
    background-color: ${colorWeak};
    box-shadow: 0 0 0 0 ${rgba(colorMain, 0.6)};
  }
  1% {
    background-color: ${colorMain};
  }
  6% {
    background-color: ${colorWeak};
  }
  10% {
    background-color: ${colorWeak};
    box-shadow: 0 0 0 ${size === "sm" ? 4 : size === "lg" ? 8 : 6}px ${rgba(
      colorWeak,
      0,
    )};
  }
  100% {
    background-color: ${colorWeak};
    box-shadow: 0 0 0 0 ${rgba(colorStrong, 0)};
  }
`;

const pulseMed = (
  colorMain: string,
  colorStrong: string,
  colorWeak: string,
  size: DotSize,
) => keyframes`
  0% {
    background-color: ${colorWeak};
    box-shadow: 0 0 0 0 ${rgba(colorMain, 0.7)};
  }
  2% {
    background-color: ${colorMain};
  }
  12% {
    background-color: ${colorWeak};
  }
  20% {
    background-color: ${colorWeak};
    box-shadow: 0 0 0 ${size === "sm" ? 6 : size === "lg" ? 10 : 8}px ${rgba(
      colorWeak,
      0,
    )};
  }
  100% {
    background-color: ${colorWeak};
    box-shadow: 0 0 0 0 ${rgba(colorStrong, 0)};
  }
`;

const pulseHigh = (
  colorMain: string,
  colorStrong: string,
  colorWeak: string,
  size: DotSize,
) => keyframes`
  0% {
    background-color: ${colorMain};
    box-shadow: 0 0 0 0 ${rgba(colorStrong, 0.8)};
  }
  6% {
    background-color: ${colorStrong};
  }
  40% {
    background-color: ${colorMain};
  }
  60% {
    background-color: ${colorMain};
    box-shadow: 0 0 0 ${size === "sm" ? 8 : size === "lg" ? 16 : 12}px ${rgba(
      colorWeak,
      0,
    )};
  }
  100% {
    background-color: ${colorMain};
    box-shadow: 0 0 0 0 ${rgba(colorStrong, 0)};
  }
`;

const intensityAnimationMap = {
  1: (
    colorMain: string,
    colorStrong: string,
    colorWeak: string,
    size: DotSize,
  ) => css`
    ${pulseLow(colorMain, colorStrong, colorWeak, size)} 10s infinite
  `,
  2: (
    colorMain: string,
    colorStrong: string,
    colorWeak: string,
    size: DotSize,
  ) => css`
    ${pulseMed(colorMain, colorStrong, colorWeak, size)} 5s infinite
  `,
  3: (
    colorMain: string,
    colorStrong: string,
    colorWeak: string,
    size: DotSize,
  ) => css`
    ${pulseHigh(colorMain, colorStrong, colorWeak, size)} 2s infinite
  `,
};

//================================================

export interface AlertDotProps {
  color?: Exclude<BadgeProps["color"], "default">;
  intensity: PulseIntensity;
  size?: DotSize;
  className?: string;
}

const AlertDotBase: React.FC<AlertDotProps> = ({ className }) => (
  <span className={className} />
);

//================================================

export const AlertDot = styled(AlertDotBase)`
  display: block;
  border-radius: 50% / 50%;
  width: ${({ theme, size = "md" }) => theme.spacing(intensitySizeMap[size])};
  height: ${({ theme, size = "md" }) => theme.spacing(intensitySizeMap[size])};
  align-self: center;
  ${({ theme, color = "success", intensity, size = "md" }) => {
    const variantWeak = modeColorStrengthMap[theme.palette.mode].weak;
    const variantStrong = modeColorStrengthMap[theme.palette.mode].strong;
    const paletteColor = theme.palette[color];
    return css`
      background-color: ${paletteColor[intensity === 3 ? "main" : variantWeak]};
      animation: ${intensityAnimationMap[intensity](
        paletteColor.main,
        paletteColor[variantStrong],
        paletteColor[variantWeak],
        size,
      )};
    `;
  }}
`;
AlertDot.displayName = "styled(AlertDot)";
