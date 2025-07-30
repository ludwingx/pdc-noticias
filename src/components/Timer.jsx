export default function Timer({ horas, minutos, segundos }) {
  return (
    <span>
      {horas.toString().padStart(2, "0")}:
      {minutos.toString().padStart(2, "0")}:
      {segundos.toString().padStart(2, "0")}
    </span>
  );
}