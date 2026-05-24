"use client";

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", textAlign: "center" }}>
        <p>{message}</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "15px" }}>
          <button
            onClick={onConfirm}
            style={{ background: "red", color: "#fff", padding: "8px 16px", borderRadius: "6px" }}
          >
            Sí
          </button>
          <button
            onClick={onCancel}
            style={{ background: "#ccc", padding: "8px 16px", borderRadius: "6px" }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
