
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type NotionShoe = {
  id: string;
  Brand?: string;
  Model?: string;
  Size?: string;
  Condition?: string;
};

const fetchNotionShoes = async () => {
  const { data, error } = await supabase.functions.invoke('notion-shoes');
  if (error) throw new Error(`Failed to fetch shoe data: ${error.message}`);
  return data;
};

export const NotionShoeList: React.FC = () => {
  const [shoes, setShoes] = useState<NotionShoe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotionShoes()
      .then((data) => {
        setShoes(data);
        setError(null);
      })
      .catch((e) => {
        console.error('Failed to fetch shoes:', e);
        setShoes([]);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center p-4">Loading shoes from database…</div>;
  if (error) return <div className="text-center p-4 text-red-600">Error: {error}</div>;
  if (!shoes.length) return <div className="text-center p-4">No shoes found in database.</div>;
  return (
    <div>
      <h2 className="font-bold text-xl my-4">Shoes in Database ({shoes.length})</h2>
      <table className="min-w-full table-auto border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Brand</th>
            <th className="border px-2 py-1">Model</th>
            <th className="border px-2 py-1">Size</th>
            <th className="border px-2 py-1">Condition</th>
          </tr>
        </thead>
        <tbody>
          {shoes.map((shoe) => (
            <tr key={shoe.id}>
              <td className="border px-2 py-1">{shoe.Brand}</td>
              <td className="border px-2 py-1">{shoe.Model}</td>
              <td className="border px-2 py-1">{shoe.Size}</td>
              <td className="border px-2 py-1">{shoe.Condition}</td>
              {/* barcode removed */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
