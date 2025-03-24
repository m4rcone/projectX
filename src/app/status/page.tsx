"use client";
import useSWR from "swr";

type ResponseAPI = {
  updated_at: string;
  dependencies: {
    database: {
      version: string;
      max_connections: number;
      opened_connections: number;
    };
  };
};

export default function Page() {
  const { data, error, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText: string | undefined,
    versionText: string | undefined,
    maxConnectionsText: string | undefined,
    openedConnectionsText: string | undefined;

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
    versionText = data.dependencies.database.version;
    maxConnectionsText = data.dependencies.database.max_connections.toString();
    openedConnectionsText =
      data.dependencies.database.opened_connections.toString();
  }

  return (
    <>
      <h1>Status:</h1>
      {isLoading ? (
        <div>Carregando...</div>
      ) : error ? (
        <div>{error.message}</div>
      ) : (
        <div>Última atualização: {updatedAtText}</div>
      )}
      <h2>Banco de dados:</h2>
      {isLoading ? (
        <div>Carregando...</div>
      ) : error ? (
        <div>{error.message}</div>
      ) : (
        <>
          <div>Versão do Postgres: {versionText}</div>
          <div>
            Conexões abertas: {openedConnectionsText} / {maxConnectionsText}
          </div>
        </>
      )}
    </>
  );
}

async function fetchAPI(key: string): Promise<ResponseAPI> {
  const response = await fetch(key);
  if (!response.ok) {
    throw new Error(`🔴 ${response.status} / Erro ao carregar dados.`);
  }
  const responseBody = await response.json();

  return responseBody;
}
