export default function Logo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 背景圆形 */}
      <circle cx="12" cy="12" r="12" fill="#3B82F6" fillOpacity="0.08" />
      
      {/* Markdown 'M' */}
      <path
        d="M7.5 15.5V8.5L10 12L12 8.5L14 12L16.5 8.5V15.5"
        stroke="#3B82F6"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* 装饰线条 */}
      <path
        d="M7 17.5H17"
        stroke="#3B82F6"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      
      {/* 装饰点 */}
      <circle cx="12" cy="17.5" r="1.25" fill="#3B82F6" />
      <circle cx="7" cy="17.5" r="1" fill="#3B82F6" opacity="0.4" />
      <circle cx="17" cy="17.5" r="1" fill="#3B82F6" opacity="0.4" />
    </svg>
  );
} 