import { useState, useEffect } from 'react';
import { getWithCookie } from '../api';
import { useNavigate } from 'react-router-dom';

const MealHistoryPage = () => {
    const navigate = useNavigate();
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMeal, setSelectedMeal] = useState(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await getWithCookie('/api/nutrition/history');
            setMeals(res.history || []);
        } catch (err) {
            console.error("Failed to load history", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen p-6 pb-24" style={{ background: "linear-gradient(135deg, #EEF5E0 0%, #EAF0F8 45%, #F3EEF5 100%)" }}>

            <div className="max-w-4xl mx-auto z-10 relative">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black" style={{ color: "#1A1A18" }}>
                        Meal History
                    </h1>
                    <button
                        onClick={() => navigate('/nutrition')}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors active:scale-95"
                        style={{ background: "rgba(26,26,24,0.06)", color: "rgba(26,26,24,0.65)", border: "1px solid rgba(26,26,24,0.10)" }}
                    >
                        Back to Daily Plan
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "rgba(202,219,0,0.30)", borderTopColor: "transparent" }} />
                    </div>
                ) : meals.length === 0 ? (
                    <div className="glass-card rounded-3xl p-12 text-center">
                        <p className="mb-4" style={{ color: "rgba(26,26,24,0.55)" }}>No meal plans generated yet.</p>
                        <button
                            onClick={() => navigate('/nutrition')}
                            className="px-6 py-3 rounded-2xl font-bold active:scale-95 transition-all"
                            style={{ background: "linear-gradient(135deg, #CADB00 0%, #B8C900 100%)", color: "#1A1A18" }}
                        >
                            Generate Today's Plan
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {meals.map(meal => (
                            <div
                                key={meal._id}
                                onClick={() => setSelectedMeal(meal)}
                                className="glass-card p-5 rounded-2xl cursor-pointer hover:shadow-md active:scale-[0.98] transition-all group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-mono" style={{ color: "rgba(26,26,24,0.45)" }}>{formatDate(meal.date)}</span>
                                    <span className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ background: "rgba(202,219,0,0.12)", color: "#5A6000" }}>
                                        {meal.plan.total_calories} kcal
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-1" style={{ color: "#1A1A18" }}>
                                    Daily Nutrition Plan
                                </h3>
                                <div className="flex gap-4 text-sm mb-4" style={{ color: "rgba(26,26,24,0.50)" }}>
                                    <span>🥩 {meal.plan.total_protein}</span>
                                    <span>🗓 {new Date(meal.date).toLocaleDateString('en-US', { weekday: 'long' })}</span>
                                </div>
                                <div className="text-xs" style={{ color: "rgba(26,26,24,0.40)" }}>
                                    Breakfast, Lunch, Dinner {meal.plan.snacks?.length > 0 && `+ ${meal.plan.snacks.length} Snacks`}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedMeal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: "rgba(26,26,24,0.35)" }}>
                    <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-fadeIn"
                        style={{ background: "white", border: "1px solid rgba(26,26,24,0.10)" }}>
                        <div className="p-6 flex justify-between items-start" style={{ background: "rgba(26,26,24,0.03)", borderBottom: "1px solid rgba(26,26,24,0.08)" }}>
                            <div>
                                <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(26,26,24,0.40)" }}>Meal Plan Detail</div>
                                <h2 className="text-2xl font-bold mb-1" style={{ color: "#1A1A18" }}>{formatDate(selectedMeal.date)}</h2>
                            </div>
                            <button
                                onClick={() => setSelectedMeal(null)}
                                className="p-2 rounded-full active:scale-95 transition-all"
                                style={{ background: "rgba(26,26,24,0.06)" }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4">

                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <div className="rounded-2xl p-3" style={{ background: "rgba(26,26,24,0.04)", border: "1px solid rgba(26,26,24,0.08)" }}>
                                    <div className="text-xs mb-1" style={{ color: "rgba(26,26,24,0.45)" }}>Total Calories</div>
                                    <div className="text-xl font-bold" style={{ color: "#1A1A18" }}>{selectedMeal.plan.total_calories}</div>
                                </div>
                                <div className="rounded-2xl p-3" style={{ background: "rgba(202,219,0,0.08)", border: "1px solid rgba(202,219,0,0.20)" }}>
                                    <div className="text-xs mb-1" style={{ color: "rgba(26,26,24,0.45)" }}>Total Protein</div>
                                    <div className="text-xl font-bold" style={{ color: "#5A6000" }}>{selectedMeal.plan.total_protein}</div>
                                </div>
                            </div>

                            <MealDetailSection title="Breakfast" data={selectedMeal.plan.breakfast} />
                            <MealDetailSection title="Lunch" data={selectedMeal.plan.lunch} />
                            <MealDetailSection title="Dinner" data={selectedMeal.plan.dinner} />

                            {selectedMeal.plan.snacks?.map((snack, i) => (
                                <MealDetailSection key={i} title={`Snack ${i + 1}`} data={snack} />
                            ))}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

function MealDetailSection({ title, data }) {
    if (!data) return null;
    return (
        <div className="p-4 rounded-2xl" style={{ background: "rgba(26,26,24,0.03)", border: "1px solid rgba(26,26,24,0.08)" }}>
            <div className="flex justify-between items-baseline mb-2">
                <h3 className="font-semibold uppercase tracking-wider text-xs" style={{ color: "#CADB00" }}>{title}</h3>
                <span className="text-xs" style={{ color: "rgba(26,26,24,0.45)" }}>{data.calories} kcal</span>
            </div>

            <div className="font-bold text-lg mb-1" style={{ color: "#1A1A18" }}>{data.name}</div>
            <div className="text-sm mb-2" style={{ color: "rgba(26,26,24,0.55)" }}>{data.description}</div>

            <div className="flex gap-3 text-xs" style={{ color: "rgba(26,26,24,0.45)" }}>
                {data.protein && <span>P: <span style={{ color: "#1A1A18" }}>{data.protein}</span></span>}
                {data.carbs && <span>C: <span style={{ color: "#1A1A18" }}>{data.carbs}</span></span>}
                {data.fats && <span>F: <span style={{ color: "#1A1A18" }}>{data.fats}</span></span>}
            </div>
        </div>
    );
}

export default MealHistoryPage;

