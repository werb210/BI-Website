import SharedApplicationFlow from "../components/application/SharedApplicationFlow";

export default function LenderDocuments() {
  return <SharedApplicationFlow step="documents" lenderMode={true} />;
}
