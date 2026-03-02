export class DiagnosticsIngestor {
    constructor(memoryService) {
        this.memoryService = memoryService;
    }

    async processReport(userId, reportData, category = 'blood') {
        // Expects reportData.markers to be an array of { name, value, unit, status, previous_value }
        const keyMarkers = reportData.markers.filter(m => m.is_key_marker || m.status !== 'normal');

        const markerTexts = keyMarkers.map(m => {
            let text = `${m.name} ${m.value} ${m.unit}`;
            if (m.status !== 'normal') text += ` (${m.status})`;
            if (m.previous_value) {
                const direction = m.value > m.previous_value ? '↑' : '↓';
                text += ` (${direction} from ${m.previous_value})`;
            }
            return text;
        });

        const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
        const memoryText = `${categoryLabel} Test ${reportData.date}: ${markerTexts.join(', ')}`;

        // flatten markers for metadata queryability
        const flatMarkers = {};
        keyMarkers.forEach(m => {
            // sanitize key name
            const key = m.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
            flatMarkers[key] = m.value;
        });

        const metadata = {
            category: `diagnostics.${category}`,
            source: 'lab_import',
            timestamp: new Date().toISOString(),
            module_specific: {
                test_date: reportData.date,
                ...flatMarkers
            }
        };

        return await this.memoryService.addMemory(userId, memoryText, metadata);
    }

    async processBCA(userId, bcaData) {
        const memoryText = `BCA: Weight ${bcaData.weight}kg, Body Fat ${bcaData.body_fat_percent}%, Muscle Mass ${bcaData.muscle_mass_kg}kg, Visceral Fat Level ${bcaData.visceral_fat_level}`;

        const scanDate = bcaData.scan_date || bcaData.date || new Date().toISOString().split('T')[0];

        const metadata = {
            category: 'diagnostics.bca',
            source: bcaData.source || 'device_sync',
            timestamp: new Date().toISOString(),
            module_specific: {
                scan_date: scanDate,
                weight_kg: bcaData.weight,
                body_fat_percent: bcaData.body_fat_percent,
                muscle_mass_kg: bcaData.muscle_mass_kg,
                visceral_fat_level: bcaData.visceral_fat_level
            }
        };

        return await this.memoryService.addMemory(userId, memoryText, metadata);
    }

    async processCGM(userId, cgmSummary) {
        const memoryText = `CGM Pattern: ${cgmSummary.description}`;

        const period = cgmSummary.period || cgmSummary.date_range || cgmSummary.range || 'unspecified';

        const metadata = {
            category: 'diagnostics.cgm',
            source: 'device_sync',
            timestamp: new Date().toISOString(),
            module_specific: {
                period,
                avg_glucose: cgmSummary.avg_glucose_mg_dl,
                time_in_range_percent: cgmSummary.time_in_range_percent,
                spike_count: cgmSummary.spike_count,
                fasting_glucose: cgmSummary.fasting_glucose_mg_dl
            }
        };

        return await this.memoryService.addMemory(userId, memoryText, metadata);
    }
}
