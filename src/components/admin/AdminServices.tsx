import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, DollarSign, Search, Check, AlertCircle } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { Service } from '../../types/clinic';
import { formatCurrency, formatDuration } from '../../utils/bookingUtils';

export const AdminServices: React.FC = () => {
  const { services, addService, updateService, deleteService } = useClinic();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Service['category']>('Estética Facial');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [price, setPrice] = useState<number>(100);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const categories: Service['category'][] = [
    'Sobrancelhas',
    'Estética Facial',
    'Unhas',
    'Corporal & Massagem',
    'Combos Especiais',
  ];

  const handleOpenNew = () => {
    setEditingServiceId(null);
    setName('');
    setCategory('Estética Facial');
    setDurationMinutes(45);
    setPrice(150);
    setDescription('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (serv: Service) => {
    setEditingServiceId(serv.id);
    setName(serv.name);
    setCategory(serv.category);
    setDurationMinutes(serv.durationMinutes);
    setPrice(serv.price);
    setDescription(serv.description);
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Informe o nome do serviço.');
      return;
    }
    if (durationMinutes <= 0) {
      setError('Duração deve ser maior que 0 minutos.');
      return;
    }
    if (price <= 0) {
      setError('Preço deve ser maior que R$ 0,00.');
      return;
    }

    if (editingServiceId) {
      updateService(editingServiceId, {
        name: name.trim(),
        category,
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        description: description.trim(),
      });
    } else {
      addService({
        name: name.trim(),
        category,
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        description: description.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, servName: string) => {
    if (confirm(`Tem certeza que deseja excluir o serviço "${servName}"?`)) {
      deleteService(id);
    }
  };

  const filtered = services.filter((s) => {
    const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DEC8]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A87B42]">
            Catálogo de Procedimentos
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#241D1E]">
            Gerenciar Serviços Oferecidos
          </h2>
          <p className="text-xs text-[#7A6A63]">
            Cadastre novos procedimentos com duração média e preço para cálculo dos agendamentos.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 bg-[#241D1E] hover:bg-[#382F30] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#C59B63]" />
          <span>Cadastrar Novo Serviço</span>
        </button>
      </div>

      {/* Filters and search */}
      <div className="bg-white p-4 rounded-2xl border border-[#DFD5C6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou descrição..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#DFD5C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B63]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#241D1E] text-white'
                : 'bg-[#FAF8F5] text-[#5E514D] border border-[#DFD5C6] hover:bg-[#F3EDE4]'
            }`}
          >
            Todos ({services.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#241D1E] text-white'
                  : 'bg-[#FAF8F5] text-[#5E514D] border border-[#DFD5C6] hover:bg-[#F3EDE4]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((serv) => (
          <div
            key={serv.id}
            className="p-5 bg-white rounded-2xl border border-[#DFD5C6] shadow-sm flex flex-col justify-between gap-4 hover:border-[#C59B63] transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold text-[#A87B42] uppercase tracking-wider">
                  {serv.category}
                </span>
                <span className="text-base font-bold text-[#241D1E] tabular-nums">
                  {formatCurrency(serv.price)}
                </span>
              </div>

              <h4 className="text-base font-semibold text-[#241D1E] mt-1">{serv.name}</h4>
              <p className="text-xs text-[#6B5E59] mt-1.5 leading-relaxed">
                {serv.description || 'Procedimento clínico de estética e cuidados pessoais.'}
              </p>
            </div>

            <div className="pt-3 border-t border-[#F3EDE4] flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[#5E514D]">
                <Clock className="w-3.5 h-3.5 text-[#C59B63]" />
                <span className="font-medium text-[#241D1E]">
                  {formatDuration(serv.durationMinutes)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(serv)}
                  className="p-2 text-[#5E514D] hover:text-[#241D1E] hover:bg-[#FAF6F0] rounded-lg transition-colors cursor-pointer"
                  title="Editar Serviço"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(serv.id, serv.name)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Excluir Serviço"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-[#DFD5C6]">
          <p className="text-xs text-[#8C7A70]">Nenhum procedimento encontrado.</p>
        </div>
      )}

      {/* Create / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DFD5C6] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3EDE4]">
              <div>
                <h4 className="font-serif font-bold text-lg text-[#241D1E]">
                  {editingServiceId ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
                </h4>
                <p className="text-xs text-[#7A6A63]">
                  Configure nome, duração média e preço para o agendamento
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8C7A70] hover:text-[#241D1E] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#241D1E] mb-1">
                  Nome do Procedimento *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Designer de Sobrancelhas"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DFD5C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B63]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#241D1E] mb-1">
                  Categoria *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Service['category'])}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DFD5C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B63]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#241D1E] mb-1">
                    Duração Média (minutos) *
                  </label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#DFD5C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B63]"
                  />
                  <span className="text-[10px] text-[#8C7A70] block mt-0.5">
                    Equivale a {formatDuration(durationMinutes)}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-[#241D1E] mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#DFD5C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B63]"
                  />
                  <span className="text-[10px] text-[#8C7A70] block mt-0.5">
                    {formatCurrency(price)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#241D1E] mb-1">
                  Descrição do Serviço
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique o protocolo, benefícios e cuidados..."
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#DFD5C6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B63]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3EDE4]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-[#5E514D] hover:text-[#241D1E] cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#241D1E] hover:bg-[#382F30] text-white font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {editingServiceId ? 'Salvar Alterações' : 'Cadastrar Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
