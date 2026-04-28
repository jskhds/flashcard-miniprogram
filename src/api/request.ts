import Taro from "@tarojs/taro";
import { getToken } from "./token";

// 联调时指向本地后端，上线前改为正式域名
export const BASE_URL = "http://192.168.0.104:3000/api";

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/** 构建查询字符串，自动跳过 undefined 值 */
export const buildQuery = (params: Record<string, string | number | undefined>): string => {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) parts.push(`${key}=${encodeURIComponent(value)}`);
  }
  return parts.length > 0 ? `?${parts.join("&")}` : "";
};

/** 统一请求封装，自动附加 token，code !== 0 时抛出错误 */
export const request = async <T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  data?: Record<string, unknown>
): Promise<T> => {
  const token = getToken();
  const header: Record<string, string> = { "Content-Type": "application/json" };
  if (token) header["Authorization"] = `Bearer ${token}`;

  const res = await Taro.request<ApiResponse<T>>({
    url: `${BASE_URL}${path}`,
    method,
    data,
    header,
  });

  const body = res.data;
  if (body.code !== 0) {
    throw new Error(body.message ?? "请求失败");
  }
  return body.data;
};
