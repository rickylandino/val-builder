import { describe, it, expect, vi, beforeEach } from 'vitest';
import { companyPlansService } from '@/services/api/companyPlansService';
import { apiClient } from '@/services/api/client';

vi.mock('@/services/api/client', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

const mockPlans = [
	{ id: 1, companyId: 42, planType: 'Basic', planName: 'Starter', planYearEnd: 2025, tech: 'Node' },
	{ id: 2, companyId: 42, planType: 'Pro', planName: 'Growth', planYearEnd: 2026, tech: 'React' },
];

const payload = {
    "planId": 1,
    "companyId": 2,
    "planType": null,
    "planName": "CP1",
    "planYearEnd": "12/31",
    "tech": "RL"
}

describe('companyPlansService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('getByCompany calls apiClient.get and returns data', async () => {
		(apiClient.get as any).mockResolvedValueOnce({ data: mockPlans });
		const result = await companyPlansService.getByCompany(42);
		expect(apiClient.get).toHaveBeenCalledWith('/api/companyplan?companyId=42');
		expect(result).toEqual(mockPlans);
	});

    it('get calls apiClient.get and returns data', async () => {
        (apiClient.get as any).mockResolvedValueOnce({ data: mockPlans[0] });
        const result = await companyPlansService.get(1);
        expect(apiClient.get).toHaveBeenCalledWith('/api/companyplan/1');
        expect(result).toEqual(mockPlans[0]);
    });

	it('create calls apiClient.post and returns data', async () => {
        const payload2 = {
            "planId": 1,
            "planType": null,
            "planName": "CP1",
            "planYearEnd": "12/31",
            "tech": "RL"
        };

		(apiClient.post as any).mockResolvedValueOnce({ data: { id: 3, companyId: 42, ...payload2 } });
		const result = await companyPlansService.create(42, payload);
		expect(apiClient.post).toHaveBeenCalledWith('/api/companyplan', { ...payload, companyId: 42 });
		expect(result).toEqual({ id: 3, companyId: 42, ...payload2 });
	});

	it('getByCompany propagates errors from apiClient', async () => {
		(apiClient.get as any).mockRejectedValueOnce(new Error('Network error'));
		await expect(companyPlansService.getByCompany(42)).rejects.toThrow('Network error');
	});

    it('get propagates errors from apiClient', async () => {
        (apiClient.get as any).mockRejectedValueOnce(new Error('Get failed'));
        await expect(companyPlansService.get(1)).rejects.toThrow('Get failed');
    });

	it('create propagates errors from apiClient', async () => {
		(apiClient.post as any).mockRejectedValueOnce(new Error('Create failed'));
		await expect(companyPlansService.create(42, { planType: 'Pro' })).rejects.toThrow('Create failed');
	});
});
