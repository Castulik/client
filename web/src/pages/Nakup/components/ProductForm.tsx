import { type ProduktDefinice } from '../../../types/types';
import { PlusCircle } from 'lucide-react'; // Přidej ikonku

interface Props {
    vstup: string;
    setVstup: (v: string) => void;
    naseptavacProdukty: ProduktDefinice[];
    vybranyProdukt: ProduktDefinice | null;
    onVybratZNaspetavace: (p: ProduktDefinice) => void;

    // Přidáme funkci pro výběr "vlastní" položky
    onVybratVlastni: () => void;

    pocet: number;
    setPocet: (n: number) => void;
    jednotka: string;
    setJednotka: (s: string) => void;
    aktivniStitky: string[];
    toggleStitek: (s: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ProductForm = ({
    vstup, setVstup, naseptavacProdukty, vybranyProdukt, onVybratZNaspetavace, onVybratVlastni,
    pocet, setPocet, jednotka, setJednotka, aktivniStitky, toggleStitek,
    onConfirm, onCancel
}: Props) => {

    // Zjistíme, jestli uživatel píše něco, co není vybrané
    const isCustomMode = vstup.length > 0 && !vybranyProdukt;

    return (
        <div className="form-wrapper">
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Co hledáš? (začni psát...)"
                    value={vstup}
                    onChange={(e) => setVstup(e.target.value)}
                    className="main-input"
                    // Pokud už je vybráno, zablokujeme psaní (nebo resetujeme výběr při změně)
                    disabled={!!vybranyProdukt}
                />

                {/* A) NAŠEPTÁVAČ (Známé produkty) */}
                {naseptavacProdukty.length > 0 && !vybranyProdukt && (
                    <div className="suggestions-dropdown">
                        {naseptavacProdukty.map(prod => (
                            <div key={prod.id} className="suggestion-item" onClick={() => onVybratZNaspetavace(prod)}>
                                {prod.icon} {prod.nazev}
                            </div>
                        ))}
                    </div>
                )}

                {/* B) FALLBACK (Vlastní položka) - Zobrazí se, když nic nenajdeme */}
                {naseptavacProdukty.length === 0 && isCustomMode && (
                    <div className="suggestions-dropdown">
                        <div className="suggestion-item create-new" onClick={onVybratVlastni}>
                            <PlusCircle size={18} style={{ marginRight: 8, color: '#2563eb' }} />
                            Vytvořit: <strong>"{vstup}"</strong>
                        </div>
                    </div>
                )}
            </div>

            {/* DETAIL PANEL (Zobrazí se, když je vybrán produkt - pravý i levý) */}
            {vybranyProdukt && (
                <div className="details-panel">

                    {/* --- ZDE JSEM VRÁTIL ŠTÍTKY --- */}
                    {/* Zobrazí se jen pokud produkt nějaké štítky má (Vlastní produkt je nemá, tak se to skryje) */}
                    {vybranyProdukt.stitky && vybranyProdukt.stitky.length > 0 && (
                        <div className="tags-container">
                            <span className="tags-label">Upřesnit:</span>
                            <div className="tags-list">
                                {vybranyProdukt.stitky.map(stitek => (
                                    <button
                                        key={stitek}
                                        type="button"
                                        className={`tag-btn ${aktivniStitky.includes(stitek) ? 'active' : ''}`}
                                        onClick={() => toggleStitek(stitek)}
                                    >
                                        {stitek}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="amount-row">
                        <input
                            type="number"
                            min="1" step="1"
                            value={pocet}
                            onChange={e => setPocet(parseFloat(e.target.value))}
                            className="amount-input"
                        />

                        {/* --- ZJEDNODUŠENÝ VÝBĚR JEDNOTEK --- */}
                        {/* Nemusíme řešit podmínky, protože i ten 'falešný' produkt má seznam jednotek */}
                        <select
                            value={jednotka}
                            onChange={e => setJednotka(e.target.value)}
                            className="unit-select"
                        >
                            {vybranyProdukt.mozneJednotky.map(u => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>

                        <button onClick={onConfirm} className="confirm-add-btn">
                            {vybranyProdukt.id === 'custom-item' ? 'Vytvořit' : 'Vložit'}
                        </button>

                        <button onClick={onCancel} className="cancel-btn">Zrušit</button>
                    </div>
                </div>
            )}
        </div>
    );
};