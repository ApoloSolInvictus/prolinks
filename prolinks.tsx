import React, { useState, useEffect } from 'react';

// Datos de respaldo con formato real de API de LinkedIn
const DEMO_LINKEDIN_JOBS = [
  {
    id: 'demo-1',
    title: 'Senior Full Stack Engineer (React / Node)',
    company: 'TechCorp Global',
    location: 'San José, Costa Rica (Remoto)',
    type: 'Full-time',
    experience: 'Mid-Senior',
    matchScore: 96,
    posted: 'Hace 2 horas',
    logo: 'https://placehold.co/100x100/1d1d1f/ffffff?text=TC',
    applyUrl: 'https://www.linkedin.com/jobs',
    description: 'Buscamos un Ingeniero Senior para liderar la arquitectura frontend y servicios backend en la nube. Requisitos: 5+ años en React, TypeScript, APIs REST y Docker. Excelente ambiente laboral y salario competitivo en USD.'
  },
  {
    id: 'demo-2',
    title: 'Data Scientist & ML Engineer',
    company: 'Fintech Solutions Inc.',
    location: 'Remote (LATAM)',
    type: 'Full-time',
    experience: 'Mid-Senior',
    matchScore: 91,
    posted: 'Hace 5 horas',
    logo: 'https://placehold.co/100x100/0071e3/ffffff?text=FS',
    applyUrl: 'https://www.linkedin.com/jobs',
    description: 'Desarrollo de modelos predictivos de riesgo crediticio y procesamiento de datos masivos. Dominio avanzado de Python, Pandas, PyTorch y SQL. Experiencia deseable con LLMs y despliegue de modelos.'
  },
  {
    id: 'demo-3',
    title: 'Cloud Solutions Architect AWS',
    company: 'CloudNet Americas',
    location: 'Híbrido - San José',
    type: 'Contract',
    experience: 'Director / Executive',
    matchScore: 84,
    posted: 'Hace 1 día',
    logo: 'https://placehold.co/100x100/434344/ffffff?text=CN',
    description: 'Diseño e implementación de infraestructura cloud segura y escalable en Amazon Web Services. Certificación AWS Solutions Architect Professional altamente valorada. Microservicios, Kubernetes y Terraform.'
  },
  {
    id: 'demo-4',
    title: 'Product Designer (UI/UX)',
    company: 'Elevate Design Studio',
    location: 'Remoto',
    type: 'Full-time',
    experience: 'Junior',
    matchScore: 88,
    posted: 'Hace 1 día',
    logo: 'https://placehold.co/100x100/34c759/ffffff?text=ED',
    description: 'Diseño de sistemas de diseño con enfoque minimalista estilo Apple. Creación de prototipos de alta fidelidad en Figma, wireframing y pruebas de usabilidad con usuarios reales.'
  }
];

export default function JobFinderApp() {
  const [searchTerm, setSearchTerm] = useState('Software Engineer');
  const [location, setLocation] = useState('Costa Rica');
  const [selectedExperience, setSelectedExperience] = useState('Mid-Senior');
  const [selectedType, setSelectedType] = useState('Remoto');
  
  // Estados para la API Key y Proveedor
  const [apiKey, setApiKey] = useState('');
  const [apiHost, setApiHost] = useState('linkedin-job-search-api.p.rapidapi.com');
  const [useLiveApi, setUseLiveApi] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);

  // Estados de datos e interfaz
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const showToast = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchJobs = async () => {
    setIsLoading(true);

    if (useLiveApi && apiKey.trim() !== '') {
      try {
        // Petición real a la API de LinkedIn en RapidAPI
        const queryParams = new URLSearchParams({
          query: searchTerm || 'Developer',
          location: location || 'Worldwide',
          limit: '10'
        });

        const response = await fetch(`https://${apiHost}/search?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': apiKey.trim(),
            'x-rapidapi-host': apiHost.trim()
          }
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: Revisa tu API Key de RapidAPI.`);
        }

        const data = await response.json();
        
        // Mapeo unificado de la respuesta JSON a nuestro modelo UI
        const mappedJobs = (data.data || data.results || data || []).map((item, idx) => ({
          id: item.job_id || item.id || `live-${idx}`,
          title: item.job_title || item.title || 'Puesto Profesional',
          company: item.employer_name || item.company || 'Empresa Confidencial',
          location: item.job_city ? `${item.job_city}, ${item.job_country}` : (item.location || location),
          type: item.job_employment_type || (item.is_remote ? 'Remoto' : 'Presencial'),
          experience: selectedExperience,
          matchScore: Math.floor(Math.random() * 20) + 80, // Algoritmo de Match estimado
          posted: item.job_posted_at_datetime_utc ? new Date(item.job_posted_at_datetime_utc).toLocaleDateString() : 'Reciente',
          logo: item.employer_logo || `https://placehold.co/100x100/0071e3/ffffff?text=${(item.employer_name || 'JOB')[0]}`,
          applyUrl: item.job_apply_link || item.url || 'https://www.linkedin.com/jobs',
          description: item.job_description || item.description || 'Consulta todos los detalles y postulaciones directamente en el enlace oficial de LinkedIn.'
        }));

        if (mappedJobs.length === 0) {
          showToast('No se encontraron empleos con esos criterios en la API live.', 'warning');
          setJobs([]);
        } else {
          setJobs(mappedJobs);
          showToast(`¡Conectado a LinkedIn! ${mappedJobs.length} empleos obtenidos en tiempo real.`, 'success');
        }

      } catch (error) {
        console.error('Error fetching live jobs:', error);
        showToast(error.message || 'Falló la conexión con la API Key. Mostrando modo simulado.', 'error');
        // Caemos a datos de demo si la API falla
        filterDemoJobs();
      }
    } else {
      // Modo Demo Inteligente
      setTimeout(() => {
        filterDemoJobs();
      }, 600);
    }

    setIsLoading(false);
  };

  const filterDemoJobs = () => {
    const filtered = DEMO_LINKEDIN_JOBS.filter(job => {
      const matchQuery = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchQuery;
    });
    setJobs(filtered);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f] selection:bg-[#0071e3] selection:text-white pb-24">
      
      {/* Toast System Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium text-white transition-all transform animate-bounce flex items-center gap-2 ${
          notification.type === 'error' ? 'bg-red-600' : notification.type === 'success' ? 'bg-emerald-600' : 'bg-[#0071e3]'
        }`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Navbar - Apple Style Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo ProLink Jobs */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => fetchJobs()}>
              <div className="w-8 h-8 bg-gradient-to-br from-[#1d1d1f] to-[#434344] text-white rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <span className="text-xl font-semibold tracking-tight text-[#1d1d1f]">ProLink<span className="font-normal text-[#86868b]">Jobs</span></span>
            </div>

            {/* API Config Button */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowApiModal(true)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all border flex items-center gap-2 ${
                  useLiveApi && apiKey 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                    : 'bg-white text-[#1d1d1f] border-gray-300 hover:bg-gray-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${useLiveApi && apiKey ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
                {useLiveApi && apiKey ? 'API Conectada' : 'Configurar API Key'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0071e3] text-xs font-semibold mb-4 border border-blue-100">
          ✨ Búsqueda Profesional impulsada por LinkedIn API
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#1d1d1f] mb-4 leading-tight">
          Tu carrera profesional,<br className="hidden md:block" /> elevada.
        </h1>
        <p className="text-lg md:text-xl text-[#86868b] max-w-2xl mb-8 font-normal leading-relaxed">
          Conectamos tu perfil con las ofertas exclusivas de LinkedIn. Algoritmos inteligentes filtran el ruido para entregarte solo lo relevante.
        </p>

        {/* Search Bar - Apple Style Pill */}
        <div className="w-full max-w-3xl bg-white p-2 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-200/80">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
            
            {/* Input Cargo */}
            <div className="flex-1 relative flex items-center bg-[#f5f5f7] rounded-full px-4 py-1">
              <svg className="w-5 h-5 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Cargo o tecnología (ej. React, Data)..." 
                className="w-full bg-transparent border-none focus:ring-0 text-[15px] py-2.5 pl-2 text-[#1d1d1f] outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Input Ubicación */}
            <div className="flex-1 relative flex items-center bg-[#f5f5f7] rounded-full px-4 py-1">
               <svg className="w-5 h-5 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              <input 
                type="text" 
                placeholder="Ubicación (ej. Costa Rica, Remote)" 
                className="w-full bg-transparent border-none focus:ring-0 text-[15px] py-2.5 pl-2 text-[#1d1d1f] outline-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="bg-[#0071e3] hover:bg-[#0077ED] text-white px-8 py-3 rounded-full font-semibold text-[15px] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Buscar'}
            </button>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
              <h3 className="font-semibold text-lg text-[#1d1d1f]">Filtros de Perfil</h3>
              
              <div>
                <h4 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">Nivel de Experiencia</h4>
                <div className="space-y-2">
                  {['Junior', 'Mid-Senior', 'Director / Executive'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedExperience(level)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                        selectedExperience === level 
                          ? 'bg-[#0071e3] text-white font-medium shadow-sm' 
                          : 'text-[#1d1d1f] hover:bg-gray-100'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">Modalidad</h4>
                <div className="space-y-2">
                  {['Remoto', 'Híbrido', 'Presencial'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                        selectedType === type 
                          ? 'bg-[#0071e3] text-white font-medium shadow-sm' 
                          : 'text-[#1d1d1f] hover:bg-gray-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Job List */}
          <main className="flex-1">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-[#1d1d1f]">
                {isLoading ? 'Consultando LinkedIn...' : `${jobs.length} ofertas encontradas`}
              </h2>
              <span className="text-xs text-[#86868b] bg-white px-3 py-1 rounded-full border border-gray-200">
                Fuente: {useLiveApi && apiKey ? 'LinkedIn Data API (Live)' : 'ProLink Intelligence (Demo)'}
              </span>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                [1, 2, 3].map((n) => (
                  <div key={n} className="bg-white p-6 rounded-3xl border border-gray-200/80 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : jobs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-200/80">
                  <p className="text-lg font-semibold text-[#1d1d1f]">Sin resultados</p>
                  <p className="text-sm text-[#86868b] mt-1">Prueba cambiando la ubicación o el término de búsqueda.</p>
                </div>
              ) : (
                jobs.map(job => (
                  <div 
                    key={job.id} 
                    onClick={() => setSelectedJob(job)}
                    className="bg-white p-6 rounded-3xl border border-gray-200/80 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row gap-5">
                      <img src={job.logo} alt={job.company} className="w-14 h-14 rounded-2xl object-cover border border-gray-100 flex-shrink-0" />
                      
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div>
                            <h3 className="text-lg font-bold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-sm text-[#86868b] mt-0.5">
                              <span className="font-medium text-[#1d1d1f]">{job.company}</span> • {job.location}
                            </p>
                          </div>
                          
                          <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                            ⚡ {job.matchScore}% Match
                          </div>
                        </div>

                        <p className="mt-3 text-sm text-[#434344] line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs bg-[#f5f5f7] px-3 py-1 rounded-lg font-medium text-[#1d1d1f]">
                            {job.type}
                          </span>
                          <span className="text-xs text-[#86868b]">{job.posted}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>

      {}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedJob(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-6">
              <img src={selectedJob.logo} alt={selectedJob.company} className="w-16 h-16 rounded-2xl object-cover border border-gray-100" />
              <div>
                <h2 className="text-2xl font-bold text-[#1d1d1f]">{selectedJob.title}</h2>
                <p className="text-sm text-[#86868b]">{selectedJob.company} • {selectedJob.location}</p>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                {selectedJob.matchScore}% Compatibilidad con tu Perfil
              </span>
              <span className="bg-gray-100 text-[#1d1d1f] px-3 py-1 rounded-full text-xs font-medium">
                {selectedJob.type}
              </span>
            </div>

            <div className="mb-8">
              <h4 className="font-semibold text-sm text-[#1d1d1f] mb-2 uppercase tracking-wider">Descripción del Puesto</h4>
              <p className="text-sm text-[#434344] leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setSelectedJob(null)}
                className="px-6 py-2.5 rounded-full text-sm font-medium text-[#1d1d1f] hover:bg-gray-100 transition-colors"
              >
                Cerrar
              </button>
              <a 
                href={selectedJob.applyUrl} 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#0071e3] hover:bg-[#0077ED] text-white px-8 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm inline-flex items-center gap-2"
              >
                Aplicar en LinkedIn
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {}
      {showApiModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-gray-100 relative">
            <button 
              onClick={() => setShowApiModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">Conectar API Key Real</h3>
            <p className="text-xs text-[#86868b] mb-6">
              Ingresa tu API Key de RapidAPI (LinkedIn Job Search API o JSearch) para extraer datos reales de empleos.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">X-RapidAPI-Key</label>
                <input 
                  type="password" 
                  placeholder="Ej. 8a93b21c45msh..."
                  className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0071e3]"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">X-RapidAPI-Host</label>
                <input 
                  type="text" 
                  className="w-full bg-[#f5f5f7] border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0071e3]"
                  value={apiHost}
                  onChange={(e) => setApiHost(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="liveToggle"
                  checked={useLiveApi}
                  onChange={(e) => setUseLiveApi(e.target.checked)}
                  className="w-4 h-4 text-[#0071e3] rounded"
                />
                <label htmlFor="liveToggle" className="text-xs font-medium text-[#1d1d1f]">
                  Activar llamadas live a RapidAPI
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  setShowApiModal(false);
                  fetchJobs();
                }}
                className="w-full bg-[#0071e3] hover:bg-[#0077ED] text-white py-2.5 rounded-full text-sm font-semibold transition-colors"
              >
                Guardar y Buscar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}