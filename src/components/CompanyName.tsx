'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

interface CompanyInfo {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
}

interface CompanyNameProps {
  fallback?: string;
  className?: string;
}

export default function CompanyName({ fallback = 'KAMRI', className = '' }: CompanyNameProps) {
  const [companyName, setCompanyName] = useState<string>(fallback);

  useEffect(() => {
    const loadCompanyName = async () => {
      try {
        const response = await apiClient.getCompanyInfo();
        if (response.data?.companyName) {
          setCompanyName(response.data.companyName);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du nom de l\'entreprise:', error);
        // Garder le fallback en cas d'erreur
      }
    };

    loadCompanyName();
  }, [fallback]);

  return <span className={className}>{companyName}</span>;
}
