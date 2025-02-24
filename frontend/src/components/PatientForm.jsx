import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function PatientForm() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        // Section 1: Behavior Analysis
        behavior: '',
        behaviorExample: '',
        antecedent: '',
        antecedentExample: '',
        consequence: '',
        benefits: '',

        // Section 2: Coping Strategies
        previousAttempts: '',
        attemptsResults: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            // Aqui você faria a chamada para o backend
            // const response = await api.post('/analyze-behavior', formData)

            // Simulando uma chamada bem-sucedida ao backend
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Redireciona para a página de hábitos
            navigate('/habits')
        } catch (error) {
            console.error('Error submitting form:', error)
            // Aqui você pode adicionar tratamento de erro, como mostrar uma mensagem para o usuário
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-left">
            <h2 className="text-2xl font-bold text-sky-800 mb-6">Behavioral Analysis Form</h2>

            {/* Section 1: Behavior Analysis */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-sky-700 mb-4">Section 1: Behavior Analysis</h3>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        1. Behavior - What behavior would you like to analyze?
                        <span className="text-sm text-gray-500 block">Be specific and describe what you do, think, or feel.</span>
                    </label>
                    <textarea
                        name="behavior"
                        value={formData.behavior}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                        rows="3"
                        placeholder="Example: 'Nail biting when I'm nervous.'"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        2. Antecedent - In what situations, environments, or moments does this behavior occur most frequently?
                        <span className="text-sm text-gray-500 block">Provide a concrete example.</span>
                    </label>
                    <textarea
                        name="antecedent"
                        value={formData.antecedent}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                        rows="3"
                        placeholder="Example: 'When working on a difficult project, waiting in line, or watching TV feeling anxious.'"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        3. Consequence - What happens after you exhibit this behavior and what benefits do you feel?
                        <span className="text-sm text-gray-500 block">Describe both immediate and long-term consequences.</span>
                    </label>
                    <textarea
                        name="consequence"
                        value={formData.consequence}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                        rows="3"
                        placeholder="Example: 'I feel momentary relief from anxiety, but later feel guilty and ashamed about biting my nails.'"
                    />
                </div>
            </div>

            {/* Section 2: Coping Strategies */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-sky-700 mb-4">Section 2: Coping Strategies</h3>

                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                        1. Have you tried any ways to deal with this behavior? If so, what did you do?
                    </label>
                    <textarea
                        name="previousAttempts"
                        value={formData.previousAttempts}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                        rows="3"
                        placeholder="Example: 'I tried using bitter nail polish but it didn't work. I also tried keeping my hands busy with a stress ball, but that didn't help either.'"
                    />
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors shadow-sm"
            >
                Submit Analysis
            </button>
        </form>
    )
} 