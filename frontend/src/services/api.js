export async function analyzeBehavior(behaviorData) {
  try {
    const response = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_behavior: behaviorData.currentBehavior,
        trigger_situations: behaviorData.triggerSituations,
        consequences: behaviorData.consequences,
        previous_attempts: behaviorData.previousAttempts,
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
