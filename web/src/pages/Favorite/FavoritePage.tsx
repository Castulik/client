import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { type PolozkaKosiku } from '../../types/types'; // Uprav cestu
import './FavoritePage.css'; // Uprav cestu

// Import nové komponenty
import { MealCard } from './components/MealCard';

// Definice typu (pokud ji nemáš v types.ts, nech ji tady, nebo přesuň)
interface UlozeneJidlo {
  id: string;
  nazev: string;
  emoji: string;
  ingredience: PolozkaKosiku[];
}

export default function FavoritesPage() {
  const navigate = useNavigate();

  // MOCK DATA
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
    <div className="home-container">
      
      {/* Hlavička */}
      <div className="fav-header">
        <h2>Oblíbená jídla</h2>
        <button className="add-meal-btn">
          <Plus size={20} /> Sestavit
        </button>
      </div>

      {/* Seznam karet */}
      <div className="meals-list">
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