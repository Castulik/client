import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { type PolozkaKosiku, type DbProdukt } from '../../types/types'; 
import { MealCard } from './components/MealCard';
import { supabase } from '../supabaseClient'; // Potřebujeme Supabase

interface UlozeneJidlo {
  id: string;
  nazev: string;
  emoji: string;
  ingredience: PolozkaKosiku[];
}

export default function FavoritesPage() {
  const navigate = useNavigate();

  // STAV PRO DATA Z DATABÁZE (CENY)
  const [dbData, setDbData] = useState<DbProdukt[]>([]);

  // EFEKT: Stáhnout aktuální letáky při načtení stránky
  useEffect(() => {
    const fetchSlevy = async () => {
        const { data, error } = await supabase.from('products').select('*');
        
        if (!error && data) {
            // Mapping (stejný jako v OptimumPage - důležité pro čísla!)
            const mappedData: DbProdukt[] = data.map((row: any) => ({
                id: String(row.id),
                name: row.name,
                shop: row.shop,
                category: row.category || 'Neurčeno',
                shelf_price: parseFloat(row.current_price_per_unit) || 0,
                current_price_per_unit: parseFloat(row.current_price_per_unit) || 0,
                regular_price_per_unit: parseFloat(row.regular_price_per_unit) || 0,
                discount_percent: Math.abs(parseFloat(row.discount_percent)) || 0,
                deal_score: row.deal_score || 0,
                amount: 1, 
                unit: 'ks'
            }));
            setDbData(mappedData);
        }
    };
    fetchSlevy();
  }, []);

  // MOCK DATA RECEPTŮ
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
    <div className="pb-24">
      
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
            dbData={dbData} // <--- Tady posíláme stažená data dolů
            onBuy={koupitJidlo} 
          />
        ))}
      </div>

    </div>
  );
}