export function useAnalysisHistory() {
  const getHistory = () => {
    try {
      const data = sessionStorage.getItem("alignly-analysis-history");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const addToHistory = (analysis: any) => {
    try {
      const history = getHistory();
      history.push({ ...analysis, timestamp: Date.now() });
      if (history.length > 10) history.shift();
      sessionStorage.setItem("alignly-analysis-history", JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save to history", e);
    }
  };

  return { getHistory, addToHistory };
}
