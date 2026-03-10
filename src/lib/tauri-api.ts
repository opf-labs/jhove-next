import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

export interface JhoveResult {
  jhove: {
    name: string;
    release: string;
    date: string;
    executionTime: string;
    repInfo: Array<{
      uri: string;
      reportingModule: {
        name: string;
        release: string;
        date: string;
      };
      lastModified: string;
      size: number;
      format?: string;
      version?: string;
      status: string;
      sigMatch?: string[];
      messages?: Array<{
        message: string;
        subMessage?: string;
        offset?: number;
        severity?: string;
        id?: string;
        infoLink?: string;
      }>;
      mimeType?: string;
      properties?: any[];
    }>;
  };
}

export async function validateFile(filePath: string, module: string): Promise<string> {
  return invoke<string>('validate_file', { filePath, module });
}

export async function pickFile(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    directory: false,
  });
  
  return selected as string | null;
}

export async function getJhoveModules(): Promise<string[]> {
  return invoke<string[]>('get_jhove_modules');
}

export async function getJhovePath(): Promise<string | null> {
  return invoke<string | null>('get_jhove_path');
}

export async function setJhovePath(path: string): Promise<boolean> {
  return invoke<boolean>('set_jhove_path', { path });
}

export async function validateJhovePath(path: string): Promise<boolean> {
  return invoke<boolean>('validate_jhove_path', { path });
}

export async function pickJhoveExecutable(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    directory: false,
    title: 'Select JHOVE Executable',
  });
  
  return selected as string | null;
}
