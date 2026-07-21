import { Sparkles } from 'lucide-react';

export default function BuyPremiumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  Membresía Vida Total
                </span>
              </h1>
              <Sparkles className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-400 animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
