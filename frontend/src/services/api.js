const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Function to load the agent
export async function loadAgent(agentName) {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/${agentName}/load`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error loading agent:", error);
    throw error;
  }
}

// Function to retry an operation with retries
async function retryOperation(operation, maxRetries = 3, delay = 2000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`Attempt ${attempt} failed: ${error.message}`);
      lastError = error;

      // If it's a timeout (504), wait and try again
      if (error.message.includes("504") || error.message.includes("timeout")) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        // Increase delay for next attempt
        delay = delay * 1.5;
      } else {
        // If not timeout, don't retry
        throw error;
      }
    }
  }

  throw lastError;
}

export async function analyzeBehavior(behaviorData) {
  try {
    await loadAgent("mentalhealthai");

    const makeRequest = async () => {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
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

export async function getAnalysisByHash(userId, txHash) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/user/responses/${userId}?tx_hash=${txHash}`
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

// Function to submit habit feedback
export async function submitHabitFeedback(feedbackData) {
  try {
    const response = await fetch(`${API_BASE_URL}/habits/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        habit_id: feedbackData.habitId,
        patient_id: feedbackData.patientId,
        effectiveness: feedbackData.effectiveness,
        feedback: feedbackData.feedback,
        implementation_duration: feedbackData.implementationDuration || 0,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting habit feedback:", error);
    throw error;
  }
}

// Function to get collective insights
export async function getCollectiveInsights() {
  try {
    const response = await fetch(`${API_BASE_URL}/habits/insights`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "success" && data.insights) {
      return {
        averageEffectiveness: data.insights.averageEffectiveness,
        topHabits: data.insights.topHabits || [],
        totalFeedbackCount: data.insights.totalFeedbackCount,
        lastUpdated: data.insights.lastUpdated,
        alloraInference: data.insights.allora_inference,
        message: data.insights.message,
      };
    }

    throw new Error("Failed to get insights from server");
  } catch (error) {
    console.error("Error fetching insights:", error);
    throw error;
  }
}

// Function to update habit completion status
export async function updateHabitStatus(habitId, userId, completed) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/habits/${habitId}?user_id=${userId}&completed=${completed}`,
      {
        method: "PATCH",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating habit status:", error);
    throw error;
  }
}

// Function to get habit progress for a user
export async function getHabitProgress(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/habits/progress/${userId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching habit progress:", error);
    throw error;
  }
}
