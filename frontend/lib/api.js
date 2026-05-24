export async function login(email, password) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function register(email, password, passwordConfirmation) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, password_confirmation: passwordConfirmation }),
  });
  return res.json();
}
