/// <reference types="vite/client" />
/// <reference path="./types/auto-imports.d.ts" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_PORT: string
  readonly VITE_OPEN: string
  readonly VITE_BASE_URL: string
  readonly VITE_API_URL: string
  readonly VITE_BASE_PATH: string
  readonly VITE_OUT_DIR: string
  readonly VITE_UPLOAD_TYPE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
