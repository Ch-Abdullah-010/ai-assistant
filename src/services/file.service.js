import apiClient from '../api/client';

export async function uploadFile(chatId, file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('chat_id', chatId);
  const { data } = await apiClient.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return data.file;
}

export async function getChatFiles(chatId) {
  const { data } = await apiClient.get(`/files/chat/${chatId}`);
  return data.files;
}

export async function removeFile(fileId) {
  const { data } = await apiClient.delete(`/files/${fileId}`);
  return data;
}

export function getFileUrl(file) {
  return `/api/files/${file.id}/serve`;
}

export function getFileDownloadUrl(file) {
  return `/api/files/${file.id}/download`;
}
