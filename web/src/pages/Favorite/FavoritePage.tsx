import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { type PolozkaKosiku } from '../../types/types'; 
import { MealCard } from './components/MealCard';

// Poznámka: Interface klidně nech zde, pokud ho nepoužíváš jinde
interface UlozeneJidlo {
  id: string;
  nazev: string;
  emoji: string;
  ingredience: PolozkaKosiku[];
}

export default function FavoritesPage() {
  const navigate = useNavigate();

  // MOCK DATA (Zatím beze změny)
  const [mojeJidla] = useState<UlozeneJidlo[]>([
    {
      id: 'j1',
      nazev: 'Vajíčková večeře',
      emoji: '🍳',
      ingredience: [
        { id: '1', nazev: 'Vejce', pocet: 6, jednotka: 'ks', vybraneStitky: [] },
        { id: '2', nazev: 'Rohlík', pocet: 4, jednotka: 'ks', vybraneStitky: [] },
        { id: '3', nazev: 'Rajče', pocet: 0.5, jednotka: 'kg', vybraneStitky: [] }
      ]
    },
    {
      id: 'j2',
      nazev: 'Nedělní řízky',
      emoji: '🍖',
      ingredience: [
        { id: '4', nazev: 'Kuřecí', pocet: 1, jednotka: 'kg', vybraneStitky: [] },
        { id: '5', nazev: 'Vejce', pocet: 3, jednotka: 'ks', vybraneStitky: [] },
        { id: '6', nazev: 'Mléko', pocet: 1, jednotka: 'l', vybraneStitky: [] },
        { id: '7', nazev: 'Olej', pocet: 1, jednotka: 'ks', vybraneStitky: [] }
      ]
    }
  ]);

  const koupitJidlo = (jidlo: UlozeneJidlo) => {
    navigate('/optimum', { state: { kosik: jidlo.ingredience } });
  };

  return (
    <div className="pb-10"> {/* Padding bottom aby obsah nekončil hned u lišty */}
      
      {/* Hlavička */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <h2 className="text-xl font-bold text-gray-800">Oblíbená jídla</h2>
        
        <button className="bg-primary text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-semibold text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-transform">
          <Plus size={18} /> 
          <span>Sestavit</span>
        </button>
      </div>

      {/* Seznam karet */}
      <div className="flex flex-col">
        {mojeJidla.map((jidlo) => (
          <MealCard 
            key={jidlo.id} 
            jidlo={jidlo} 
            onBuy={koupitJidlo} 
          />
        ))}
      </div>

    </div>
  );
}