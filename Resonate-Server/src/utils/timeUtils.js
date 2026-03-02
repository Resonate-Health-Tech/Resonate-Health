export const getMealTypeFromTime = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Breakfast';
    if (hour < 16) return 'Lunch';
    if (hour < 22) return 'Dinner';
    return 'Snack';
};
