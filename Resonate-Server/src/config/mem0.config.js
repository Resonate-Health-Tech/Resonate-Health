const getMem0Config = () => ({
    apiKey: process.env.MEM0_API_KEY,
    agentId: process.env.MEM0_AGENT_ID || undefined,
    projectName: process.env.MEM0_PROJECT_NAME || 'resonate-health-memory',
    baseUrl: 'https://api.mem0.ai/v1'
});

const validateMem0Config = () => {
    const config = getMem0Config();
    if (!config.apiKey) {
        throw new Error('MEM0_API_KEY is not defined in environment variables');
    }
    return config;
};

export { getMem0Config, validateMem0Config };
