import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Example as AnimatedCheck } from './AnimatedCheck'

export function HabitsTracker() {
    const navigate = useNavigate()
    const [habits, setHabits] = useState([])
    const [expandedHabit, setExpandedHabit] = useState(null)
    const [selectedDay, setSelectedDay] = useState(new Date().getDay())
    const [dailyReflections, setDailyReflections] = useState({})
    const [isReflectionExpanded, setIsReflectionExpanded] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [blockchainTx, setBlockchainTx] = useState(null)

    useEffect(() => {
        function loadHabits() {
            try {
                const patientId = localStorage.getItem('patientId')
                const analysisResults = localStorage.getItem('analysisResults')

                if (!patientId || !analysisResults) {
                    navigate('/form')
                    return
                }

                const parsedResults = JSON.parse(analysisResults)
                setBlockchainTx(parsedResults.txHash)

                // Função auxiliar para extrair hábitos do texto
                const extractHabits = (text) => {
                    if (!text) {
                        console.warn("No habits text provided")
                        return []
                    }

                    // Remove qualquer texto antes da seção de hábitos
                    const habitsSection = text.split(/Habits:\s*\n/i)[1] || text

                    // Remove qualquer texto conclusivo
                    const habitsOnly = habitsSection.split(/These habits|Remember,/i)[0]

                    // Tenta diferentes padrões para separar os hábitos
                    let habits = []
                    const patterns = [
                        /\d+\.\s+\*\*[^*]+\*\*/g,    // 1. **Título**
                        /\d+\.\s+[^*\n]+/g,          // 1. Título
                        /\*\*[^*]+\*\*/g,            // **Título**
                        /[-•]\s+[^\n]+/g             // - Título ou • Título
                    ]

                    // Tenta cada padrão até encontrar hábitos
                    for (const pattern of patterns) {
                        const matches = habitsOnly.match(pattern)
                        if (matches && matches.length > 0) {
                            // Divide o texto usando o padrão encontrado
                            const sections = habitsOnly.split(pattern)
                            // Combina os matches com as seções correspondentes
                            habits = matches.map((match, index) => ({
                                title: match,
                                content: sections[index + 1] || ''
                            }))
                            break
                        }
                    }

                    // Se nenhum padrão funcionou, tenta dividir por números ou traços
                    if (habits.length === 0) {
                        const sections = habitsOnly.split(/(?:\d+\.|[-•])\s+/).filter(Boolean)
                        habits = sections.map(section => ({
                            title: '',
                            content: section
                        }))
                    }

                    return habits.map(({ title, content }, index) => {
                        // Limpa o título
                        let cleanTitle = title
                            .replace(/^\d+\.\s*/, '')  // Remove numeração
                            .replace(/\*\*/g, '')      // Remove asteriscos
                            .trim()

                        // Procura por Description, Implementation e Scientific Basis
                        const descriptionMatch = content.match(/Description:\s*([^\n]+)/)
                        const implementationMatch = content.match(/Implementation:[\s\S]*?(?=Scientific Basis:|$)/)
                        const scientificMatch = content.match(/Scientific Basis:\s*([^\n]+)/)

                        // Extrai descrição
                        const description = descriptionMatch ?
                            descriptionMatch[1].trim() :
                            'No description provided'

                        // Extrai implementação
                        let implementation = ''
                        if (implementationMatch) {
                            implementation = implementationMatch[0]
                                .replace(/Implementation:\s*/, '')
                                .split(/[-•]/)
                                .filter(step => step.trim())
                                .map(step => step.trim())
                                .join('\n\n• ')
                        }

                        // Extrai base científica
                        const scientific = scientificMatch ?
                            scientificMatch[1].trim() :
                            'No scientific basis provided'

                        return {
                            id: index + 1,
                            title: cleanTitle || `Habit ${index + 1}`,
                            description: description,
                            details: implementation ? `Implementation Steps:\n\n• ${implementation}` : description,
                            reference: {
                                title: `Scientific Basis: ${scientific}`,
                                publisher: ''
                            },
                            daysCompleted: []
                        }
                    })
                }

                if (parsedResults.habits) {
                    const habitsList = extractHabits(parsedResults.habits)
                        .filter(habit => habit.title && habit.title !== 'Habit')

                    if (habitsList.length > 0) {
                        setHabits(habitsList)
                        setError(null)
                    } else {
                        setError('Could not parse habits from the response')
                        navigate('/form')
                    }
                } else {
                    setError('No habits recommendations found')
                    navigate('/form')
                }
            } catch (err) {
                console.error('Error loading habits:', err)
                setError('Failed to load habits. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        loadHabits()
    }, [navigate])

    const daysOfWeek = [
        { name: 'Sun', index: 0 },
        { name: 'Mon', index: 1 },
        { name: 'Tue', index: 2 },
        { name: 'Wed', index: 3 },
        { name: 'Thu', index: 4 },
        { name: 'Fri', index: 5 },
        { name: 'Sat', index: 6 }
    ]

    const currentDay = new Date().getDay()
    const isCurrentDay = selectedDay === currentDay

    const toggleHabit = (habitId) => {
        setHabits(habits.map(habit => {
            if (habit.id === habitId) {
                const newDaysCompleted = habit.daysCompleted.includes(selectedDay)
                    ? habit.daysCompleted.filter(d => d !== selectedDay)
                    : [...habit.daysCompleted, selectedDay]
                return { ...habit, daysCompleted: newDaysCompleted }
            }
            return habit
        }))
    }

    const isCheckboxDisabled = (dayIndex) => {
        return dayIndex > currentDay
    }

    const handleReflectionChange = (e) => {
        setDailyReflections({
            ...dailyReflections,
            [selectedDay]: e.target.value
        })
    }

    const calculateDailyProgress = () => {
        const completedHabits = habits.filter(habit =>
            habit.daysCompleted.includes(selectedDay)
        ).length
        const totalHabits = habits.length
        const percentage = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0
        return Math.round(percentage)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-600 mb-4"></div>
                <p className="text-sky-800 font-medium">Loading your habits tracker...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-left">
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Habits</h3>
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
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-left">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-sky-800">Suggested Interventions</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Daily Progress:</span>
                    <span className={`font-semibold ${calculateDailyProgress() === 100
                        ? 'text-green-500'
                        : calculateDailyProgress() >= 50
                            ? 'text-sky-600'
                            : 'text-gray-700'
                        }`}>
                        {calculateDailyProgress()}%
                    </span>
                </div>
            </div>

            {/* Adiciona informação da blockchain */}
            {blockchainTx && (
                <div className="mb-6 p-3 bg-gray-50 rounded-md">
                    <details className="text-sm text-gray-600">
                        <summary className="cursor-pointer hover:text-sky-600 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Data Security Information
                        </summary>
                        <div className="mt-2 pl-6">
                            <p>Your analysis data is securely stored on the blockchain.</p>
                            <a
                                href={`https://testnet.sonicscan.org/tx/${blockchainTx}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-600 hover:text-sky-700 hover:underline mt-1 inline-block"
                            >
                                View transaction details →
                            </a>
                        </div>
                    </details>
                </div>
            )}

            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div className="overflow-x-auto pb-2 -mx-2 px-2">
                    <div className="flex space-x-2 min-w-max">
                        {daysOfWeek.map((day) => (
                            <button
                                key={day.index}
                                onClick={() => setSelectedDay(day.index)}
                                disabled={isCheckboxDisabled(day.index)}
                                className={`
                                    px-4 py-2 rounded-lg transition-colors
                                    ${selectedDay === day.index ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-700'}
                                    ${isCheckboxDisabled(day.index) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-500 hover:text-white'}
                                `}
                            >
                                {day.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {habits.map(habit => (
                    <div
                        key={habit.id}
                        className={`border rounded-lg p-4 transition-all duration-300 ${habit.daysCompleted.includes(selectedDay)
                            ? 'bg-sky-50 border-sky-600'
                            : 'border-gray-200'
                            }`}
                    >
                        <div className="flex items-start space-x-4">
                            <div className="flex items-center">
                                <AnimatedCheck
                                    isChecked={habit.daysCompleted.includes(selectedDay)}
                                    onCheck={() => toggleHabit(habit.id)}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-sky-800">{habit.title}</h3>
                                        <p className="text-sm text-gray-600">{habit.description}</p>
                                    </div>
                                    <button
                                        onClick={() => setExpandedHabit(expandedHabit === habit.id ? null : habit.id)}
                                        className="text-sm text-sky-600 hover:text-sky-700"
                                    >
                                        {expandedHabit === habit.id ? 'Show less' : 'Learn more'}
                                    </button>
                                </div>

                                {expandedHabit === habit.id && (
                                    <div className="mt-3 space-y-3">
                                        <div className="p-3 bg-sky-50 rounded-md">
                                            <p className="text-sm text-gray-700 whitespace-pre-line">
                                                {habit.details}
                                            </p>
                                        </div>
                                        {habit.reference && (
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <p className="text-xs text-gray-500 mb-1">Scientific Reference:</p>
                                                <p className="text-sm text-gray-700">
                                                    {habit.reference.title}
                                                </p>
                                                {habit.reference.publisher && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Published in: {habit.reference.publisher}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
                <button
                    onClick={() => setIsReflectionExpanded(!isReflectionExpanded)}
                    className="w-full flex items-center justify-between text-left mb-4"
                >
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-sky-800">Evening Reflection</h3>
                        <span className="text-sm text-gray-500">
                            {isCurrentDay && "(Fill this in before going to bed tonight)"}
                        </span>
                    </div>
                    <svg
                        className={`w-5 h-5 text-sky-600 transform transition-transform duration-300 ease-in-out ${isReflectionExpanded ? 'rotate-180' : ''
                            }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isReflectionExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <label className="block text-gray-700 font-medium">
                                How did you feel today?
                            </label>
                            {isCurrentDay && (
                                <span className="text-sm text-sky-600">
                                    🌙 Complete this before bedtime
                                </span>
                            )}
                        </div>
                        <textarea
                            value={dailyReflections[selectedDay] || ''}
                            onChange={handleReflectionChange}
                            disabled={!isCurrentDay}
                            placeholder={isCurrentDay
                                ? "Take a moment before bed to reflect on your day. How did your habits impact your well-being today?"
                                : "This reflection should have been completed at the end of this day"
                            }
                            className={`w-full p-3 border rounded-md focus:ring-sky-500 focus:border-sky-500
                                ${!isCurrentDay ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                            `}
                            rows="4"
                        />
                        {isCurrentDay && (
                            <div className="mt-2 p-3 bg-sky-50 rounded-md">
                                <p className="text-sm text-sky-800">
                                    <span className="font-medium">✨ Evening Reflection Tip:</span>
                                    <br />
                                    Taking a few minutes before bed to reflect on your day helps:
                                </p>
                                <ul className="mt-2 text-sm text-sky-700 list-disc list-inside">
                                    <li>Process your daily experiences</li>
                                    <li>Recognize your achievements</li>
                                    <li>Identify areas for improvement</li>
                                    <li>Set intentions for tomorrow</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
} 