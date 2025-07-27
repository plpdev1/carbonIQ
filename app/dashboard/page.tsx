'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Plus, MapPin, Calendar, Sprout, LogOut, TrendingUp, Shield, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Farm {
  id: string;
  name: string;
  land_size: number;
  crop_types: string[];
  farming_practices: string[];
  planting_date: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  carbon_credits: number | null;
  confidence_score: number | null;
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/auth');
      return;
    }

    setUser(session.user);
    await fetchFarms(session.user.id);
    setLoading(false);
  };

  const fetchFarms = async (userId: string) => {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error fetching farms');
      console.error(error);
    } else {
      setFarms(data || []);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const totalCredits = farms.reduce((sum, farm) => sum + (farm.carbon_credits || 0), 0);
  const verifiedFarms = farms.filter(farm => farm.verification_status === 'verified').length;
  const pendingFarms = farms.filter(farm => farm.verification_status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">CarbonIQ</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.user_metadata?.full_name || user?.email}
              </span>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your farms and track carbon credit verification</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Farms</CardTitle>
              <Sprout className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{farms.length}</div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Farms</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verifiedFarms}</div>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingFarms}</div>
            </CardContent>
          </Card>
          
          <Card className="border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carbon Credits</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCredits.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">tons CO₂</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link href="/dashboard/add-farm">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Farm
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              Browse Marketplace
            </Button>
          </Link>
        </div>

        {/* Farms List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Farms</h2>
          
          {farms.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sprout className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No farms added yet</h3>
                <p className="text-gray-600 text-center mb-6">
                  Get started by adding your first farm for carbon credit verification
                </p>
                <Link href="/dashboard/add-farm">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Farm
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farms.map((farm) => (
                <Card key={farm.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{farm.name}</CardTitle>
                      {getStatusBadge(farm.verification_status)}
                    </div>
                    <CardDescription>
                      {farm.land_size} hectares • {farm.crop_types.join(', ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      Location mapped
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Planted: {new Date(farm.planting_date).toLocaleDateString()}
                    </div>
                    
                    {farm.verification_status === 'verified' && farm.carbon_credits && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-800">Carbon Credits</span>
                          <span className="text-lg font-bold text-green-900">
                            {farm.carbon_credits.toFixed(1)} tons CO₂
                          </span>
                        </div>
                        {farm.confidence_score && (
                          <div className="text-xs text-green-700 mt-1">
                            Confidence: {(farm.confidence_score * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {farm.farming_practices.map((practice, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {practice}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}