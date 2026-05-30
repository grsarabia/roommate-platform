"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { register } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await register(email, password, passwordConfirmation);
      setMessage("Registro exitoso ✅");
      router.push("/onboarding");
    } catch (error: any) {
      setMessage("Error: " + (error.message || "Error en el registro"));
    }
  }

  return (
    <div>
      <h1>Registro</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
        />
        <button type="submit">Registrarse</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
