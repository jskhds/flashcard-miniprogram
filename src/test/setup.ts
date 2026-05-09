import { vi } from "vitest";

(global as any).wx = {
  base64ToArrayBuffer: vi.fn(() => new ArrayBuffer(8)),
  createBufferURL: vi.fn(() => "mock-buffer-url"),
  revokeBufferURL: vi.fn(),
};
