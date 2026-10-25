const API_URL = 'http://127.0.0.1:8000/api'

export const getCases = async () => {
  const res = await fetch(`${API_URL}/cases`)
  if (!res.ok) throw new Error("Failed to fetch cases")
  return res.json()
}

export const createCase = async (caseName, datasetRef) => {
  const res = await fetch(`${API_URL}/cases?case_name=${caseName}&dataset_ref=${datasetRef}`, { method: 'POST' })
  if (!res.ok) throw new Error("Failed to create case")
  return res.json()
}

export const scanCase = async (caseId) => {
  const res = await fetch(`${API_URL}/cases/${caseId}/scan`, { method: 'POST' })
  if (!res.ok) throw new Error("Failed to scan case")
  return res.json()
}

export const getDashboard = async (caseId) => {
  const res = await fetch(`${API_URL}/cases/${caseId}/dashboard`)
  if (!res.ok) throw new Error("Failed to fetch dashboard data")
  return res.json()
}

export const getFragments = async (caseId) => {
  const res = await fetch(`${API_URL}/cases/${caseId}/fragments`)
  if (!res.ok) throw new Error("Failed to fetch fragments")
  return res.json()
}

export const getRelationships = async (caseId) => {
  const res = await fetch(`${API_URL}/cases/${caseId}/relationships`)
  if (!res.ok) throw new Error("Failed to fetch relationships")
  return res.json()
}

export const askAI = async (caseId, query) => {
  const res = await fetch(`${API_URL}/cases/${caseId}/ai/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })
  if (!res.ok) throw new Error("Failed to query AI")
  return res.json()
}

export const generateAIReport = async (caseId) => {
  const res = await fetch(`${API_URL}/cases/${caseId}/ai/report`, { method: 'POST' })
  if (!res.ok) throw new Error("Failed to generate AI report")
  return res.json()
}

export const uploadCorruptedFile = async (caseId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/cases/${caseId}/upload-corrupted`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to upload file');
  return response.json();
}
