export default function RegulatoryModal({ onClose }: any) {
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Regulatory Information</h2>
        <p>
          Boreal Insurance acts as a referral partner. We do not provide advice.
        </p>
        <button onClick={onClose}>Continue</button>
      </div>
    </div>
  );
}
