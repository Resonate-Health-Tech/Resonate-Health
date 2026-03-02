const VALID_CATEGORIES = [
    'fitness.training',
    'fitness.daily_summary',
    'nutrition.intake',
    'recovery.sleep',
    'recovery.stress',
    'recovery.daily_log',
    'diagnostics.blood',
    'diagnostics.bca',
    'diagnostics.cgm',
    'intervention.plan',
    'intervention.outcome',
    'user.defined'
];

const VALID_SOURCES = [
    'user_input',
    'coach_input',
    'device_sync',
    'google_fit',
    'lab_import',
    'system_generated',
    'admin_manual'
];

const SOURCE_CONFIDENCE_MAP = {
    'user_input': 0.95,
    'coach_input': 0.95,
    'device_sync': 0.90,
    'lab_import': 1.0,
    'system_generated': 0.80
};

const CATEGORY_REQUIRED_FIELDS = {
    'fitness.training': ['workout_type', 'duration_mins', 'rpe'],
    'fitness.daily_summary': ['date', 'steps', 'sleep_hours', 'workout_count'],
    'nutrition.intake': ['meal_type', 'calories', 'plan_adherence'],
    'recovery.sleep': ['hours', 'quality_score'],
    'recovery.stress': ['stress_score'],
    'diagnostics.blood': ['test_date'],
    'diagnostics.bca': ['scan_date', 'weight_kg', 'body_fat_percent'],
    'diagnostics.cgm': ['period'],
    'intervention.plan': ['intervention_type', 'recommendation', 'start_date', 'status'],
    'intervention.outcome': ['intervention_id', 'intervention_type', 'outcome', 'completion_date']
};

class ValidationError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

export function validateCategory(category) {
    if (!category) {
        throw new ValidationError('Category is required', 'category');
    }
    if (!VALID_CATEGORIES.includes(category)) {
        throw new ValidationError(
            `Invalid category: ${category}. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
            'category'
        );
    }
    return true;
}

export function validateSource(source) {
    if (!source) {
        throw new ValidationError('Source is required', 'source');
    }
    if (!VALID_SOURCES.includes(source)) {
        throw new ValidationError(
            `Invalid source: ${source}. Must be one of: ${VALID_SOURCES.join(', ')}`,
            'source'
        );
    }
    return true;
}

export function validateConfidence(confidence) {
    if (confidence === undefined || confidence === null) {
        throw new ValidationError('Confidence score is required', 'confidence');
    }
    if (typeof confidence !== 'number') {
        throw new ValidationError('Confidence must be a number', 'confidence');
    }
    if (confidence < 0.0 || confidence > 1.0) {
        throw new ValidationError('Confidence must be between 0.0 and 1.0', 'confidence');
    }
    return true;
}

export function validateTimestamp(timestamp) {
    if (!timestamp) {
        throw new ValidationError('Timestamp is required', 'timestamp');
    }
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
        throw new ValidationError('Invalid timestamp format. Must be ISO 8601', 'timestamp');
    }
    return true;
}

export function validateTimezone(timezone) {
    if (!timezone) {
        throw new ValidationError('Timezone is required', 'timezone');
    }
    if (typeof timezone !== 'string' || timezone.trim().length === 0) {
        throw new ValidationError('Timezone must be a non-empty string', 'timezone');
    }
    return true;
}

export function validateCategorySpecificFields(category, moduleSpecific) {
    if (!moduleSpecific || typeof moduleSpecific !== 'object') {
        throw new ValidationError('module_specific is required and must be an object', 'module_specific');
    }

    const requiredFields = CATEGORY_REQUIRED_FIELDS[category];
    if (!requiredFields) {
        return true;
    }

    const missingFields = requiredFields.filter(field => !(field in moduleSpecific));
    if (missingFields.length > 0) {
        throw new ValidationError(
            `Missing required fields for category ${category}: ${missingFields.join(', ')}`,
            'module_specific'
        );
    }

    return true;
}

export function validateMemoryMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') {
        throw new ValidationError('Metadata must be an object');
    }

    validateTimestamp(metadata.timestamp);
    validateTimezone(metadata.timezone);
    validateCategory(metadata.category);
    validateSource(metadata.source);
    validateConfidence(metadata.confidence);
    validateCategorySpecificFields(metadata.category, metadata.module_specific);

    if (metadata.tags && !Array.isArray(metadata.tags)) {
        throw new ValidationError('Tags must be an array', 'tags');
    }

    return true;
}

export function getDefaultConfidence(source) {
    return SOURCE_CONFIDENCE_MAP[source] || 0.80;
}

export function sanitizePII(metadata) {
    const sanitized = { ...metadata };

    const piiFields = ['email', 'phone', 'address', 'ssn', 'credit_card'];

    if (sanitized.module_specific) {
        sanitized.module_specific = { ...sanitized.module_specific };
        piiFields.forEach(field => {
            delete sanitized.module_specific[field];
        });
    }

    return sanitized;
}

export function normalizeMetadata(metadata = {}) {
    const normalized = { ...metadata };

    if (!normalized.confidence && normalized.source) {
        normalized.confidence = getDefaultConfidence(normalized.source);
    }

    if (!normalized.timestamp) {
        normalized.timestamp = new Date().toISOString();
    }

    if (!normalized.timezone) {
        normalized.timezone = 'UTC';
    }

    if (!normalized.tags) {
        normalized.tags = [];
    }

    if (!normalized.module_specific) {
        normalized.module_specific = {};
    }

    return normalized;
}

export { ValidationError, VALID_CATEGORIES, VALID_SOURCES };
