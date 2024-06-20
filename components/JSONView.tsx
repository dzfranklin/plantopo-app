'use client';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';

export default function JSONView({ data }: { data: unknown }) {
  return (
    <div className="m-4">
      <JsonView src={data} />
    </div>
  );
}
