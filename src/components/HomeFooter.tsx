export default function HomeFooter() {
  return (
    <footer className="bg-[#E8F5E8] text-[#424242]">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Side - Informational Links */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Nous connaître */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-[#424242]">Nous connaître</h3>
                <ul className="space-y-3 text-sm text-[#81C784]">
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">À propos de KAMRI</a></li>
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">KAMRI - Mode et Style</a></li>
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Programme d'affiliation</a></li>
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Contactez-nous</a></li>
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Mentions légales</a></li>
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Carrières</a></li>
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Presse</a></li>
                </ul>
              </div>

              {/* Service client */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-[#424242]">Service client</h3>
                <ul className="space-y-3 text-sm text-[#81C784]">
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Politique de retour</a></li>
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Politique de confidentialité</a></li>
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Informations de livraison</a></li>
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Alertes sécurité</a></li>
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Signaler un problème</a></li>
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Montant minimum</a></li>
                </ul>
              </div>

              {/* Aide */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-[#424242]">Aide</h3>
                <ul className="space-y-3 text-sm text-[#81C784]">
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Centre d'aide</a></li>
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">FAQ</a></li>
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Centre de sécurité</a></li>
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Protection des achats</a></li>
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Devenir partenaire</a></li>
                  <li><a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Accessibilité</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Side - App Download & Social */}
          <div className="space-y-8">
            
            {/* App Download */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#424242]">Téléchargez l'app KAMRI</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-[#81C784]">
                  <span className="w-4 h-4 bg-[#4CAF50] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  <span>Alertes de promotions</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-[#81C784]">
                  <span className="w-4 h-4 bg-[#4CAF50] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-[#81C784]">
                  <span className="w-4 h-4 bg-[#4CAF50] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  <span>Suivi des commandes</span>
                </div>
              </div>
              
              {/* App Store Buttons */}
              <div className="flex space-x-3 mt-6">
                <button className="bg-[#4CAF50] border border-[#2E7D32] rounded-lg px-4 py-2 flex items-center space-x-2 hover:bg-[#45A049] transition-all duration-300 ease-in-out font-['Inter']">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-white">Télécharger dans</div>
                    <div className="text-sm font-semibold text-white">App Store</div>
                  </div>
                </button>
                
                <button className="bg-[#4CAF50] border border-[#2E7D32] rounded-lg px-4 py-2 flex items-center space-x-2 hover:bg-[#45A049] transition-all duration-300 ease-in-out font-['Inter']">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.609 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.353 2.353a1 1 0 010 1.414l-2.353 2.353a1 1 0 01-1.414 0l-2.353-2.353a1 1 0 010-1.414l2.353-2.353a1 1 0 011.414 0z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-white">Disponible sur</div>
                    <div className="text-sm font-semibold text-white">Google Play</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#424242]">Connectez-vous avec KAMRI</h3>
              <div className="flex space-x-3">
                <button className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center hover:bg-[#45A049] transition-all duration-300 ease-in-out font-['Inter']">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center hover:bg-[#45A049] transition-all duration-300 ease-in-out font-['Inter']">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </button>
                <button className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center hover:bg-[#45A049] transition-all duration-300 ease-in-out font-['Inter']">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </button>
                <button className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center hover:bg-[#45A049] transition-all duration-300 ease-in-out font-['Inter']">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.08-1.09 3.26 3.26 0 0 1-1.12-1.95c-.12-.85.12-1.71.67-2.39a4.9 4.9 0 0 1 2.43-1.64 4.83 4.83 0 0 1 3.08.09 3.26 3.26 0 0 1 1.12 1.95c.12.85-.12 1.71-.67 2.39a4.9 4.9 0 0 1-2.43 1.64zm-5.76 0a4.83 4.83 0 0 1-3.08-1.09 3.26 3.26 0 0 1-1.12-1.95c-.12-.85.12-1.71.67-2.39a4.9 4.9 0 0 1 2.43-1.64 4.83 4.83 0 0 1 3.08.09 3.26 3.26 0 0 1 1.12 1.95c.12.85-.12 1.71-.67 2.39a4.9 4.9 0 0 1-2.43 1.64z"/>
                  </svg>
            </button>
                <button className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center hover:bg-[#45A049] transition-all duration-300 ease-in-out font-['Inter']">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
            </button>
                <button className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center hover:bg-[#45A049] transition-all duration-300 ease-in-out font-['Inter']">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19c-3.859 0-7-3.141-7-7s3.141-7 7-7 7 3.141 7 7-3.141 7-7 7z"/>
                  </svg>
            </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section - Security & Payments */}
      <div className="border-t border-[#81C784] py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Security Certificates */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#424242]">Certificats de sécurité</h3>
              <div className="flex flex-wrap gap-4">
                <div className="bg-[#4CAF50] px-3 py-2 rounded text-sm text-white">SSL Sécurisé</div>
                <div className="bg-[#4CAF50] px-3 py-2 rounded text-sm text-white">PCI DSS</div>
                <div className="bg-[#4CAF50] px-3 py-2 rounded text-sm text-white">Paiement Sécurisé</div>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#424242]">Nous acceptons</h3>
              <div className="flex flex-wrap gap-4">
                <div className="bg-[#4CAF50] px-3 py-2 rounded text-sm text-white">VISA</div>
                <div className="bg-[#4CAF50] px-3 py-2 rounded text-sm text-white">Mastercard</div>
                <div className="bg-[#4CAF50] px-3 py-2 rounded text-sm text-white">PayPal</div>
                <div className="bg-[#4CAF50] px-3 py-2 rounded text-sm text-white">Apple Pay</div>
                <div className="bg-[#4CAF50] px-3 py-2 rounded text-sm text-white">Google Pay</div>
              </div>
            </div>
          </div>
        </div>
          </div>
          
      {/* Bottom Section - Copyright */}
      <div className="border-t border-[#81C784] py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-[#81C784]">© 2024 KAMRI. Tous droits réservés.</p>
            <div className="flex space-x-6 text-sm text-[#81C784]">
              <a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Conditions d'utilisation</a>
              <a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Politique de confidentialité</a>
              <a href="#" className="hover:text-[#4CAF50] transition-all duration-300 ease-in-out font-['Inter']">Mentions légales</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}