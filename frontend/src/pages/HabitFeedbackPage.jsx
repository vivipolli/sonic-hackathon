import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitHabitFeedback } from '../services/api';

// Simple Rating component using Tailwind
const Rating = ({ value, onChange }) => {
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    className="focus:outline-none"
                >
                    <svg
                        className={`w-8 h-8 ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
        </div>
    );
};

const HabitFeedbackPage = () => {
    const navigate = useNavigate();
    const [habitOptions, setHabitOptions] = useState([]);
    const [formData, setFormData] = useState({
        habitId: '',
        patientId: localStorage.getItem('userId') || '',
        effectiveness: 3,
        feedback: '',
        implementationDuration: 7
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Carregar hábitos do localStorage (mesma lógica do HabitsTracker)
        try {
            const analysisResults = localStorage.getItem('analysisResults');

            if (analysisResults) {
                const parsedResults = JSON.parse(analysisResults);

                if (parsedResults.habits) {
                    const habitsList = parsedResults.habits
                        .split(/\d+\.\s+\*\*/)
                        .slice(1)
                        .map((habitText, index) => {
                            const title = habitText.match(/^([^*]+)/)?.[1]?.trim() || '';

                            if (!title) return null;

                            // Criar um ID baseado no título para consistência
                            const habitId = title.toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/(^-|-$)/g, '');

                            return {
                                id: habitId,
                                label: title
                            };
                        })
                        .filter(Boolean); // Remove itens nulos

                    setHabitOptions(habitsList);
                }
            }
        } catch (err) {
            console.error('Error loading habits from localStorage:', err);
            // Fallback para a lista padrão se houver erro
            setHabitOptions([
                { id: 'meditation-morning', label: 'Morning Meditation' },
                { id: 'daily-exercise', label: 'Daily Exercise' },
                { id: 'healthy-eating', label: 'Healthy Eating' },
                { id: 'journaling', label: 'Journaling' },
                { id: 'gratitude-practice', label: 'Gratitude Practice' },
                { id: 'deep-breathing', label: 'Deep Breathing Exercises' },
                { id: 'social-connection', label: 'Social Connection' },
                { id: 'nature-time', label: 'Time in Nature' },
                { id: 'sleep-routine', label: 'Consistent Sleep Routine' },
                { id: 'digital-detox', label: 'Digital Detox' },
            ]);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingChange = (newValue) => {
        setFormData(prev => ({ ...prev, effectiveness: newValue }));
    };

    const handleDurationChange = (e) => {
        setFormData(prev => ({ ...prev, implementationDuration: parseInt(e.target.value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.patientId) {
                formData.patientId = `anonymous-${Date.now()}`;
            }

            await submitHabitFeedback(formData);
            setSuccess(true);

            // Reset form after successful submission
            setTimeout(() => {
                setFormData({
                    habitId: '',
                    patientId: localStorage.getItem('userId') || '',
                    effectiveness: 3,
                    feedback: '',
                    implementationDuration: 7
                });
                setSuccess(false);
            }, 3000);

        } catch (err) {
            setError('Failed to submit feedback. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold mb-4">
                    Share Your Habit Experience
                </h1>

                <p className="text-gray-600 mb-6">
                    Your feedback helps others understand which habits are most effective for mental health improvement.
                    All data is anonymized and aggregated to provide collective insights.
                </p>

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
                        <span className="block sm:inline">
                            Thank you for your feedback! Your contribution helps improve our collective understanding.
                        </span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="habitId">
                            Select Habit
                        </label>
                        <select
                            id="habitId"
                            name="habitId"
                            value={formData.habitId}
                            onChange={handleChange}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                            <option value="">-- Select a habit --</option>
                            {habitOptions.map(option => (
                                <option key={option.id} value={option.id}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-6">
                        <p className="block text-gray-700 text-sm font-bold mb-2">
                            How effective was this habit for your mental wellbeing?
                        </p>
                        <div className="flex items-center">
                            <span className="mr-4 text-gray-600">Not Effective</span>
                            <Rating
                                value={formData.effectiveness}
                                onChange={handleRatingChange}
                            />
                            <span className="ml-4 text-gray-600">Very Effective</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            How long have you been practicing this habit? ({formData.implementationDuration} days)
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="90"
                            value={formData.implementationDuration}
                            onChange={handleDurationChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>1 day</span>
                            <span>30 days</span>
                            <span>60 days</span>
                            <span>90 days</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="feedback">
                            Your Experience (optional)
                        </label>
                        <textarea
                            id="feedback"
                            name="feedback"
                            rows="4"
                            value={formData.feedback}
                            onChange={handleChange}
                            placeholder="Share how this habit affected your mental health, any challenges you faced, or tips for others..."
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        ></textarea>
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => navigate('/insights')}
                            disabled={loading}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            View Collective Insights
                        </button>

                        <button
                            type="submit"
                            disabled={loading || !formData.habitId}
                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${(loading || !formData.habitId) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : 'Submit Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HabitFeedbackPage; 