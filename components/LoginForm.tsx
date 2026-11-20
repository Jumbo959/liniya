"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => loginAction(formData),
    null,
  );
  return (
    <form className="form" action={action}>
      <label className="field">
        <span>Пароль</span>
        <input name="password" type="password" required autoFocus />
      </label>
      {state?.error && <p className="form-error">{state.error}</p>}
      <button className="btn" type="submit" disabled={pending}>{pending ? "Проверяем" : "Войти"}</button>
    </form>
  );
}
