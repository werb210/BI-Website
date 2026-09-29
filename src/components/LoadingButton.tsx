interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

const base =
  "h-12 px-8 rounded-full font-semibold tracking-wide transition-all duration-200";

export default function LoadingButton({
  loading,
  children,
  className = "",
  ...rest
}: Props) {
  const variant =
    "bg-[#1e63ff] text-white hover:bg-[#174fd6] shadow-[0_6px_20px_rgba(30,99,255,0.35)]";

  return (
    <button
      {...rest}
      className={`${base} ${variant} ${className}`.trim()}
      disabled={loading || rest.disabled}
    >
      {loading ? "Processing..." : children}
    </button>
  );
}
