import { useState } from 'react'
import { mockHabits } from '../mocks/habitsData'
import { Example as AnimatedCheck } from './AnimatedCheck'

export function HabitsTracker() {
    const [habits, setHabits] = useState(mockHabits)
    const [expandedHabit, setExpandedHabit] = useState(null)
    const [selectedDay, setSelectedDay] = useState(new Date().getDay())
    const [dailyReflections, setDailyReflections] = useState({})
    const [isReflectionExpanded, setIsReflectionExpanded] = useState(false)

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
        const percentage = (completedHabits / totalHabits) * 100
        return Math.round(percentage)
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-left">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-sky-800">Weekly Habits Tracker</h2>
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

            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div className="flex space-x-2">
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
                                            <p className="text-sm text-gray-700">{habit.details}</p>
                                        </div>
                                        {habit.reference && (
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <p className="text-xs text-gray-500 mb-1">Scientific Reference:</p>
                                                <a
                                                    href={habit.reference.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-sky-600 hover:text-sky-800 hover:underline"
                                                >
                                                    {habit.reference.title}
                                                </a>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Published in: {habit.reference.publisher}
                                                </p>
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