"use client";

import { useState, type ChangeEvent, type FocusEvent, type FormEvent } from "react";

type FormValues = {
  nombre: string;
  telefono: string;
  mensaje: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  nombre: "",
  telefono: "",
  mensaje: "",
};

function validateField(name: keyof FormValues, value: string) {
  const trimmedValue = value.trim();

  switch (name) {
    case "nombre":
      if (!trimmedValue) {
        return "Ingresa tu nombre.";
      }

      if (trimmedValue.length < 2) {
        return "El nombre debe tener al menos 2 caracteres.";
      }

      return "";
    case "telefono":
      if (!trimmedValue) {
        return "Ingresa tu teléfono.";
      }

      if (!/^[+\d\s()-]{7,}$/.test(trimmedValue)) {
        return "Ingresa un teléfono válido.";
      }

      return "";
    case "mensaje":
      if (!trimmedValue) {
        return "Cuéntanos qué arreglo necesitas.";
      }

      if (trimmedValue.length < 10) {
        return "El mensaje debe tener al menos 10 caracteres.";
      }

      return "";
  }
}

function validateForm(values: FormValues) {
  return {
    nombre: validateField("nombre", values.nombre),
    telefono: validateField("telefono", values.telefono),
    mensaje: validateField("mensaje", values.mensaje),
  } satisfies FormErrors;
}

export default function ContactForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const fieldName = name as keyof FormValues;

    setValues((current) => ({
      ...current,
      [fieldName]: value,
    }));

    if (isSubmitted || errors[fieldName]) {
      setErrors((current) => ({
        ...current,
        [fieldName]: validateField(fieldName, value),
      }));
    }
  };

  const handleFieldBlur = (
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const fieldName = name as keyof FormValues;

    setErrors((current) => ({
      ...current,
      [fieldName]: validateField(fieldName, value),
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(values);
    const firstInvalidField = (Object.keys(nextErrors) as Array<keyof FormValues>).find(
      (fieldName) => nextErrors[fieldName],
    );

    setIsSubmitted(true);
    setErrors(nextErrors);

    if (firstInvalidField) {
      const firstInvalidElement = event.currentTarget.elements.namedItem(firstInvalidField);

      if (
        firstInvalidElement instanceof HTMLInputElement ||
        firstInvalidElement instanceof HTMLTextAreaElement
      ) {
        firstInvalidElement.focus();
      }

      return;
    }

    console.log("Formulario de contacto enviado");
    setValues(initialValues);
    setErrors({});
    setIsSubmitted(false);
  };

  const getFieldStyles = (fieldName: keyof FormValues) => ({
    borderColor: errors[fieldName]
      ? "var(--color-primary)"
      : "color-mix(in srgb, var(--color-dark) 20%, transparent)",
    color: "var(--color-dark)",
    backgroundColor: "#fdfcfa",
    boxShadow: errors[fieldName]
      ? "0 0 0 3px color-mix(in srgb, var(--color-primary) 14%, transparent)"
      : "none",
  });

  const getErrorId = (fieldName: keyof FormValues) => `${fieldName}-error`;

  return (
    <form
      noValidate
      className="space-y-5 rounded-[20px] border bg-white p-6 sm:p-8"
      style={{
        borderColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
        boxShadow:
          "0 10px 40px color-mix(in srgb, var(--color-dark) 6%, transparent)",
      }}
      onSubmit={handleSubmit}
    >
      <h3
        className="text-2xl font-normal"
        style={{
          color: "var(--color-primary)",
          fontFamily: "var(--font-heading)",
        }}
      >
        Envíanos un mensaje
      </h3>

      <div className="space-y-1.5">
        <label htmlFor="nombre" className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-dark)" }}>
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          autoComplete="name"
          value={values.nombre}
          aria-invalid={errors.nombre ? "true" : "false"}
          aria-describedby={errors.nombre ? getErrorId("nombre") : undefined}
          className="w-full rounded-[10px] border px-4 py-3 outline-none transition-all duration-300"
          style={getFieldStyles("nombre")}
          onBlur={handleFieldBlur}
          onChange={handleFieldChange}
        />
        {errors.nombre ? (
          <p
            id={getErrorId("nombre")}
            className="text-sm leading-6"
            style={{ color: "var(--color-primary)" }}
          >
            {errors.nombre}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="telefono" className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-dark)" }}>
          Teléfono
        </label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          value={values.telefono}
          aria-invalid={errors.telefono ? "true" : "false"}
          aria-describedby={errors.telefono ? getErrorId("telefono") : undefined}
          className="w-full rounded-[10px] border px-4 py-3 outline-none transition-all duration-300"
          style={getFieldStyles("telefono")}
          onBlur={handleFieldBlur}
          onChange={handleFieldChange}
        />
        {errors.telefono ? (
          <p
            id={getErrorId("telefono")}
            className="text-sm leading-6"
            style={{ color: "var(--color-primary)" }}
          >
            {errors.telefono}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="mensaje" className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-dark)" }}>
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={4}
          required
          value={values.mensaje}
          aria-invalid={errors.mensaje ? "true" : "false"}
          aria-describedby={errors.mensaje ? getErrorId("mensaje") : undefined}
          className="w-full rounded-[10px] border px-4 py-3 outline-none transition-all duration-300 resize-none"
          style={getFieldStyles("mensaje")}
          onBlur={handleFieldBlur}
          onChange={handleFieldChange}
        />
        {errors.mensaje ? (
          <p
            id={getErrorId("mensaje")}
            className="text-sm leading-6"
            style={{ color: "var(--color-primary)" }}
          >
            {errors.mensaje}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        className="w-full rounded-[10px] px-6 py-3.5 text-sm font-semibold tracking-[0.08em] uppercase transition-opacity hover:opacity-90"
        style={{
          backgroundColor: "#c0392b",
          color: "var(--color-cream)",
        }}
      >
        ENVIAR MENSAJE
      </button>

      <a
        href="https://wa.me/51987654321"
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center rounded-[10px] border-2 px-6 py-3.5 text-sm font-semibold transition-all duration-300 hover:bg-[#2d5a1b] hover:text-white"
        style={{
          borderColor: "#2d5a1b",
          color: "#2d5a1b",
        }}
      >
        Escribir por WhatsApp
      </a>
    </form>
  );
}
