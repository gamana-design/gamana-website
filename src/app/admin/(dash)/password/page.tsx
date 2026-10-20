import { ChangePasswordForm } from "@/components/admin/change-password-form";

export const metadata = {
  title: "Change password | Admin",
  robots: { index: false },
};

export default function ChangePasswordPage() {
  return (
    <section className="max-w-xl">
      <h1 className="font-display text-3xl font-bold">Change password</h1>
      <p className="mt-3 text-sm leading-relaxed text-bone/60">
        Enter your current password, then choose a new one. You will sign in
        again after it changes.
      </p>
      <ChangePasswordForm />
    </section>
  );
}
