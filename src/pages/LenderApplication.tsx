import SharedApplicationFlow from "../components/application/SharedApplicationFlow";

export default function LenderApplication() {
  return <SharedApplicationFlow step="application" lenderMode={true} />;
}
