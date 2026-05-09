import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import Taro from "@tarojs/taro";
import { fetchTTS } from "@/api/tts";
import { useTTS } from "./useTTS";

vi.mock("@/api/tts", () => ({
  fetchTTS: vi.fn(),
}));

vi.mock("@tarojs/taro", () => ({
  default: {
    showToast: vi.fn(),
    createInnerAudioContext: vi.fn(),
  },
}));

describe("useTTS", () => {
  let mockCtx: {
    obeyMuteSwitch: boolean;
    onError: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    destroy: ReturnType<typeof vi.fn>;
    play: ReturnType<typeof vi.fn>;
    src: string;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockCtx = {
      obeyMuteSwitch: true,
      onError: vi.fn(),
      stop: vi.fn(),
      destroy: vi.fn(),
      play: vi.fn(),
      src: "",
    };
    vi.mocked(Taro.createInnerAudioContext).mockReturnValue(mockCtx as any);

    (global as any).wx = {
      base64ToArrayBuffer: vi.fn(() => new ArrayBuffer(8)),
      createBufferURL: vi.fn(() => "mock-buffer-url"),
      revokeBufferURL: vi.fn(),
    };

    vi.mocked(fetchTTS).mockResolvedValue({ audio: "base64audio", format: "mp3" });
  });

  it("首次调用 playTTS 时触发 fetchTTS，loading 状态正确流转", async () => {
    const { result } = renderHook(() => useTTS());

    expect(result.current.ttsLoading).toBe(false);

    await act(async () => {
      await result.current.playTTS("こんにちは");
    });

    expect(vi.mocked(fetchTTS)).toHaveBeenCalledWith("こんにちは");
    expect(result.current.ttsLoading).toBe(false);
    expect((global as any).wx.createBufferURL).toHaveBeenCalled();
    expect(Taro.createInnerAudioContext).toHaveBeenCalled();
  });

  it("同 text 第二次调用命中缓存，不再调用 fetchTTS", async () => {
    const { result } = renderHook(() => useTTS());

    await act(async () => {
      await result.current.playTTS("こんにちは");
    });

    await act(async () => {
      await result.current.playTTS("こんにちは");
    });

    expect(vi.mocked(fetchTTS)).toHaveBeenCalledTimes(1);
  });

  it("fetchTTS 抛错时 loading 归 false 并 toast 错误信息", async () => {
    vi.mocked(fetchTTS).mockRejectedValue(new Error("网络错误"));

    const { result } = renderHook(() => useTTS());

    await act(async () => {
      await result.current.playTTS("こんにちは");
    });

    expect(result.current.ttsLoading).toBe(false);
    expect(vi.mocked(Taro.showToast)).toHaveBeenCalledWith({
      title: "网络错误",
      icon: "none",
    });
  });

  it("stopAudio 销毁 audio context 并 revoke buffer URL", async () => {
    const { result } = renderHook(() => useTTS());

    await act(async () => {
      await result.current.playTTS("こんにちは");
    });

    act(() => {
      result.current.stopAudio();
    });

    expect(mockCtx.stop).toHaveBeenCalled();
    expect(mockCtx.destroy).toHaveBeenCalled();
    expect((global as any).wx.revokeBufferURL).toHaveBeenCalledWith("mock-buffer-url");
  });
});
