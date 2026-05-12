import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const centers = [
  { id: 'grau-du-roi', name: 'Le Grau-du-Roi' },
  { id: 'le-cres', name: 'Le Crès' },
  { id: 'serignant', name: 'Sérignan' },
  { id: 'cabestany', name: 'Cabestany' },
  { id: 'avignon', name: 'Avignon' },
];

const CenterSelection = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with custom gradient */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(50,172,222,0.08), var(--bg))' }} />
      
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-blue/5" />
        <div className="absolute top-1/3 -left-20 w-64 h-64 rounded-full bg-brand-pink/5" />
        <div className="absolute -bottom-20 right-1/4 w-80 h-80 rounded-full bg-brand-blue/5" />
      </div>

      {/* Content */}
      <div className="relative">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Logo and Title */}
          <div className="text-center mb-16">
            <img 
              src="https://i.ibb.co/9wZ2zds/logo.png" 
              alt="MAbeautyplus" 
              className="h-60 mx-auto mb-6 animate-fade-in mix-blend-multiply" 
            />
            <p className="mt-4 text-xl font-light text-brand-pink">
              Votre expert en bien-être et santé
            </p>
          </div>

          {/* Centers List */}
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-semibold text-center mb-8 text-brand-blue">
              Choisissez votre centre
            </h1>
            <div className="space-y-6">
              {centers.map((center) => (
                <Link
                  key={center.id}
                  to={`/centers/${center.id}/clients`}
                  className="group block"
                >
                  <div className="bg-white/90 backdrop-blur-sm px-8 py-6 rounded-2xl transition-all duration-300
                    border hover:border-brand-pink
                    shadow-sm hover:shadow-lg hover:shadow-brand-pink/10
                    transform hover:scale-[1.02]"
                    style={{ borderColor: 'var(--line)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full 
                          bg-gradient-to-br from-brand-blue/10 to-brand-pink/10
                          group-hover:from-brand-pink/20 group-hover:to-brand-blue/20 
                          transition-colors duration-300">
                          <MapPin className="h-6 w-6 text-brand-blue" />
                        </div>
                        <h3 className="ml-4 text-xl font-medium text-brand-blue transition-colors duration-300">
                          {center.name}
                        </h3>
                      </div>
                      <div className="w-6 h-6 flex items-center justify-center rounded-full
                        bg-brand-pink/10 group-hover:bg-brand-pink/20 transition-colors duration-300">
                        <span className="block w-2 h-2 border-t-2 border-r-2 transform rotate-45"
                          style={{ borderColor: 'var(--secondary)' }} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterSelection;