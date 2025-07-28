'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, Search, Filter, MapPin, Calendar, TrendingUp, Shield, ShoppingCart, Eye, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';

interface CarbonProject {
  id: string;
  name: string;
  location: string;
  country: string;
  land_size: number;
  crop_types: string[];
  farming_practices: string[];
  carbon_credits: number;
  price_per_credit: number;
  confidence_score: number;
  created_at: string;
  user_id: string;
  project_type: string;
  description?: string;
}

// Mock data for global carbon projects
const globalProjects: CarbonProject[] = [
  {
    id: 'global-1',
    name: 'Amazonian Reforestation Initiative',
    location: 'Amazon Basin',
    country: 'Brazil',
    land_size: 1250,
    crop_types: ['Forest Restoration'],
    farming_practices: ['Reforestation', 'Biodiversity Conservation'],
    carbon_credits: 3500,
    price_per_credit: 15,
    confidence_score: 0.95,
    created_at: '2024-01-15',
    user_id: 'global-user-1',
    project_type: 'Forestry',
    description: 'Large-scale reforestation project in the Amazon rainforest focusing on native species restoration and biodiversity conservation.'
  },
  {
    id: 'global-2',
    name: 'East African Soil Carbon Project',
    location: 'Central Kenya',
    country: 'Kenya',
    land_size: 780,
    crop_types: ['Maize', 'Beans', 'Sorghum'],
    farming_practices: ['No-till farming', 'Cover cropping', 'Composting'],
    carbon_credits: 1200,
    price_per_credit: 12,
    confidence_score: 0.88,
    created_at: '2024-02-10',
    user_id: 'global-user-2',
    project_type: 'Regenerative Agriculture',
    description: 'Regenerative agriculture project working with smallholder farmers to improve soil health and carbon sequestration.'
  },
  {
    id: 'global-3',
    name: 'Pacific Coast Blue Carbon',
    location: 'Coastal Mangroves',
    country: 'Indonesia',
    land_size: 450,
    crop_types: ['Mangrove Restoration'],
    farming_practices: ['Mangrove Planting', 'Coastal Protection'],
    carbon_credits: 2100,
    price_per_credit: 18,
    confidence_score: 0.92,
    created_at: '2024-01-28',
    user_id: 'global-user-3',
    project_type: 'Blue Carbon',
    description: 'Mangrove restoration project protecting coastal ecosystems while sequestering carbon in marine environments.'
  }
];

export default function MarketplacePage() {
  const [userFarms, setUserFarms] = useState<CarbonProject[]>([]);
  const [allProjects, setAllProjects] = useState<CarbonProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<CarbonProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectTypeFilter, setProjectTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProject, setSelectedProject] = useState<CarbonProject | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchMarketplaceProjects();
  }, []);

  useEffect(() => {
    filterAndSortProjects();
  }, [allProjects, searchTerm, projectTypeFilter, sortBy]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const fetchMarketplaceProjects = async () => {
    // Fetch user's verified farms
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('verification_status', 'verified')
      .not('carbon_credits', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user farms:', error);
    } else {
      // Transform user farms to match CarbonProject interface
      const transformedFarms = (data || []).map(farm => ({
        ...farm,
        location: 'User Farm',
        country: 'Local',
        price_per_credit: 10 + Math.random() * 8, // Random price between $10-18
        project_type: 'Smallholder Agriculture',
        description: `Sustainable farming project with ${farm.crop_types.join(', ')} using ${farm.farming_practices.join(', ')}.`
      }));
      
      setUserFarms(transformedFarms);
      // Combine user farms with global projects
      setAllProjects([...globalProjects, ...transformedFarms]);
    }
    setLoading(false);
  };

  const filterAndSortProjects = () => {
    let filtered = allProjects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Project type filter
    if (projectTypeFilter !== 'all') {
      filtered = filtered.filter(project => 
        project.project_type === projectTypeFilter
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
      case 'price-low':
        filtered.sort((a, b) => a.price_per_credit - b.price_per_credit);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price_per_credit - a.price_per_credit);
        break;
    }

    setFilteredProjects(filtered);
  };

  const allProjectTypes = Array.from(new Set(allProjects.map(project => project.project_type)));
  const totalCredits = allProjects.reduce((sum, project) => sum + project.carbon_credits, 0);

  const handlePurchase = (project: CarbonProject) => {
    toast.success(`Purchase initiated for ${project.name}. You will be contacted by the project developer.`);
  };

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
            Browse verified carbon credits from projects around the world and connect directly with project developers.
            Support sustainable agriculture while offsetting your carbon footprint.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-2xl font-bold text-gray-900">{allProjects.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{allProjectTypes.length}</p>
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
                  placeholder="Search projects, locations, types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={projectTypeFilter} onValueChange={setProjectTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {allProjectTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
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
                  <SelectItem value="price-low">Lowest Price</SelectItem>
                  <SelectItem value="price-high">Highest Price</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center text-sm text-gray-600">
                {filteredProjects.length} of {allProjects.length} projects
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Farm CTA for authenticated users */}
        {user && (
          <Card className="mb-8 bg-gradient-to-r from-green-600 to-emerald-600 border-none text-white">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-xl font-bold mb-2">List Your Farm</h3>
                <p className="text-green-100">
                  Get your carbon credits verified and join the marketplace
                </p>
              </div>
              <Link href="/dashboard/add-farm">
                <Button className="bg-white text-green-600 hover:bg-gray-100">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Farm
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 text-center">
                Try adjusting your search criteria or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow duration-300 border-green-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Verified
                    </Badge>
                  </div>
                  <CardDescription>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {project.location}, {project.country}
                    </div>
                    <div className="text-sm">
                      {project.land_size} hectares • {project.project_type}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-xs text-green-700 mb-1">Available Credits</div>
                      <div className="text-lg font-bold text-green-900">
                        {project.carbon_credits.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-xs text-blue-700 mb-1">Price per Credit</div>
                      <div className="text-lg font-bold text-blue-900">
                        ${project.price_per_credit}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Listed: {new Date(project.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{project.name}</DialogTitle>
                          <DialogDescription>
                            {project.location}, {project.country} • {project.project_type}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-gray-700">{project.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Project Details</h4>
                              <ul className="text-sm space-y-1">
                                <li>Land Size: {project.land_size} hectares</li>
                                <li>Available Credits: {project.carbon_credits.toLocaleString()}</li>
                                <li>Price: ${project.price_per_credit} per credit</li>
                                <li>Confidence: {(project.confidence_score * 100).toFixed(0)}%</li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Practices</h4>
                              <div className="flex flex-wrap gap-1">
                                {project.farming_practices.map((practice, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {practice}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-4">
                            <Button 
                              onClick={() => handlePurchase(project)}
                              className="bg-green-600 hover:bg-green-700 flex-1"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Purchase Credits
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      onClick={() => handlePurchase(project)}
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Purchase
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action for non-authenticated users */}
        {!user && (
          <Card className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 border-none text-white">
            <CardContent className="text-center py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to List Your Farm?</h2>
              <p className="text-xl text-green-100 mb-6 max-w-2xl mx-auto">
                Join our marketplace and start earning from your sustainable farming practices. 
                Get your carbon credits verified in minutes with our AI-powered platform.
              </p>
              <Link href="/auth">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}