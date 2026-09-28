"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteDocument, getDocument, getDocuments, uploadDocuments } from "@/services/api";

export const documentKeys = { all: ["documents"] as const, detail: (id: string) => ["documents", id] as const };

export function useDocuments() {
  return useQuery({ queryKey: documentKeys.all, queryFn: getDocuments });
}

export function useDocument(id?: string) {
  return useQuery({ queryKey: documentKeys.detail(id || ""), queryFn: () => getDocument(id!), enabled: Boolean(id) });
}

export function useUploadDocuments() {
  const client = useQueryClient();
  return useMutation({ mutationFn: uploadDocuments, onSuccess: () => client.invalidateQueries({ queryKey: documentKeys.all }) });
}

export function useDeleteDocument() {
  const client = useQueryClient();
  return useMutation({ mutationFn: deleteDocument, onSuccess: () => client.invalidateQueries({ queryKey: documentKeys.all }) });
}

