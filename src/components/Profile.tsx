import { useAuth } from '@/context/AuthContext';

export default function Profile() {
  const { columnPreferences, setColumnPreferences, resetColumnPreferences } = useAuth();

  return (
    <div>
      <h2>Configuración de columnas</h2>
      {Object.entries(columnPreferences).map(([key, cols]) => (
        <div key={key}>
          <h4>{key}</h4>
          {(cols as string[]).map(col => (
            <div key={col}>
              <input type="checkbox" checked readOnly /> {col}
            </div>
          ))}
        </div>
      ))}
      <button onClick={resetColumnPreferences}>Resetear a valores por defecto</button>
    </div>
  );
} 