export default function Logo() {
  return (
    <svg
      width="160"
      height="40"
      viewBox="0 0 160 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-gray-900 dark:text-gray-100"
    >
      {/* Left & Right Angle Brackets */}
      <path
        d="M20 12 L12 20 L20 28"
        stroke="#3B82F6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 12 L36 20 L28 28"
        stroke="#3B82F6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Text: CodePad */}
      <text
        x="50"
        y="26"
        fontFamily="Inter, sans-serif"
        fontSize="20"
        fontWeight="600"
        fill="currentColor"
      >
        CodePad
      </text>
    </svg>
  );
}
