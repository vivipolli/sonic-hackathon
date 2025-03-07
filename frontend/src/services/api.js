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
    await loadAgent("mentalhealthai");

    const makeRequest = async () => {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: behaviorData.user_id,
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

    const data = await retryOperation(makeRequest);

    if (data.status === "success") {
      // Extrair o hash da blockchain_tx
      const txHash = data.blockchain_tx?.match(/0x[a-fA-F0-9]{64}/)?.[0];

      if (data.analysis) {
        const [generalAnalysis, habitsSection] = data.analysis.split("Habits:");
        return {
          generalAnalysis: generalAnalysis.replace("GENERAL:", "").trim(),
          habits: habitsSection ? habitsSection.trim() : "",
          message: data.message,
          txHash: txHash,
          user_responses: data.user_responses,
          timestamp: new Date().toISOString(),
        };
      }
    }
    throw new Error("Failed to get analysis from server");
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// Função para buscar análise por hash
export async function getAnalysisByHash(userId, txHash) {
  try {
    const response = await fetch(
      `http://localhost:8000/user/responses/${userId}?tx_hash=${txHash}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "success" && data.responses?.[0]?.data) {
      const analysisData = data.responses[0].data;
      const [generalAnalysis, habitsSection] =
        analysisData.analysis.split("Habits:");

      return {
        generalAnalysis: generalAnalysis.replace("GENERAL:", "").trim(),
        habits: habitsSection ? habitsSection.trim() : "",
        user_responses: analysisData.responses,
        txHash: data.responses[0].tx_hash,
        timestamp: analysisData.timestamp,
      };
    }

    throw new Error("No analysis data found");
  } catch (error) {
    console.error("Error fetching analysis:", error);
    throw error;
  }
}
