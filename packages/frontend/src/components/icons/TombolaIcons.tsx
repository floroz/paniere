import React from "react";

/**
 * SVG component representing a Tombola Tabellone
 */
export const TabelloneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="48"
    height="48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Tabellone background */}
    <rect
      x="10"
      y="10"
      width="80"
      height="80"
      rx="4"
      fill="#FEF3C7"
      stroke="#D97706"
    />

    {/* Grid lines - vertical */}
    <line x1="20" y1="10" x2="20" y2="90" stroke="#D97706" strokeWidth="1" />
    <line x1="30" y1="10" x2="30" y2="90" stroke="#D97706" strokeWidth="1" />
    <line x1="40" y1="10" x2="40" y2="90" stroke="#D97706" strokeWidth="1" />
    <line x1="50" y1="10" x2="50" y2="90" stroke="#D97706" strokeWidth="1" />
    <line x1="60" y1="10" x2="60" y2="90" stroke="#D97706" strokeWidth="1" />
    <line x1="70" y1="10" x2="70" y2="90" stroke="#D97706" strokeWidth="1" />
    <line x1="80" y1="10" x2="80" y2="90" stroke="#D97706" strokeWidth="1" />

    {/* Grid lines - horizontal */}
    <line x1="10" y1="20" x2="90" y2="20" stroke="#D97706" strokeWidth="1" />
    <line x1="10" y1="30" x2="90" y2="30" stroke="#D97706" strokeWidth="1" />
    <line x1="10" y1="40" x2="90" y2="40" stroke="#D97706" strokeWidth="1" />
    <line x1="10" y1="50" x2="90" y2="50" stroke="#D97706" strokeWidth="1" />
    <line x1="10" y1="60" x2="90" y2="60" stroke="#D97706" strokeWidth="1" />
    <line x1="10" y1="70" x2="90" y2="70" stroke="#D97706" strokeWidth="1" />
    <line x1="10" y1="80" x2="90" y2="80" stroke="#D97706" strokeWidth="1" />

    {/* Sample numbers */}
    <circle cx="25" cy="25" r="6" fill="#FBBF24" stroke="#D97706" />
    <text
      x="25"
      y="28"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      1
    </text>

    <circle cx="45" cy="15" r="6" fill="#FBBF24" stroke="#D97706" />
    <text
      x="45"
      y="18"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      2
    </text>

    <circle cx="65" cy="35" r="6" fill="#FBBF24" stroke="#D97706" />
    <text
      x="65"
      y="38"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      3
    </text>

    <circle cx="75" cy="75" r="6" fill="#FBBF24" stroke="#D97706" />
    <text
      x="75"
      y="78"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      4
    </text>

    <circle cx="35" cy="55" r="6" fill="#FBBF24" stroke="#D97706" />
    <text
      x="35"
      y="58"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      5
    </text>

    <circle cx="55" cy="85" r="6" fill="#FBBF24" stroke="#D97706" />
    <text
      x="55"
      y="88"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      9
    </text>

    {/* Marker for drawn number */}
    <circle
      cx="25"
      cy="25"
      r="8"
      stroke="#DC2626"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

/**
 * SVG component representing a Tombola Cartella
 */
export const CartellaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 60"
    width="48"
    height="28"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Cartella background */}
    <rect
      x="5"
      y="5"
      width="90"
      height="50"
      rx="3"
      fill="#FEF3C7"
      stroke="#D97706"
    />

    {/* Grid lines - vertical */}
    <line x1="14" y1="5" x2="14" y2="55" stroke="#D97706" strokeWidth="1" />
    <line x1="23" y1="5" x2="23" y2="55" stroke="#D97706" strokeWidth="1" />
    <line x1="32" y1="5" x2="32" y2="55" stroke="#D97706" strokeWidth="1" />
    <line x1="41" y1="5" x2="41" y2="55" stroke="#D97706" strokeWidth="1" />
    <line x1="50" y1="5" x2="50" y2="55" stroke="#D97706" strokeWidth="1" />
    <line x1="59" y1="5" x2="59" y2="55" stroke="#D97706" strokeWidth="1" />
    <line x1="68" y1="5" x2="68" y2="55" stroke="#D97706" strokeWidth="1" />
    <line x1="77" y1="5" x2="77" y2="55" stroke="#D97706" strokeWidth="1" />
    <line x1="86" y1="5" x2="86" y2="55" stroke="#D97706" strokeWidth="1" />

    {/* Grid lines - horizontal */}
    <line x1="5" y1="22" x2="95" y2="22" stroke="#D97706" strokeWidth="1" />
    <line x1="5" y1="39" x2="95" y2="39" stroke="#D97706" strokeWidth="1" />

    {/* Sample numbers */}
    <text
      x="9.5"
      y="17"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      4
    </text>
    <text
      x="27.5"
      y="17"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      16
    </text>
    <text
      x="45.5"
      y="17"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      28
    </text>
    <text
      x="63.5"
      y="17"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      49
    </text>
    <text
      x="81.5"
      y="17"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      73
    </text>

    <text
      x="18.5"
      y="34"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      7
    </text>
    <text
      x="36.5"
      y="34"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      31
    </text>
    <text
      x="54.5"
      y="34"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      52
    </text>
    <text
      x="72.5"
      y="34"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      67
    </text>
    <text
      x="90.5"
      y="34"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      85
    </text>

    <text
      x="9.5"
      y="51"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      12
    </text>
    <text
      x="27.5"
      y="51"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      39
    </text>
    <text
      x="45.5"
      y="51"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      58
    </text>
    <text
      x="63.5"
      y="51"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      76
    </text>
    <text
      x="81.5"
      y="51"
      textAnchor="middle"
      fontSize="8"
      fill="#7C2D12"
      fontWeight="bold"
    >
      90
    </text>

    {/* Markers for drawn numbers */}
    <circle
      cx="27.5"
      cy="17"
      r="6"
      fill="#DC2626"
      fillOpacity="0.3"
      stroke="none"
    />
    <circle
      cx="54.5"
      cy="34"
      r="6"
      fill="#DC2626"
      fillOpacity="0.3"
      stroke="none"
    />
    <circle
      cx="81.5"
      cy="51"
      r="6"
      fill="#DC2626"
      fillOpacity="0.3"
      stroke="none"
    />
  </svg>
);
