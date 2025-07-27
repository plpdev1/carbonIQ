'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, ArrowLeft, Search, Filter, MapPin, Calendar, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';

interface MarketplaceFarm {
  id: string;
  name: string;
  land_size: number;
  crop_types: string[];
  farming_practices: string[];
  carbon_credits: number;
  confidence_score: number;
  created_at: string;
  user_id: string;
}

export default function MarketplacePage() {
  const [farms, setFarms] = useState<MarketplaceFarm[]>([]);
  const [filteredFarms, setFilteredFarms] = useState<MarketplaceFarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchMarketplaceFarms();
  }, []);

  useEffect(() => {
    filterAndSortFarms();
  }, [farms, searchTerm, cropFilter, sortBy]);

  const fetchMarketplaceFarms = async () => {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('verification_status', 'verified')
      .not('carbon_credits', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching marketplace farms:', error);
    } else {
      setFarms(data || []);
    }
    setLoading(false);
  };

  const filterAndSortFarms = () => {
    let filtered = farms;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(farm => 
        farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farm.crop_types.some(crop => crop.toLowerCase().includes(searchTerm.toLowerCase())) ||
        farm.farming_practices.some(practice => practice.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Crop filter
    if (cropFilter !== 'all') {
      filtered = filtered.filter(farm => 
        farm.crop_types.includes(cropFilter)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'credits-high':
        filtered.sort((a, b) => b.carbon_credits - a.carbon_credits);
        break;
      case 'credits-low':
        filtered.sort((a, b) => a.carbon_credits - b.carbon_credits);
        break;
      case 'confidence':
        filtered.sort((a, b) => b.confidence_score - a.confidence_score);
        break;
    }

    setFilteredFarms(filtered);
  };

  const allCropTypes = Array.from(new Set(farms.flatMap(farm => farm.crop_types)));
  const totalCredits = farms.reduce((sum, farm) => sum + farm.carbon_credits, 0);

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
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Carbon Credits Marketplace</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse verified carbon credits from smallholder farmers worldwide. 
            Support sustainable agriculture while offsetting your carbon footprint.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-2xl font-bold text-gray-900">{farms.length}</p>
                <p className="text-gray-600">Verified Farms</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>
          
          <Card className="border-blue-200">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCredits.toFixed(1)}</p>
                <p className="text-gray-600">Total CO₂ Credits (tons)</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>
          
          <Card className="border-emerald-200">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-2xl font-bold text-gray-900">{allCropTypes.length}</p>
                <p className="text-gray-600">Crop Varieties</p>
              </div>
              <Leaf className="h-8 w-8 text-emerald-600" />
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search farms, crops, practices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={cropFilter} onValueChange={setCropFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crops</SelectItem>
                  {allCropTypes.map(crop => (
                    <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="credits-high">Most Credits</SelectItem>
                  <SelectItem value="credits-low">Least Credits</SelectItem>
                  <SelectItem value="confidence">Highest Confidence</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center text-sm text-gray-600">
                {filteredFarms.length} of {farms.length} farms
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marketplace Grid */}
        {filteredFarms.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No farms found</h3>
              <p className="text-gray-600 text-center">
                Try adjusting your search criteria or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFarms.map((farm) => (
              <Card key={farm.id} className="hover:shadow-lg transition-shadow duration-300 border-green-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{farm.name}</CardTitle>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Verified
                    </Badge>
                  </div>
                  <CardDescription>
                    {farm.land_size} hectares • {farm.crop_types.join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Carbon Credits</span>
                      <span className="text-2xl font-bold text-green-900">
                        {farm.carbon_credits.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-xs text-green-700">
                      tons CO₂ • {(farm.confidence_score * 100).toFixed(0)}% confidence
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Verified: {new Date(farm.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {farm.farming_practices.slice(0, 3).map((practice, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {practice}
                      </Badge>
                    ))}
                    {farm.farming_practices.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{farm.farming_practices.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 border-none text-white">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to List Your Farm?</h2>
            <p className="text-xl text-green-100 mb-6 max-w-2xl mx-auto">
              Join our marketplace and start earning from your sustainable farming practices. 
              Get your carbon credits verified in minutes with our AI-powered platform.
            </p>
            <Link href="/dashboard/add-farm">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                List Your Farm
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}