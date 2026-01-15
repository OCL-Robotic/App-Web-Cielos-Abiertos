
import React, { useState, useEffect } from 'react';
import { LessonPlan, FormInputs, FieldConfig } from './types.ts';
import { generateLessonPlan } from './services/geminiService.ts';

// Iconos
const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M12 6v12"/></svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
const PrintIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2 2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);

const DEFAULT_FIELDS: FieldConfig[] = [
  { id: 'topic', label: 'Tema o Historia', placeholder: 'Ej: David y Goliat', type: 'text' },
  { id: 'verse', label: 'Cita Bíblica', placeholder: 'Ej: 1 Samuel 17', type: 'text' },
  { id: 'ageGroup', label: 'Grupo de Edad', placeholder: '', type: 'select', options: ['Párvulos (3-5 años)', 'Niños (6-9 años)', 'Pre-adolescentes (10-12 años)', 'Jóvenes (13+ años)'] },
  { id: 'duration', label: 'Duración', placeholder: 'Ej: 45 minutos', type: 'text' },
];

export default function App() {
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [fields, setFields] = useState<FieldConfig[]>(DEFAULT_FIELDS);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [form, setForm] = useState<FormInputs>(() => 
    DEFAULT_FIELDS.reduce((acc, f) => ({ ...acc, [f.id]: f.options?.[0] || '' }), {})
  );

  useEffect(() => {
    try {
      const savedPlans = localStorage.getItem('sunday-school-plans');
      if (savedPlans) setPlans(JSON.parse(savedPlans));
      
      const savedFields = localStorage.getItem('sunday-school-fields');
      if (savedFields) setFields(JSON.parse(savedFields));
    } catch (e) {
      console.warn("No se pudieron cargar los datos de localStorage");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sunday-school-fields', JSON.stringify(fields));
  }, [fields]);

  const handleAddField = () => {
    if (!newFieldLabel.trim()) return;
    const id = newFieldLabel.toLowerCase().trim().replace(/\s+/g, '_');
    if (fields.some(f => f.id === id)) return;
    
    const newField: FieldConfig = { id, label: newFieldLabel, placeholder: `Ingrese ${newFieldLabel.toLowerCase()}`, type: 'text' };
    setFields([...fields, newField]);
    setForm({ ...form, [id]: '' });
    setNewFieldLabel('');
  };

  const handleRemoveField = (id: string) => {
    if (DEFAULT_FIELDS.some(f => f.id === id)) return;
    setFields(fields.filter(f => f.id !== id));
    const newForm = { ...form };
    delete newForm[id];
    setForm(newForm);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const newPlan = await generateLessonPlan(form);
      const updatedPlans = [newPlan, ...plans];
      setPlans(updatedPlans);
      setCurrentPlan(newPlan);
      localStorage.setItem('sunday-school-plans', JSON.stringify(updatedPlans));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error inesperado al generar el plan.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="no-print w-full md:w-80 bg-white border-r border-slate-200 p-6 overflow-y-auto max-h-screen shadow-sm z-10">
        <div className="mb-8 group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 text-white rounded-lg flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
              <BookIcon />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-800 leading-none tracking-tight uppercase">CIELOS ABIERTOS</h1>
              <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase mt-0.5">Aguadulce, Coclé</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium italic pl-11">"Edificando sobre la roca"</p>
        </div>

        <nav className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Configurar Lección</h2>
              <button 
                onClick={() => setShowConfig(!showConfig)}
                className={`p-1.5 rounded-md transition ${showConfig ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
              >
                <SettingsIcon />
              </button>
            </div>

            {showConfig && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Campos Personalizados</h3>
                <div className="space-y-2 mb-4">
                  {fields.map(f => (
                    <div key={f.id} className="flex items-center justify-between text-xs p-2.5 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <span className="font-medium text-slate-700">{f.label}</span>
                      {!DEFAULT_FIELDS.some(df => df.id === f.id) && (
                        <button onClick={() => handleRemoveField(f.id)} className="text-red-400 hover:text-red-600 transition">
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    placeholder="Nuevo campo (ej: Objetivo)"
                    value={newFieldLabel}
                    onChange={e => setNewFieldLabel(e.target.value)}
                  />
                  <button onClick={handleAddField} className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm">
                    <PlusIcon />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              {fields.map(field => (
                <div key={field.id} className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition bg-white shadow-sm"
                      value={form[field.id] || ''}
                      onChange={e => setForm({...form, [field.id]: e.target.value})}
                    >
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      required={DEFAULT_FIELDS.some(df => df.id === field.id)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition bg-white shadow-sm"
                      placeholder={field.placeholder}
                      value={form[field.id] || ''}
                      onChange={e => setForm({...form, [field.id]: e.target.value})}
                    />
                  )}
                </div>
              ))}

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg animate-pulse">
                  {error}
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-lg transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent" />
                ) : (
                  <><PlusIcon /> Generar Plan</>
                )}
              </button>
            </form>
          </section>

          <section className="pt-6 border-t border-slate-100">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Lecciones Guardadas</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {plans.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">No hay historial todavía.</p>}
              {plans.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setCurrentPlan(p); setError(null); }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${currentPlan?.id === p.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100' : 'border-slate-100 hover:bg-slate-50 text-slate-600'}`}
                >
                  <div className="font-bold truncate text-sm">{p.topic}</div>
                  <div className="text-[10px] opacity-70 mt-1 flex justify-between items-center font-medium">
                    <span>{p.date}</span>
                    <span className="bg-white/50 px-1.5 rounded uppercase">{p.audience.split(' ')[0]}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto bg-slate-50">
        {!currentPlan ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 max-w-lg mx-auto text-center space-y-6">
            <div className="p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50">
              <BookIcon />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Bienvenido, Maestro</h2>
              <p className="text-slate-500 font-medium">Crea planes de clase estructurados y bíblicos para CIELOS ABIERTOS AGUADULCE con ayuda de Inteligencia Artificial.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="no-print flex items-center justify-between">
              <button onClick={() => setCurrentPlan(null)} className="text-indigo-600 text-sm font-bold flex items-center gap-1.5 hover:translate-x-[-4px] transition-transform">
                ← Volver al Menú
              </button>
              <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-md text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all hover:shadow-lg">
                <PrintIcon /> Guardar PDF / Imprimir
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-slate-200/50 p-8 md:p-16 print:shadow-none print:border-none print:p-0">
              <header className="border-b-2 border-slate-100 pb-10 mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] block">Escuela Dominical</span>
                    <h1 className="text-4xl font-black text-slate-900 leading-tight">{currentPlan.topic}</h1>
                  </div>
                  <div className="bg-indigo-600 text-white px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
                    {currentPlan.audience}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <div>
                    <span className="block text-slate-300 mb-1">Cita Bíblica</span>
                    <span className="text-slate-800">{currentPlan.verse}</span>
                  </div>
                  <div>
                    <span className="block text-slate-300 mb-1">Fecha</span>
                    <span className="text-slate-800">{currentPlan.date}</span>
                  </div>
                </div>
              </header>

              <div className="space-y-12">
                {/* Metodología ABCD */}
                <section>
                  <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-3">
                    <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                    Estructura de la Clase (ABCD)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="text-[10px] font-black text-indigo-500 uppercase block mb-2">A - Audiencia</span>
                      <p className="text-slate-700 text-sm font-medium leading-relaxed">{currentPlan.abcd.audience}</p>
                    </div>
                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="text-[10px] font-black text-indigo-500 uppercase block mb-2">B - Comportamiento</span>
                      <p className="text-slate-700 text-sm font-medium leading-relaxed">{currentPlan.abcd.behavior}</p>
                    </div>
                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="text-[10px] font-black text-indigo-500 uppercase block mb-2">C - Condición</span>
                      <p className="text-slate-700 text-sm font-medium leading-relaxed">{currentPlan.abcd.condition}</p>
                    </div>
                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="text-[10px] font-black text-indigo-500 uppercase block mb-2">D - Grado</span>
                      <p className="text-slate-700 text-sm font-medium leading-relaxed">{currentPlan.abcd.degree}</p>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <section className="space-y-8">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-3">
                        <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                        Objetivos
                      </h3>
                      <div className="space-y-6">
                        <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                          <span className="text-[10px] font-black text-indigo-600 uppercase mb-2 block">General</span>
                          <p className="text-slate-800 text-sm font-bold italic leading-relaxed">{currentPlan.generalObjective}</p>
                        </div>
                        <ul className="space-y-3">
                          {currentPlan.specificObjectives.map((obj, i) => (
                            <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium">
                              <span className="text-indigo-400 font-black">•</span> {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl">
                    <h3 className="text-xs font-black text-indigo-400 mb-6 uppercase tracking-widest">Contexto Bíblico</h3>
                    <p className="text-slate-300 text-sm leading-relaxed font-medium italic">"{currentPlan.biblicalContext}"</p>
                  </section>
                </div>

                {/* Actividades */}
                <section>
                  <h3 className="text-sm font-black text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-3">
                    <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                    Actividades Sugeridas
                  </h3>
                  <div className="space-y-6">
                    {currentPlan.activities.map((act, i) => (
                      <div key={i} className="relative pl-10 pb-10 border-l-2 border-slate-100 last:pb-0">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 bg-white border-4 border-indigo-600 rounded-full" />
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                          <h4 className="font-black text-slate-800 text-lg">{act.title}</h4>
                          <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase">{act.duration}</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4 font-medium">{act.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {act.materials.map((m, j) => (
                            <span key={j} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-wide">#{m}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Rúbrica */}
                <section className="print:break-before-page pt-10">
                  <h3 className="text-sm font-black text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-3">
                    <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                    Rúbrica de Evaluación
                  </h3>
                  <div className="overflow-hidden rounded-3xl border-2 border-slate-100 shadow-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-5">Dimensión</th>
                          <th className="px-6 py-5 text-emerald-600">Excelente</th>
                          <th className="px-6 py-5 text-amber-600">Bueno</th>
                          <th className="px-6 py-5 text-red-600">Por Mejorar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {currentPlan.rubric.map((item, i) => (
                          <tr key={i}>
                            <td className="px-6 py-5 font-black text-slate-800 bg-slate-50/30">{item.criterion}</td>
                            <td className="px-6 py-5 text-slate-600 font-medium">{item.excellent}</td>
                            <td className="px-6 py-5 text-slate-600 font-medium">{item.good}</td>
                            <td className="px-6 py-5 text-slate-400 italic font-medium">{item.improvement}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <footer className="mt-20 pt-10 border-t-2 border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">CIELOS ABIERTOS - AGUADULCE, PANAMÁ</p>
                <p className="text-[9px] font-medium text-slate-400 mt-2 tracking-widest">EDIFICANDO SOBRE LA ROCA • {new Date().getFullYear()}</p>
              </footer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
