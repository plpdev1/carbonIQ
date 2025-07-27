'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, MapPin, Shield, Zap, ArrowRight, Users, Globe } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">CarbonIQ</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link href="/dashboard">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <div className="space-x-2">
                  <Link href="/auth">
                    <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Carbon
            <span className="text-green-600 block">Verification Platform</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Helping smallholder farmers verify and monetize their carbon credits through 
            cutting-edge AI technology and satellite imagery analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4">
                Start Verification
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 text-lg px-8 py-4">
                Browse Credits
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="text-center">
            <div className="flex justify-center items-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">10,000+</div>
            <div className="text-gray-600">Farmers Verified</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center items-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">50,000</div>
            <div className="text-gray-600">Tons CO₂ Verified</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center items-center w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-4">
              <Shield className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">98%</div>
            <div className="text-gray-600">Accuracy Rate</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How CarbonIQ Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform makes carbon credit verification simple, 
              accurate, and accessible for farmers worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-green-200 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-center items-center w-12 h-12 bg-green-100 rounded-full mb-4">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl text-center">Submit Farm Data</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base">
                  Upload your farm details, draw land boundaries on our interactive map, 
                  and share information about your crops and farming practices.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-center items-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-center">AI Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base">
                  Our AI analyzes your data against satellite imagery and IPCC standards 
                  to automatically verify your carbon sequestration claims.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-center items-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle className="text-xl text-center">Get Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base">
                  Receive verified carbon credits that you can list on our marketplace 
                  or sell to buyers looking for sustainable investments.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Verify Your Carbon Credits?
          </h2>
          <p className="text-xl text-green-100 mb-10">
            Join thousands of farmers who are already monetizing their sustainable practices 
            through our AI-powered verification platform.
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-4">
              Start Your Verification
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Leaf className="h-6 w-6 text-green-400" />
              <span className="text-xl font-bold">CarbonIQ</span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p>&copy; 2025 CarbonIQ. All rights reserved.</p>
              <p className="mt-1">Empowering sustainable agriculture through AI</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}