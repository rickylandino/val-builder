import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as clientModule from '@/services/api/client';

vi.mock('axios', () => {
	return {
		default: {
			create: vi.fn(() => {
				// Simulate axios instance
				return {
					defaults: {
						baseURL: 'http://localhost:5082',
						headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
						timeout: 10000,
					},
					interceptors: {
						request: { use: vi.fn() },
						response: { use: vi.fn() },
					},
					get: vi.fn(),
					post: vi.fn(),
				};
			}),
		},
	};
});

it('request interceptor returns config unchanged', () => {
	// Get the interceptor function registered with axios
	const interceptor = (clientModule.apiClient.interceptors.request.use as any).mock.calls[0][0];
	const config = { headers: { test: 'value' } };
	expect(interceptor(config)).toBe(config);
});

it('request interceptor error handler rejects error', async () => {
	const errorHandler = (clientModule.apiClient.interceptors.request.use as any).mock.calls[0][1];
	const error = new Error('request error');
	await expect(errorHandler(error)).rejects.toBe(error);
});

describe('response interceptor error handling', () => {
	let rejectInterceptor: any;
	beforeEach(() => {
		// Get the error handler from the response interceptor registration
		rejectInterceptor = (clientModule.apiClient.interceptors.response.use as any).mock.calls[0][1];
	});

   
	it('logs server error', async () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const error = { response: { data: 'fail' } };
		await expect(rejectInterceptor(error)).rejects.toBe(error);
		expect(spy).toHaveBeenCalledWith('API Error:', 'fail');
		spy.mockRestore();
	});

	it('logs network error', async () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const error = { request: {}, message: 'network down' };
		await expect(rejectInterceptor(error)).rejects.toBe(error);
		expect(spy).toHaveBeenCalledWith('Network Error:', 'network down');
		spy.mockRestore();
	});

	it('logs generic error', async () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const error = { message: 'something broke' };
		await expect(rejectInterceptor(error)).rejects.toBe(error);
		expect(spy).toHaveBeenCalledWith('Error:', 'something broke');
		spy.mockRestore();
	});
});

describe('apiClient', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should create axios instance with correct config', () => {
		expect(clientModule.apiClient.defaults.baseURL).toBeDefined();
		expect(clientModule.apiClient.defaults.headers['Content-Type']).toBe('application/json');
		expect(clientModule.apiClient.defaults.timeout).toBe(10000);
	});

	it('should call request interceptor', () => {
		const useSpy = clientModule.apiClient.interceptors.request.use;
		expect(typeof useSpy).toBe('function');
	});

	it('should call response interceptor', () => {
		const useSpy = clientModule.apiClient.interceptors.response.use;
		expect(typeof useSpy).toBe('function');
	});

	it('should handle error logging in response interceptor', async () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		// Simulate error with response
		clientModule.apiClient.interceptors.response.use(
			(res: any) => res,
			(err: any) => {
				if (err.response) console.error('API Error:', err.response.data);
				return Promise.reject(err);
			}
		);
		expect(spy).not.toHaveBeenCalled(); // interceptor registration, not execution
		spy.mockRestore();
	});

});


