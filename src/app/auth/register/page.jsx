"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = handleSubmit(async (data) => {
    if (data.password !== data.confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      router.push("/auth/login");
    } else {
      setErrorMsg("Error al registrar. Intenta de nuevo.");
    }
  });

  return (
    <div className="min-h-[calc(100vh-7rem)] flex justify-center items-center bg-white px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-[#f5f5f5] p-8 rounded-lg shadow-lg"
      >
        {errorMsg && (
          <p className="bg-[#e01717] text-white text-sm p-3 rounded mb-4 text-center">
            {errorMsg}
          </p>
        )}

        <h1 className="text-[#1c3881] font-bold text-3xl text-center mb-6">
          Crear cuenta
        </h1>

        {/* Username */}
        <label htmlFor="username" className="text-[#1c3881] mb-1 block text-sm">
          Usuario:
        </label>
        <input
          type="text"
          {...register("username", {
            required: { value: true, message: "Usuario requerido" },
          })}
          className="p-3 rounded w-full border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-[#1c3881]"
          placeholder="tuUsuario123"
        />
        {errors.username && (
          <span className="text-[#e01717] text-xs">
            {errors.username.message}
          </span>
        )}

        {/* Email */}
        <label htmlFor="email" className="text-[#1c3881] mt-4 mb-1 block text-sm">
          Correo electrónico:
        </label>
        <input
          type="email"
          {...register("email", {
            required: { value: true, message: "Correo requerido" },
          })}
          className="p-3 rounded w-full border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-[#1c3881]"
          placeholder="usuario@correo.com"
        />
        {errors.email && (
          <span className="text-[#e01717] text-xs">{errors.email.message}</span>
        )}

        {/* Password */}
        <label htmlFor="password" className="text-[#1c3881] mt-4 mb-1 block text-sm">
          Contraseña:
        </label>
        <input
          type="password"
          {...register("password", {
            required: { value: true, message: "Contraseña requerida" },
          })}
          className="p-3 rounded w-full border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-[#1c3881]"
          placeholder="********"
        />
        {errors.password && (
          <span className="text-[#e01717] text-xs">
            {errors.password.message}
          </span>
        )}

        {/* Confirm Password */}
        <label
          htmlFor="confirmPassword"
          className="text-[#1c3881] mt-4 mb-1 block text-sm"
        >
          Confirmar contraseña:
        </label>
        <input
          type="password"
          {...register("confirmPassword", {
            required: { value: true, message: "Confirma tu contraseña" },
          })}
          className="p-3 rounded w-full border border-gray-300 mb-2 focus:outline-none focus:ring-2 focus:ring-[#1c3881]"
          placeholder="********"
        />
        {errors.confirmPassword && (
          <span className="text-[#e01717] text-xs">
            {errors.confirmPassword.message}
          </span>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-[#1c3881] hover:bg-[#162c68] text-white p-3 rounded-lg mt-6 transition-colors duration-200"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
