import { useState, useEffect } from 'react';
import { getCollectiveInsights } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Simple Rating component using Tailwind
const Rating = ({ value, readOnly = true }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <svg
                key={i}
                className={`w-5 h-5 ${i <= value ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        );
    }
    return <div className="flex">{stars}</div>;
};

const InsightsPage = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                const data = await getCollectiveInsights();
                setInsights(data);
                setError(null);
            } catch (err) {
                setError('Failed to load insights. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <h2 className="text-xl font-semibold mt-4">
                    Loading collective insights...
                </h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    if (!insights || insights.totalFeedbackCount === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">
                        No collective insights available yet. Be the first to contribute by providing feedback on your habits!
                    </span>
                </div>
            </div>
        );
    }

    // Prepare data for chart
    const chartData = insights.topHabits.map(habit => ({
        name: habit.habit_id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        effectiveness: parseFloat(habit.average.toFixed(2)),
        count: habit.count
    }));

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">
                Collective Habit Insights
            </h1>

            <p className="text-gray-600 mb-6">
                Powered by Allora Network
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Summary Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Summary
                    </h2>
                    <div className="flex items-center mb-3">
                        <span className="mr-2">Average Effectiveness:</span>
                        <Rating value={insights.averageEffectiveness} />
                        <span className="ml-2">
                            ({insights.averageEffectiveness.toFixed(2)})
                        </span>
                    </div>
                    <p className="mb-3">
                        Total Feedback Count: {insights.totalFeedbackCount}
                    </p>
                    <p className="text-sm text-gray-500">
                        Last Updated: {new Date(insights.lastUpdated).toLocaleString()}
                    </p>
                </div>

                {/* Allora Inference Card */}
                <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">
                        Allora Network Inference
                    </h2>
                    {insights.alloraInference ? (
                        <div>
                            <p className="mb-4">{typeof insights.alloraInference === 'number' ? insights.alloraInference.toFixed(2) : parseFloat(insights.alloraInference).toFixed(2)}</p>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <span className="font-medium">What is this?</span> The Allora Network uses decentralized AI to analyze collective habit data.
                                    This inference represents an AI-generated insight based on all user feedback, identifying patterns
                                    and effectiveness trends across different habits and implementation approaches.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">
                            No Allora inference available for this topic yet. As more users contribute feedback,
                            the Allora Network will generate AI-powered insights about habit effectiveness patterns.
                        </p>
                    )}
                </div>
            </div>

            {/* Effectiveness Chart */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    Habit Effectiveness Comparison
                </h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 5]} />
                            <Tooltip formatter={(value) => value.toFixed(2)} />
                            <Bar dataKey="effectiveness" fill="#3B82F6" name="Effectiveness (1-5)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                    This chart shows the average effectiveness rating (scale of 1-5) for each habit based on user feedback.
                    Higher values indicate habits that users found more effective for improving mental wellbeing.
                </p>
            </div>

            {/* Top Habits */}
            <h2 className="text-2xl font-bold mt-8 mb-4">
                Top Habits by Effectiveness
            </h2>

            {insights.topHabits.map((habit, index) => (
                <div key={habit.habit_id} className="bg-white rounded-lg shadow-md p-6 mb-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">
                            {index + 1}. {habit.habit_id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <div className="flex items-center">
                            <Rating value={habit.average} />
                            <span className="ml-2">
                                ({habit.average.toFixed(2)})
                            </span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 mt-2">
                        Based on {habit.count} user {habit.count === 1 ? 'report' : 'reports'}
                    </p>

                    <hr className="my-4" />

                    <h4 className="font-medium mb-2">
                        User Feedback:
                    </h4>

                    <div className="flex flex-wrap gap-2">
                        {habit.feedbacks.map((feedback, i) => (
                            feedback ? (
                                <span
                                    key={i}
                                    className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700"
                                >
                                    {feedback.length > 50 ? `${feedback.substring(0, 50)}...` : feedback}
                                </span>
                            ) : null
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InsightsPage; 