
import React, { useState, useEffect } from 'react';
import { LessonPlan, FormInputs, FieldConfig } from './types';
import { generateLessonPlan } from './services/geminiService';

// Icons
const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M12 6v12"/></svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
const PrintIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
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
  
  // Custom fields logic
  const [fields, setFields] = useState<FieldConfig[]>(DEFAULT_FIELDS);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  
  const [form, setForm] = useState<FormInputs>(() => {
    return DEFAULT_FIELDS.reduce((acc, f) => ({ ...acc, [f.id]: f.options?.[0] || '' }), {});
  });

  useEffect(() => {
    const savedPlans = localStorage.getItem('sunday-school-plans');
    if (savedPlans) setPlans(JSON.parse(savedPlans));
    
    const savedFields = localStorage.getItem('sunday-school-fields');
    if (savedFields) setFields(JSON.parse(savedFields));
  }, []);

  useEffect(() => {
    localStorage.setItem('sunday-school-fields', JSON.stringify(fields));
  }, [fields]);

  const handleAddField = () => {
    if (!newFieldLabel) return;
    const id = newFieldLabel.toLowerCase().replace(/\s+/g, '_');
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
    try {
      const newPlan = await generateLessonPlan(form);
      const updatedPlans = [newPlan, ...plans];
      setPlans(updatedPlans);
      setCurrentPlan(newPlan);
      localStorage.setItem('sunday-school-plans', JSON.stringify(updatedPlans));
    } catch (error) {
      console.error(error);
      alert("Error al generar el plan. Por favor revisa tu conexión o API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="no-print w-full md:w-85 bg-white border-r border-slate-200 p-6 overflow-y-auto max-h-screen">
        <div className="mb-8 group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 text-white rounded-lg flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
              <BookIcon />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-800 leading-none">
                CIELOS ABIERTO
              </h1>
              <span className="text-xs font-semibold text-indigo-600 tracking-wider">
                AGUADULCE
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium italic pl-11">
            "Edificando sobre la roca"
          </p>
        </div>

        <nav className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nuevo Plan</h2>
              <button 
                onClick={() => setShowConfig(!showConfig)}
                className={`p-1 rounded-md transition ${showConfig ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
                title="Personalizar campos"
              >
                <SettingsIcon />
              </button>
            </div>

            {showConfig && (
              <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Gestionar Campos</h3>
                <div className="space-y-2 mb-3">
                  {fields.map(f => (
                    <div key={f.id} className="flex items-center justify-between text-xs p-2 bg-white rounded border border-slate-100">
                      <span className="text-slate-700">{f.label}</span>
                      {!DEFAULT_FIELDS.some(df => df.id === f.id) && (
                        <button onClick={() => handleRemoveField(f.id)} className="text-red-400 hover:text-red-600">
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Nuevo campo..."
                    value={newFieldLabel}
                    onChange={e => setNewFieldLabel(e.target.value)}
                  />
                  <button 
                    onClick={handleAddField}
                    className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    <PlusIcon />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              {fields.map(field => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition bg-white"
                      value={form[field.id] || ''}
                      onChange={e => setForm({...form, [field.id]: e.target.value})}
                    >
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required={DEFAULT_FIELDS.some(df => df.id === field.id)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition"
                      placeholder={field.placeholder}
                      value={form[field.id] || ''}
                      onChange={e => setForm({...form, [field.id]: e.target.value})}
                    />
                  )}
                </div>
              ))}

              <button
                disabled={loading}
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-md transition shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <><PlusIcon /> Generar Plan</>
                )}
              </button>
            </form>
          </section>

          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Historial</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {plans.length === 0 && <p className="text-sm text-slate-400 italic text-center py-4">No hay planes guardados.</p>}
              {plans.map(p => (
                <button
                  key={p.id}
                  onClick={() => setCurrentPlan(p)}
                  className={`w-full text-left p-3 rounded-md border text-sm transition ${currentPlan?.id === p.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:bg-slate-50 text-slate-600'}`}
                >
                  <div className="font-semibold truncate">{p.topic}</div>
                  <div className="text-xs opacity-70">{p.date} • {p.audience}</div>
                </button>
              ))}
            </div>
          </section>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white md:bg-slate-50 p-4 md:p-10 overflow-y-auto">
        {!currentPlan ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 max-w-lg mx-auto text-center space-y-4">
            <div className="p-6 bg-white rounded-full shadow-sm">
              <BookIcon />
            </div>
            <h2 className="text-2xl font-light text-slate-600">Bienvenido, Maestro</h2>
            <p>Comienza completando el formulario a la izquierda para generar tu primer plan de clase asistido por IA para <strong>CIELOS ABIERTO - AGUADULCE</strong>.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Action Bar */}
            <div className="no-print flex items-center justify-between mb-4">
              <button 
                onClick={() => setCurrentPlan(null)}
                className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:underline"
              >
                ← Volver al inicio
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <PrintIcon /> Imprimir / PDF
              </button>
            </div>

            {/* Plan Display Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 md:p-12 print:shadow-none print:border-none print:p-0">
              <header className="border-b border-slate-100 pb-8 mb-8">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{currentPlan.topic}</h1>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide">
                    {currentPlan.audience}
                  </span>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-slate-500">
                  <p><strong>Cita:</strong> {currentPlan.verse}</p>
                  <p><strong>Fecha:</strong> {currentPlan.date}</p>
                </div>
              </header>

              <div className="grid gap-12">
                {/* ABCD Section */}
                <section>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                    Metodología ABCD
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <span className="text-xs font-bold text-indigo-600 uppercase mb-1 block">A - Audiencia</span>
                      <p className="text-slate-700 text-sm">{currentPlan.abcd.audience}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <span className="text-xs font-bold text-indigo-600 uppercase mb-1 block">B - Comportamiento</span>
                      <p className="text-slate-700 text-sm">{currentPlan.abcd.behavior}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <span className="text-xs font-bold text-indigo-600 uppercase mb-1 block">C - Condición</span>
                      <p className="text-slate-700 text-sm">{currentPlan.abcd.condition}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <span className="text-xs font-bold text-indigo-600 uppercase mb-1 block">D - Grado</span>
                      <p className="text-slate-700 text-sm">{currentPlan.abcd.degree}</p>
                    </div>
                  </div>
                </section>

                {/* Objectives */}
                <section>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-indigo-600 pl-3">Objetivos de la Clase</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">General</h4>
                      <p className="text-slate-700 leading-relaxed italic border-l-2 border-slate-200 pl-4">{currentPlan.generalObjective}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Específicos</h4>
                      <ul className="list-disc list-inside text-slate-700 space-y-1 ml-2">
                        {currentPlan.specificObjectives.map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Biblical Context */}
                <section className="p-6 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-3">Resumen Bíblico para el Maestro</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">{currentPlan.biblicalContext}</p>
                </section>

                {/* Activities */}
                <section>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-indigo-600 pl-3">Secuencia Didáctica</h3>
                  <div className="space-y-6">
                    {currentPlan.activities.map((act, i) => (
                      <div key={i} className="relative pl-8 pb-6 border-l border-slate-200 last:pb-0">
                        <div className="absolute left-[-5px] top-0 w-[10px] h-[10px] bg-indigo-600 rounded-full" />
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800">{act.title}</h4>
                          <span className="text-xs font-medium text-slate-400">{act.duration}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{act.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {act.materials.map((m, j) => (
                            <span key={j} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium uppercase">{m}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Rubric */}
                <section className="print:break-before-page">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-indigo-600 pl-3">Rúbrica de Evaluación</h3>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Criterio</th>
                          <th className="px-4 py-3 font-semibold text-green-700">Excelente</th>
                          <th className="px-4 py-3 font-semibold text-amber-700">Bueno</th>
                          <th className="px-4 py-3 font-semibold text-red-700">Por mejorar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentPlan.rubric.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-medium text-slate-800">{item.criterion}</td>
                            <td className="px-4 py-3 text-slate-600 italic">{item.excellent}</td>
                            <td className="px-4 py-3 text-slate-600 italic">{item.good}</td>
                            <td className="px-4 py-3 text-slate-600 italic">{item.improvement}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <footer className="mt-16 pt-8 border-t border-slate-100 text-center text-slate-400 text-[10px] uppercase tracking-widest">
                CIELOS ABIERTO - AGUADULCE • "Edificando sobre la roca" • © {new Date().getFullYear()}
              </footer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
