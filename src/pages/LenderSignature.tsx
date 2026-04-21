import SharedApplicationFlow from "../components/application/SharedApplicationFlow";

export default function LenderSignature() {
  return <SharedApplicationFlow step="signature" lenderMode={true} />;
}
