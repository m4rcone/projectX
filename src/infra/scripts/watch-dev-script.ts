const { spawn } = require("child_process");

// Executa o script dev:run
spawn("npm", ["run", "dev:run"], {
  stdio: "inherit", // Permite ver os logs no terminal
  shell: true, // Permite que o comando seja interpretado pelo shell do sistema operacional
});

// Captura SIGINT (Ctrl+C)
process.on("SIGINT", () => {
  cleanup();
});

// Captura SIGINT (Ctrl+C)
function cleanup() {
  console.log("\n\n🔵 Executando postdev...");

  // Executa o script postdev
  const postdevProcess = spawn("npm", ["run", "postdev"], {
    stdio: "inherit",
    shell: true,
  });

  // Aguarda o script posdev encerrar escutando o evento de exit
  postdevProcess.on("exit", (code) => {
    process.exit(code ?? 0); // Sai com o mesmo código de saída de postdev
  });
}
