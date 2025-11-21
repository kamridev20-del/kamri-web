'use client';

interface ProductTrustBadgesProps {
  isFreeShipping?: boolean;
  stock?: number;
}

export default function ProductTrustBadges({ isFreeShipping, stock }: ProductTrustBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {isFreeShipping && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#E8F5E8] rounded-full text-xs">
          <span className="text-xs">🚚</span>
          <span className="text-[#4CAF50] font-semibold">Livraison gratuite</span>
        </div>
      )}
      
      {stock && stock > 0 && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#E8F5E8] rounded-full text-xs">
          <span className="text-xs">✅</span>
          <span className="text-[#4CAF50] font-semibold">En stock</span>
        </div>
      )}
      
      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#E8F5E8] rounded-full text-xs">
        <span className="text-xs">🔄</span>
        <span className="text-[#4CAF50] font-semibold">Retour gratuit</span>
      </div>
      
      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#E8F5E8] rounded-full text-xs">
        <span className="text-xs">🛡️</span>
        <span className="text-[#4CAF50] font-semibold">Garantie 1 an</span>
      </div>
      
      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#E8F5E8] rounded-full text-xs">
        <span className="text-xs">🔒</span>
        <span className="text-[#4CAF50] font-semibold">Paiement sécurisé</span>
      </div>
    </div>
  );
}

