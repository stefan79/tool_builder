
export interface LLMConfig {
    name: string
    type: "openai" | "anthropic"
    params: {
        apiKey: string
        modelName: string
        temperature?: number
        maxTokens?: number
        topP?: number
        frequencyPenalty?: number
        presencePenalty?: number
        n?: number
        bestOf?: number
        logitBias?: Record<string, number>
        batchSize?: number
        timeout?: number
        stop?: string[]
        stopSequences?: string[]
        user?: string
        streaming?: boolean
        organization?: string    
    }
}