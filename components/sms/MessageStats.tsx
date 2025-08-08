export default function MessageStats({
  messageLength,
  segments,
  estimatedCost,
}: {
  messageLength: number;
  segments: number;
  estimatedCost: number;
}) {
  return (
    <p className="text-sm text-gray-500 mt-1">
      Characters: <strong>{messageLength}</strong> | Segments:{" "}
      <strong>{segments}</strong> | Estimated Cost:{" "}
      <strong>{estimatedCost}</strong> unit(s)
    </p>
  );
}
