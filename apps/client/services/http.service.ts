'use client';
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { axiosConfig } from '@/configs/axios.config';

export type GetTokenFn = () => Promise<string | null>;

export interface HttpServiceOptions {
  config?: AxiosRequestConfig;
  getToken?: GetTokenFn;
}

export class HttpService {
  private instance: AxiosInstance;
  private getToken?: GetTokenFn;

  constructor(options: HttpServiceOptions = {}) {
    const { config = axiosConfig, getToken } = options;
    this.getToken = getToken;
    const instance = axios.create({ ...config });
    Object.assign(instance, this.setupInterceptorsTo(instance));
    this.instance = instance;
    this.setHttpConfigs(config);
  }

  public delete(url: string, config?: AxiosRequestConfig) {
    return this.instance.delete(url, config);
  }

  public get<T>(url: string, config?: AxiosRequestConfig) {
    return this.instance.get<T>(url, config);
  }

  public patch<T, R>(url: string, data: T, config?: AxiosRequestConfig) {
    return this.instance.patch<R>(url, data, config);
  }

  public post<T, R>(url: string, data?: T, config?: AxiosRequestConfig) {
    return this.instance.post<R>(url, data, config);
  }

  public put<T, R>(url: string, data?: T, config?: AxiosRequestConfig) {
    return this.instance.put<R>(url, data, config);
  }

  public head<T>(url: string, config?: AxiosRequestConfig) {
    return this.instance.head<T>(url, config);
  }

  private setHttpConfigs(config?: Partial<AxiosRequestConfig>) {
    if (config?.baseURL) {
      this.instance.defaults.baseURL = config.baseURL;
    }
  }

  /** REQUEST INTERCEPTOR */
  private onRequest = async (
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> => {
    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  };

  private onRequestError = (error: AxiosError) => Promise.reject(error);

  private onResponse = (response: AxiosResponse) => response;

  private onResponseError = async (error: AxiosError) => {
    return Promise.reject(error);
  };

  private setupInterceptorsTo(axiosInstance: AxiosInstance) {
    axiosInstance.interceptors.request.use(this.onRequest, this.onRequestError);
    axiosInstance.interceptors.response.use(
      this.onResponse,
      this.onResponseError,
    );
    return axiosInstance;
  }
}
