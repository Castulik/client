import { type ProduktDefinice } from '../../../types/types';
import { PlusCircle, Search, X } from 'lucide-react';

interface Props {
    vstup: string;
    setVstup: (v: string) => void;
    naseptavacProdukty: ProduktDefinice[];
    vybranyProdukt: ProduktDefinice | null;
    onVybratZNaspetavace: (p: ProduktDefinice) => void;
    onVybratVlastni: () => void;
    pocet: number;
    setPocet: (n: number) => void;
    jednotka: string;
    setJednotka: (s: string) => void;
    aktivniStitky: string[];
    toggleStitek: (s: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
    submitLabel?: string; // Nový volitelný prop
}

export const ProductForm = ({
    vstup, setVstup, naseptavacProdukty, vybranyProdukt, onVybratZNaspetavace, onVybratVlastni,
    pocet, setPocet, jednotka, setJednotka, aktivniStitky, toggleStitek,
    onConfirm, onCancel, submitLabel
}: Props) => {

    const isCustomMode = vstup.length > 0 && !vybranyProdukt;

    return (
        <div className={`bg-white p-4 rounded-3xl shadow-lg border relative mb-8 z-20 transition-colors ${submitLabel ? 'border-primary/30 shadow-blue-200' : 'border-gray-100 shadow-gray-200/50'}`}>

            {/* Input Wrapper */}
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Search size={20} />
                </div>

                <input
                    type="text"
                    placeholder="Co přidáme na seznam?"
                    value={vstup}
                    onChange={(e) => setVstup(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3.5 text-base rounded-xl border-2 outline-none transition-all
                        ${vybranyProdukt
                            ? 'bg-white border-primary text-gray-800 font-semibold'
                            : 'bg-gray-50 border-transparent focus:bg-white focus:border-primary/50 text-gray-800'
                        }`}
                    disabled={!!vybranyProdukt}
                />

                {vybranyProdukt && (
                    <button
                        onClick={onCancel}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <X size={18} />
                    </button>
                )}

                {naseptavacProdukty.length > 0 && !vybranyProdukt && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-50 divide-y divide-gray-50">
                        {naseptavacProdukty.map(prod => (
                            <div
                                key={prod.id}
                                className="px-4 py-3 cursor-pointer hover:bg-gray-50 active:bg-blue-50 flex items-center gap-3 transition-colors"
                                onClick={() => onVybratZNaspetavace(prod)}
                            >
                                <span className="text-xl">{prod.icon}</span>
                                <span className="font-medium text-gray-700">{prod.nazev}</span>
                            </div>
                        ))}
                    </div>
                )}

                {naseptavacProdukty.length === 0 && isCustomMode && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-2">
                        <div
                            className="p-3 rounded-lg cursor-pointer bg-blue-50 text-primary flex items-center gap-3 font-medium active:scale-98 transition-transform"
                            onClick={onVybratVlastni}
                        >
                            <PlusCircle size={20} />
                            <span>Vytvořit: <strong>"{vstup}"</strong></span>
                        </div>
                    </div>
                )}
            </div>

            {/* DETAIL PANEL */}
            {vybranyProdukt && (
                <div className="mt-5 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">

                    {vybranyProdukt.stitky && vybranyProdukt.stitky.length > 0 && (
                        <div className="mb-5">
                            <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Upřesnit:</span>
                            <div className="flex flex-wrap gap-2">
                                {vybranyProdukt.stitky.map(stitek => (
                                    <button
                                        key={stitek}
                                        type="button"
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                                            ${aktivniStitky.includes(stitek)
                                                ? 'bg-blue-50 border-blue-200 text-primary shadow-sm'
                                                : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                                        onClick={() => toggleStitek(stitek)}
                                    >
                                        {stitek}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 items-stretch h-12">
                        <input
                            type="number"
                            min="1" step="1"
                            value={pocet}
                            onChange={e => setPocet(parseFloat(e.target.value) || 0)}
                            className="w-20 text-center font-bold text-lg bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-primary focus:outline-none text-gray-800"
                        />

                        <div className="relative min-w-20">
                            <select
                                value={jednotka}
                                onChange={e => setJednotka(e.target.value)}
                                className="w-full h-full appearance-none bg-gray-50 border-2 border-transparent rounded-xl px-3 font-semibold text-gray-700 focus:border-primary focus:bg-white focus:outline-none text-center"
                            >
                                {vybranyProdukt.mozneJednotky.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={onConfirm}
                            className={`flex-1 text-white rounded-xl font-semibold text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform
                                ${submitLabel ? 'bg-indigo-600 shadow-indigo-500/30' : 'bg-primary shadow-blue-500/30'}`}
                        >
                            {submitLabel || (vybranyProdukt.id === 'custom-item' ? 'Vytvořit' : 'Vložit do košíku')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};