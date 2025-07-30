export default function Filters({ activeSection, setActiveSection }) {
  return (
    <div className="flex items-center">
      <span className="text-gray-600 text-sm font-medium">Filtrar por:</span>
      <select
        value={activeSection}
        onChange={(e) => setActiveSection(e.target.value)}
        className="ml-2 px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#006168] bg-white shadow-sm"
      >
        <option value="all">Todas</option>
        <option value="tuto">Rodrigo Paz</option>
        <option value="jp">Edman Lara</option>
        <option value="otros">Otras Noticias</option>
      </select>
    </div>
  );
}