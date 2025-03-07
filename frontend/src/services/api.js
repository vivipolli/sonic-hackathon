// Função para carregar o agente
export async function loadAgent(agentName) {
  try {
    const response = await fetch(
      `http://localhost:8000/agents/${agentName}/load`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error loading agent:", error);
    throw error;
  }
}

// Função para tentar uma operação com retentativas
async function retryOperation(operation, maxRetries = 3, delay = 2000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`Attempt ${attempt} failed: ${error.message}`);
      lastError = error;

      // Se for um timeout (504), espere e tente novamente
      if (error.message.includes("504") || error.message.includes("timeout")) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        // Aumenta o delay para a próxima tentativa
        delay = delay * 1.5;
      } else {
        // Se não for timeout, não tente novamente
        throw error;
      }
    }
  }

  // Se chegou aqui, todas as tentativas falharam
  throw lastError;
}

export async function analyzeBehavior(behaviorData) {
  try {
    // Primeiro, carrega o agente
    await loadAgent("mentalhealthai");

    // Função que faz a requisição
    const makeRequest = async () => {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_behavior: behaviorData.behavior,
          trigger_situations: behaviorData.antecedent,
          consequences: behaviorData.consequence,
          previous_attempts: behaviorData.previousAttempts || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail?.[0]?.msg || `HTTP error! status: ${response.status}`
        );
      }

      return response.json();
    };

    // Tenta fazer a requisição com retentativas
    const data = await retryOperation(makeRequest);

    if (data.status === "success" && data.analysis) {
      const [generalAnalysis, habitsSection] = data.analysis.split("Habits:");

      return {
        generalAnalysis: generalAnalysis.replace("GENERAL:", "").trim(),
        habits: habitsSection ? habitsSection.trim() : "",
        message: data.message,
      };
    } else {
      throw new Error("Failed to get analysis from server");
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
