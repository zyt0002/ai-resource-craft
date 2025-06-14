
interface GenerationHistoryProps {
  aiGenerations: any[] | undefined;
}

export function GenerationHistory({ aiGenerations }: GenerationHistoryProps) {
  // Helper function to safely get model from generation record
  const getModelFromGeneration = (generation: any) => {
    // First try to get from the model column (new structure)
    if ((generation as any).model) {
      return (generation as any).model;
    }
    // Fallback to result_data.model (old structure)
    if (generation.result_data && typeof generation.result_data === 'object' && generation.result_data !== null) {
      const resultData = generation.result_data as { model?: string };
      return resultData.model || "未知";
    }
    return "未知";
  };

  return (
    <div>
      {aiGenerations?.length ? (
        <div className="space-y-3">
          {aiGenerations.map((generation) => (
            <div key={generation.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">{generation.generation_type}</span>
                <span className="text-sm text-gray-500">{new Date(generation.created_at).toLocaleString()}</span>
              </div>
              <div className="text-xs text-sky-700 mb-1">模型: {getModelFromGeneration(generation)}</div>
              <p className="text-sm text-gray-600 line-clamp-2">{generation.prompt}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">暂无生成记录</p>
      )}
    </div>
  );
}
