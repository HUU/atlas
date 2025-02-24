import { apiClient } from '@/api';
import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home(): React.JSX.Element {
  const { data } = apiClient.healthz.useQuery({
    queryKey: ['healthz'],
  });
  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <h2>
        {data?.status} - {data?.body.message}
      </h2>
    </>
  );
}
