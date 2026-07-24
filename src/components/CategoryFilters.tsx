import React from 'react';
import { LayoutGrid, Table, Trophy } from 'lucide-react';

interface CategoryFiltersProps {
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  totalResults: number;
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  viewMode,
  setViewMode,
  totalResults
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        
        {/* Section Title */}
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            Seguidores ainda jogam:
          </h2>
        </div>

        {/* View Switcher & Result Count */}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
          <span className="text-xs text-slate-400 font-medium">
            Exibindo <span className="text-white font-bold">{totalResults}</span> plataformas
          </span>

          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visualização em Tabela Comparativa"
            >
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">Tabela</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

