/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        "background": "#0A0A0D",
        "surface": "#121319",
        "surface-dim": "#0A0A0D",
        "surface-bright": "#383940",
        "surface-container-lowest": "#0D0E14",
        "surface-container-low": "#1A1B21",
        "surface-container": "#1E1F26",
        "surface-container-high": "#292A30",
        "surface-container-highest": "#33343B",
        "primary": "#C6BFFF",
        "primary-container": "#6C5CE7",
        "on-primary": "#2900A0",
        "on-primary-container": "#FAF6FF",
        "on-primary-fixed": "#160066",
        "on-primary-fixed-variant": "#4029BA",
        "primary-fixed": "#E4DFFF",
        "primary-fixed-dim": "#C6BFFF",
        "inverse-primary": "#5847D2",
        "secondary": "#7DFFA2",
        "secondary-container": "#05E777",
        "on-secondary": "#003918",
        "on-secondary-container": "#00622E",
        "secondary-fixed": "#62FF96",
        "secondary-fixed-dim": "#00E475",
        "on-secondary-fixed": "#00210B",
        "on-secondary-fixed-variant": "#005226",
        "signal-green": "#00E676",
        "tertiary": "#FFB77D",
        "tertiary-container": "#AC5D00",
        "on-tertiary": "#4D2600",
        "on-tertiary-container": "#FFF5F1",
        "on-tertiary-fixed": "#2F1500",
        "on-tertiary-fixed-variant": "#6E3900",
        "tertiary-fixed": "#FFDCC3",
        "tertiary-fixed-dim": "#FFB77D",
        "on-background": "#E3E1EA",
        "on-surface": "#E3E1EA",
        "on-surface-variant": "#C8C4D7",
        "inverse-surface": "#E3E1EA",
        "inverse-on-surface": "#2F3037",
        "outline": "#928EA0",
        "outline-variant": "#474554",
        "surface-variant": "#33343B",
        "surface-tint": "#C6BFFF",
        "error": "#FFB4AB",
        "error-container": "#93000A",
        "on-error": "#690005",
        "on-error-container": "#FFDAD6"
},
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "9999px"
},
      spacing: {
        "unit": "8px",
        "margin-mobile": "16px",
        "gutter": "24px",
        "margin-desktop": "48px",
        "section-gap-v": "80px"
},
      fontFamily: {
        "headline-lg": [
                "Inter",
                "sans-serif"
        ],
        "headline-lg-mobile": [
                "Inter",
                "sans-serif"
        ],
        "headline-md": [
                "Inter",
                "sans-serif"
        ],
        "display-lg": [
                "Inter",
                "sans-serif"
        ],
        "body-lg": [
                "Inter",
                "sans-serif"
        ],
        "body-sm": [
                "Inter",
                "sans-serif"
        ],
        "label-caps": [
                "Inter",
                "sans-serif"
        ],
        "stats-md": [
                "JetBrains Mono",
                "monospace"
        ]
},
      fontSize: {
        "label-caps": [
                "12px",
                {
                        "lineHeight": "1",
                        "letterSpacing": "0.05em",
                        "fontWeight": "600"
                }
        ],
        "stats-md": [
                "18px",
                {
                        "lineHeight": "1",
                        "letterSpacing": "0em",
                        "fontWeight": "500"
                }
        ],
        "body-sm": [
                "14px",
                {
                        "lineHeight": "1.5",
                        "letterSpacing": "0em",
                        "fontWeight": "400"
                }
        ],
        "body-lg": [
                "16px",
                {
                        "lineHeight": "1.6",
                        "letterSpacing": "0em",
                        "fontWeight": "400"
                }
        ],
        "headline-md": [
                "20px",
                {
                        "lineHeight": "1.4",
                        "letterSpacing": "-0.01em",
                        "fontWeight": "600"
                }
        ],
        "headline-lg-mobile": [
                "24px",
                {
                        "lineHeight": "1.2",
                        "letterSpacing": "-0.02em",
                        "fontWeight": "700"
                }
        ],
        "headline-lg": [
                "32px",
                {
                        "lineHeight": "1.2",
                        "letterSpacing": "-0.02em",
                        "fontWeight": "700"
                }
        ],
        "display-lg": [
                "48px",
                {
                        "lineHeight": "1.1",
                        "letterSpacing": "-0.04em",
                        "fontWeight": "700"
                }
        ]
}
    }
  }
};
