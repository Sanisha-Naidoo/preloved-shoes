
import React, { useEffect, useState } from "react";

// Optionally: Implement a GET endpoint on the edge function for secure proxying
const NOTION_DB_ID = ""; // Not required here, as we'll call Notion API via function

type NotionShoe = {
  id: string;
  Brand?: string;
  Model?: string;
  Size?: string;
  Condition?: string;
  // Add more properties if needed
};

const NOTION_TOKEN = undefined; // Never expose real API key!
const NOTION_VERSION = "2022-06-28";

// Simple public DEMO: the secure way is to proxy through an edge function!

const fetchNotionShoes = async () => {
  const res = await fetch("/api/notion-shoes"); // See note: you should proxy through an edge function
  if (!res.ok) throw new Error("Failed to fetch Notion data");
  return await res.json();
};

export const NotionShoeList: React.FC = () => {
  const [shoes, setShoes] = useState<NotionShoe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // DEMO: This should call your own edge function!
    fetchNotionShoes()
      .then((data) => setShoes(data))
      .catch((e) => {
        setShoes([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading Notion shoes…</div>;
  if (!shoes.length) return <div>No shoes found in Notion database.</div>;
  return (
    <div>
      <h2 className="font-bold text-xl my-4">Shoes in Notion Database</h2>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
