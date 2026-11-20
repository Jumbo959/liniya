import { LoginForm } from "@/components/LoginForm";
import { adminPassword } from "@/lib/auth";

export const metadata = { title: "Вход в офис" };

export default function LoginPage() {
  return (
    <div className="login">
      <div className="login-card">
        <p className="kicker">офис продаж</p>
        <h1>Вход</h1>
        <LoginForm />
        <p className="muted">Демонстрационный контур. Пароль для просмотра панели — {adminPassword()}.</p>
      </div>
    </div>
  );
}
