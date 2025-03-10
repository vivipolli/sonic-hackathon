import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function AnalysisResult() {
    const [analysis, setAnalysis] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        function loadAnalysis() {
            try {
                const analysisResults = localStorage.getItem('analysisResults')
                const patientId = localStorage.getItem('patientId')

                if (!analysisResults || !patientId) {
                    navigate('/form')
                    return
                }

                const parsedResults = JSON.parse(analysisResults)

                // Verificar se temos pelo menos os hábitos
                if (!parsedResults.habits && !parsedResults.analysis) {
                    throw new Error('No analysis data available')
                }

                // Se temos analysis mas não habits, extrair habits do analysis
                if (parsedResults.analysis && !parsedResults.habits) {
                    const [generalAnalysis, habitsSection] = parsedResults.analysis.split("Habits:");

                    parsedResults.generalAnalysis = generalAnalysis.replace("GENERAL:", "").trim();
                    parsedResults.habits = habitsSection ? habitsSection.trim() : "";
                }

                // Se não tiver análise geral, criar uma mensagem padrão
                if (!parsedResults.generalAnalysis) {
                    parsedResults.generalAnalysis = "Based on your responses, we've developed a personalized set of habits to help you achieve your goals. These habits are designed to be practical, evidence-based, and tailored to your specific situation. Let's review the recommended habits and start implementing them in your daily routine."
                }

                setAnalysis(parsedResults)
            } catch (error) {
                console.error('Error loading analysis:', error)
                setError('Failed to load analysis. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        loadAnalysis()
    }, [navigate])

    const handleContinue = () => {
        navigate('/habits')
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-6 mt-8">
                <div className="bg-red-50 rounded-lg p-6">
                    <p className="text-red-700">{error}</p>
                    <button
                        onClick={() => navigate('/form')}
                        className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
                    >
                        Return to Form
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto p-6 mt-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-sky-800 mb-6">Your Behavioral Analysis</h2>

                <div className="prose prose-sky max-w-none">
                    <div className="bg-sky-50 rounded-lg p-6 mb-8">
                        <p className="text-gray-700 whitespace-pre-wrap">
                            {analysis?.generalAnalysis}
                        </p>
                    </div>

                    <div className="mt-4 p-4 bg-sky-50/50 rounded-lg">
                        <p className="text-sm text-sky-800">
                            <span className="font-medium">✨ Next Steps:</span> Review your personalized habit recommendations and start tracking your progress.
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleContinue}
                        className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                    >
                        Continue to Habit Recommendations →
                    </button>
                </div>
            </div>
        </div>
    )
} 