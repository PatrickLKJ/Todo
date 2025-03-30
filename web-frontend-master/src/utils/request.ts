// @ts-ignore
/* eslint-disable */
import { request as umiRequest } from 'umi';
import { message } from 'antd';

// 从localStorage获取token
const getToken = () => localStorage.getItem('accessToken');

// 定义API响应接口
interface ApiResponse {
  code?: number;
  success?: boolean;
  data?: any;
  message?: string;
  [key: string]: any;
}

/**
 * 请求配置接口
 */
interface RequestConfig extends RequestInit {
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
}

/**
 * 请求响应结果接口
 */
interface RequestResult<T> {
  code?: number;
  data?: T;
  message?: string;
  success?: boolean;
}

// API基础URL
const baseURL = '';

/**
 * 封装request请求
 */
export async function request(url: string, options: any = {}) {
  try {
    // 获取token
    const token = getToken();
    console.log('当前token:', token);
    
    // 设置请求头
    const headers = {
      ...(options.headers || {}),
      // 添加CORS相关头
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    // 如果未指定Content-Type，则默认设为application/json
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    
    // 如果有token，添加到请求头
    if (token) {
      // 不使用Bearer前缀，直接发送token
      headers.Authorization = token;
      console.log('添加授权头:', token);
    }
    
    console.log('请求URL:', url);
    
    // 打印详细请求信息但不包含敏感信息
    console.log('请求方法:', options.method);
    
    // 安全地打印请求数据，过滤可能的密码等敏感字段
    const safeData = options.data ? 
      (options.data instanceof URLSearchParams ? 
        Object.fromEntries(options.data.entries()) : 
        JSON.parse(JSON.stringify(options.data))) 
      : undefined;
      
    if (safeData && safeData.password) {
      safeData.password = '******';
    }

    console.log('请求数据:', safeData ? JSON.stringify(safeData, null, 2) : undefined);
    
    // 打印请求参数（处理密码字段）
    const safeParams = options.params 
      ? JSON.parse(JSON.stringify(options.params)) 
      : undefined;
    if (safeParams && safeParams.password) {
      safeParams.password = '******';
    }
    console.log('请求参数:', safeParams ? JSON.stringify(safeParams, null, 2) : undefined);
    console.log('请求头:', JSON.stringify(headers, null, 2));
    
    // 发起请求
    const response = await umiRequest(url, {
      ...options,
      headers,
      // 添加超时时间
      timeout: 15000, // 15秒超时
      errorHandler: null, // 禁用默认错误处理，我们会自己处理错误
      // 确保umi请求处理requestType
      ...(options.requestType ? { requestType: options.requestType } : {}),
    }) as ApiResponse;
    
    console.log('API响应状态:', response.code || 200);
    console.log('API响应数据:', response.data ? JSON.stringify(response.data, null, 2) : response);
    
    // 处理响应
    if (response.code === 200 || response.success || !response.code) {
      return response.data || response;
    }
    
    // 错误处理
    const errorMsg = response.message || '请求失败';
    console.error(`请求失败: ${url}`, errorMsg);
    message.error(errorMsg);
    return Promise.reject(response);
  } catch (error: any) {
    console.error('API请求错误:', error);
    
    // 增强的错误信息处理
    let errorMessage = '请求异常';
    
    if (error.response) {
      // 服务器返回错误状态码
      console.error('服务器响应状态:', error.response.status);
      console.error('服务器响应数据:', error.response.data);
      
      if (error.response.status === 401) {
        errorMessage = '未授权，请重新登录';
        // 可以在这里添加重定向到登录页面的逻辑
        localStorage.removeItem('accessToken'); // 清除失效的token
        // 如果当前不在登录页面，重定向到登录页
        if (window.location.pathname !== '/user/login') {
          message.error('登录已过期，请重新登录');
          setTimeout(() => {
            window.location.href = '/user/login';
          }, 1500);
        }
      } else if (error.response.status === 403) {
        errorMessage = '没有权限执行此操作';
      } else if (error.response.status === 500) {
        // 处理服务器内部错误，尝试获取更详细的错误信息
        errorMessage = '服务器内部错误，请稍后重试';
        
        // 尝试解析响应中的错误消息
        try {
          const errorData = typeof error.response.data === 'string' 
            ? JSON.parse(error.response.data) 
            : error.response.data;
          
          console.error('服务器错误详情:', errorData);
          
          if (errorData && errorData.message) {
            errorMessage = `服务器错误: ${errorData.message}`;
          } else if (typeof error.response.data === 'string') {
            // 尝试从Java异常信息中提取有用信息
            if (error.response.data.includes('Exception')) {
              const exceptionParts = error.response.data.split(':');
              if (exceptionParts.length > 1) {
                const cleanMessage = exceptionParts[exceptionParts.length - 1].trim();
                errorMessage = cleanMessage || '服务器错误，请稍后重试';
              }
            } else {
              errorMessage = error.response.data;
            }
          }
        } catch (parseError) {
          console.error('解析错误响应失败:', parseError);
        }
      } else {
        errorMessage = error.response.data?.message || `请求失败(${error.response.status})`;
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络请求未收到响应:', error.request);
      if (error.request.status === 0) {
        errorMessage = '服务器无响应，请检查网络连接';
      } else {
        errorMessage = '网络错误，请检查网络连接';
      }
    } else {
      // 其他错误
      errorMessage = error.message || '请求异常';
      console.error('其他请求错误:', error.message || '未知错误');
    }
    
    // 避免多个错误消息堆叠
    if (!window.isShowingErrorMessage) {
      window.isShowingErrorMessage = true;
      message.error(errorMessage);
      setTimeout(() => {
        window.isShowingErrorMessage = false;
      }, 2000);
    }
    
    return Promise.reject({
      ...error,
      message: errorMessage, // 添加格式化后的错误信息
      originalError: error // 保留原始错误
    });
  }
}

/**
 * 分页数据转换
 */
export function convertPageData<T>(result: any) {
  if (!result) return { data: [], total: 0, success: false };
  
  // 处理后端返回的标准格式
  if (result.code === 200 && result.data) {
    return {
      data: result.data.list || [],
      total: result.data.total || 0,
      success: true,
    };
  }
  
  // 处理直接返回PageResult对象的情况
  return {
    data: result.list || [],
    total: result.total || 0,
    success: true,
  };
}

/**
 * 排序字段转换
 */
export function orderBy(sort?: Record<string, 'ascend' | 'descend'>) {
  if (!sort) {
    return undefined;
  }
  const keys = Object.keys(sort);
  if (!keys.length) {
    return undefined;
  }

  const field = keys[0];
  const order = sort[field] === 'ascend' ? 'asc' : 'desc';
  return `${field} ${order}`;
}

/**
 * 等待指定时间
 */
export async function waitTime(time: number = 100) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}

// 为TypeScript全局添加isShowingErrorMessage定义
declare global {
  interface Window {
    isShowingErrorMessage?: boolean;
  }
}
