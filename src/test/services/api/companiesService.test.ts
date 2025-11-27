import { describe, it, expect, vi, beforeEach } from 'vitest';
import { companiesService } from '@/services/api/companiesService';
import { apiClient } from '@/services/api/client';

vi.mock('@/services/api/client', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

const mockCompanies = [
    { id: 1, name: 'Acme', plan: 'Pro' },
    { id: 2, name: 'Beta', plan: 'Free' },
];

const newCompany = {
    "companyId": 2,
    "name": "Test Company",
    "mailingName": "Mailing Address",
    "street1": "Street Address",
    "street2": null,
    "city": "City Address",
    "state": "CT",
    "zip": "06074",
    "phone": null,
    "fax": null
};

describe('companiesService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getAll calls apiClient.get and returns data', async () => {
        (apiClient.get as any).mockResolvedValueOnce({ data: mockCompanies });
        const result = await companiesService.getAll();
        expect(apiClient.get).toHaveBeenCalledWith('/api/companies');
        expect(result).toEqual(mockCompanies);
    });

    it('create calls apiClient.post and returns data', async () => {


        (apiClient.post as any).mockResolvedValueOnce({ data: { id: 3, ...newCompany } });
        const result = await companiesService.create(newCompany);
        expect(apiClient.post).toHaveBeenCalledWith('/api/companies', newCompany);
        expect(result).toEqual({ id: 3, ...newCompany });
    });

    it('getAll propagates errors from apiClient', async () => {
        (apiClient.get as any).mockRejectedValueOnce(new Error('Network error'));
        await expect(companiesService.getAll()).rejects.toThrow('Network error');
    });

    it('create propagates errors from apiClient', async () => {
        (apiClient.post as any).mockRejectedValueOnce(new Error('Create failed'));
        await expect(companiesService.create(newCompany)).rejects.toThrow('Create failed');
    });
});
