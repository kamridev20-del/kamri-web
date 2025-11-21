'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

interface AddressFormProps {
  initialAddress?: Address;
  onSubmit: (address: Address) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const COUNTRIES = [
  { code: 'FR', name: 'France' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'NL', name: 'Netherlands' },
];

export default function AddressForm({ 
  initialAddress, 
  onSubmit, 
  onCancel,
  loading = false 
}: AddressFormProps) {
  const [address, setAddress] = useState<Address>(initialAddress || {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'FR',
    isDefault: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Address, string>> = {};

    if (!address.street.trim()) {
      newErrors.street = 'L\'adresse est requise';
    }

    if (!address.city.trim()) {
      newErrors.city = 'La ville est requise';
    }

    if (!address.state.trim()) {
      newErrors.state = 'Le département/région est requis';
    }

    if (!address.zipCode.trim()) {
      newErrors.zipCode = 'Le code postal est requis';
    }

    if (!address.country) {
      newErrors.country = 'Le pays est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(address);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="street">Adresse *</Label>
        <Input
          id="street"
          value={address.street}
          onChange={(e) => setAddress({ ...address, street: e.target.value })}
          placeholder="123 Rue de la Paix"
          className={errors.street ? 'border-red-500' : ''}
        />
        {errors.street && (
          <p className="text-sm text-red-500 mt-1">{errors.street}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Ville *</Label>
          <Input
            id="city"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            placeholder="Paris"
            className={errors.city ? 'border-red-500' : ''}
          />
          {errors.city && (
            <p className="text-sm text-red-500 mt-1">{errors.city}</p>
          )}
        </div>

        <div>
          <Label htmlFor="zipCode">Code postal *</Label>
          <Input
            id="zipCode"
            value={address.zipCode}
            onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
            placeholder="75001"
            className={errors.zipCode ? 'border-red-500' : ''}
          />
          {errors.zipCode && (
            <p className="text-sm text-red-500 mt-1">{errors.zipCode}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="state">Département/Région *</Label>
          <Input
            id="state"
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
            placeholder="Île-de-France"
            className={errors.state ? 'border-red-500' : ''}
          />
          {errors.state && (
            <p className="text-sm text-red-500 mt-1">{errors.state}</p>
          )}
        </div>

        <div>
          <Label htmlFor="country">Pays *</Label>
          <select
            id="country"
            value={address.country}
            onChange={(e) => setAddress({ ...address, country: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] ${
              errors.country ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="text-sm text-red-500 mt-1">{errors.country}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#4CAF50] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#45a049] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enregistrement...' : 'Continuer'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

