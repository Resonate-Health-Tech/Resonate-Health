export class RecoveryIngestor {
  constructor(memoryService) {
    this.memoryService = memoryService;
  }

  async processSleepEvent(userId, sleepData) {
    const hours = sleepData.hours || 0;
    const quality = sleepData.quality_score || 0;
    const interruptions = sleepData.interruptions || 0;

    // Generate compact memory text
    const memoryText = `Sleep: ${this._formatDuration(hours)}, quality ${quality}/10, woke up ${interruptions} times`;

    const metadata = {
      category: 'recovery.sleep',
      source: sleepData.source || 'user_input',
      module_specific: {
        hours: hours,
        quality_score: quality,
        interruptions: interruptions,
        stages: sleepData.stages || {}
      }
    };

    return await this.memoryService.addMemory(userId, memoryText, metadata);
  }

  async processStressEvent(userId, stressData) {
    const stressScore = stressData.stress_score || 0;
    const descriptors = [];

    if (stressData.fatigue_level) descriptors.push(`fatigue: ${stressData.fatigue_level}`);
    if (stressData.soreness) descriptors.push(`soreness: ${stressData.soreness}`);
    if (stressData.notes) descriptors.push(stressData.notes);

    // Generate compact memory text
    let memoryText = `Stress level ${stressScore}/10`;
    if (descriptors.length > 0) {
      memoryText += `, ${descriptors.join(', ')}`;
    }

    const metadata = {
      category: 'recovery.stress',
      source: stressData.source || 'user_input',
      module_specific: {
        stress_score: stressScore,
        fatigue_level: stressData.fatigue_level,
        soreness: stressData.soreness
      }
    };

    return await this.memoryService.addMemory(userId, memoryText, metadata);
  }

  async processDailyLog(userId, logData) {
    let memoryText = `Daily Log:`;
    const updates = [];

    if (logData.energyLevel) updates.push(`Energy ${logData.energyLevel}/10`);
    if (logData.stressLevel) updates.push(`Stress ${logData.stressLevel}/10`);
    if (logData.sleepQuality) updates.push(`Sleep Quality ${logData.sleepQuality}/10`);
    if (logData.mood) updates.push(`Mood: ${logData.mood}`);
    if (logData.symptoms && logData.symptoms.length > 0) updates.push(`Symptoms: ${logData.symptoms.join(', ')}`);
    if (logData.notes) updates.push(`Notes: ${logData.notes}`);

    if (updates.length === 0) return null; // Nothing to log

    memoryText += ` ${updates.join(', ')}.`;

    const metadata = {
      category: 'recovery.daily_log',
      source: 'user_input',
      module_specific: {
        energy_level: logData.energyLevel,
        stress_level: logData.stressLevel,
        sleep_quality: logData.sleepQuality,
        mood: logData.mood,
        symptoms: logData.symptoms
      }
    };

    return await this.memoryService.addMemory(userId, memoryText, metadata);
  }

  async processWaterEvent(userId, amountMl, date) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const amountL = (amountMl / 1000).toFixed(2);

    const memoryText = `Water intake: ${amountMl}ml (${amountL}L) on ${targetDate}`;

    const metadata = {
      category: 'recovery.daily_log',
      source: 'user_input',
      timestamp: new Date().toISOString(),
      module_specific: {
        water_ml: amountMl,
        water_liters: parseFloat(amountL),
        date: targetDate
      }
    };

    return await this.memoryService.addMemory(userId, memoryText, metadata);
  }

  _formatDuration(hours) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }
}
