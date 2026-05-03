'use client';

import { useEffect, useState, FormEvent } from 'react';

interface EmployeeFile {
  id: number;
  employeeId: number;
  fileName: string;
  blobName: string;
  contentType: string | null;
  fileSize: number | null;
  category: string | null;
  memo: string | null;
  uploadedBy: string | null;
  uploadedAt: string;
}

interface Props {
  employeeId: number;
  employeeName: string;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'contract', label: '雇用契約書' },
  { value: 'id', label: '身分証明書' },
  { value: 'tax', label: '税関係書類' },
  { value: 'other', label: 'その他' },
];

function formatBytes(size: number | null): string {
  if (!size) return '-';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default function EmployeeFilesModal({
  employeeId,
  employeeName,
  onClose,
}: Props) {
  const [files, setFiles] = useState<EmployeeFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('other');
  const [memo, setMemo] = useState('');

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/employees/${employeeId}/files`);
      if (!res.ok) throw new Error('ファイル一覧の取得に失敗しました');
      const data = await res.json();
      setFiles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', category);
      if (memo) formData.append('memo', memo);

      const res = await fetch(`/api/employees/${employeeId}/files`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'アップロードに失敗しました');
      }
      setSelectedFile(null);
      setMemo('');
      const input = document.getElementById('file-input') as HTMLInputElement | null;
      if (input) input.value = '';
      await fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!confirm('このファイルを削除しますか？')) return;
    try {
      const res = await fetch(
        `/api/employees/${employeeId}/files/${fileId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('削除に失敗しました');
      await fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">添付ファイル</h2>
            <p className="text-sm text-gray-600 mt-1">{employeeName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleUpload} className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <h3 className="font-semibold text-gray-800">新規アップロード</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">ファイル</label>
                <input
                  id="file-input"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">分類</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field w-full"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">メモ（任意）</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="input-field w-full"
                maxLength={500}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="btn-primary disabled:opacity-50"
              >
                {isUploading ? 'アップロード中...' : 'アップロード'}
              </button>
            </div>
          </form>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">登録済みファイル</h3>
            {isLoading ? (
              <p className="text-gray-500 text-sm">読み込み中...</p>
            ) : files.length === 0 ? (
              <p className="text-gray-500 text-sm">ファイルはまだありません</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="py-2 pr-3">ファイル名</th>
                      <th className="py-2 pr-3">分類</th>
                      <th className="py-2 pr-3">サイズ</th>
                      <th className="py-2 pr-3">登録日</th>
                      <th className="py-2 pr-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((f) => {
                      const cat = CATEGORIES.find((c) => c.value === f.category);
                      return (
                        <tr key={f.id} className="border-b last:border-b-0">
                          <td className="py-2 pr-3 text-gray-900">{f.fileName}</td>
                          <td className="py-2 pr-3 text-gray-700">
                            {cat?.label || f.category || '-'}
                          </td>
                          <td className="py-2 pr-3 text-gray-700">
                            {formatBytes(f.fileSize)}
                          </td>
                          <td className="py-2 pr-3 text-gray-700">
                            {new Date(f.uploadedAt).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="py-2 pr-3 text-right space-x-3">
                            <a
                              href={`/api/employees/${employeeId}/files/${f.id}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ダウンロード
                            </a>
                            <button
                              onClick={() => handleDelete(f.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              削除
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="border-t px-6 py-3 flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
