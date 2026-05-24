"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        setMessage("Registro exitoso ✅");
        router.push("/listings"); // redirige a la lista de publicaciones
      } else {
        const errorMessage = data.error || "Error en el registro";
        setMessage("Error: " + errorMessage);
      }
    } catch (error) {
      console.error(error);
      setMessage("Error de conexión ❌");
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
